import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import {
  extractMigrationVersions,
  getAppSupabaseEnv,
  getLocalMigrationVersions,
  getStatusEnv,
  localSupabaseDefaults,
  projectRoot,
  runCommand,
  runSupabaseCommand,
  supabaseRunner,
} from './supabase-local.mjs'
import { verifyAuthMilestone } from './auth-smoke.mjs'

const shouldVerifySupabase = process.argv.includes('--supabase')
const shouldSkipBaselineChecks = process.argv.includes('--auth-only')
const generatedTypesPath = join(projectRoot, 'src/lib/supabase/types.ts')
const seededProfiles = [
  {
    display_name: 'Polyglot Learner',
    roleSet: ['learner'],
    user_id: '11111111-1111-4111-8111-111111111111',
    username: 'polyglot-learner',
  },
  {
    display_name: 'Polyglot Staff',
    roleSet: ['learner', 'staff'],
    user_id: '22222222-2222-4222-8222-222222222222',
    username: 'polyglot-staff',
  },
  {
    display_name: 'Platform Admin',
    roleSet: ['admin', 'learner'],
    user_id: '33333333-3333-4333-8333-333333333333',
    username: 'polyglot-admin',
  },
]

const checks = [
  ['lint', [supabaseRunner, ['run', 'lint']]],
  ['typecheck', [supabaseRunner, ['run', 'typecheck']]],
  ['build', [supabaseRunner, ['run', 'build']]],
]

if (!shouldSkipBaselineChecks) {
  for (const [label, [command, args]] of checks) {
    console.log(`\n[verify] running ${label}`)

    const result = runCommand(command, args, {
      stdio: 'inherit',
    })

    if (result.status !== 0) {
      process.exit(result.status ?? 1)
    }
  }
}

if (shouldVerifySupabase) {
  await verifySupabase()
}

console.log('\n[verify] all checks passed')

async function verifySupabase() {
  console.log('\n[verify] checking local supabase status')

  const status = getStatusEnv()

  if (!status.ok) {
    console.error('[verify] local supabase stack is unavailable')
    console.error(`[verify] ${status.error}`)
    console.error('[verify] run `pnpm supabase:start` first, then retry `pnpm verify:supabase`')
    process.exit(1)
  }

  const appEnv = getAppSupabaseEnv(status.env)
  const missingEnv = Object.entries(appEnv)
    .filter(([, value]) => !value)
    .map(([key]) => key)

  if (missingEnv.length > 0) {
    console.error('[verify] local supabase stack is missing exported credentials')
    console.error(`[verify] missing: ${missingEnv.join(', ')}`)
    process.exit(1)
  }

  if (appEnv.NEXT_PUBLIC_SUPABASE_URL !== localSupabaseDefaults.NEXT_PUBLIC_SUPABASE_URL) {
    console.warn('[verify] local supabase api url differs from the documented default', {
      actual: appEnv.NEXT_PUBLIC_SUPABASE_URL,
      expected: localSupabaseDefaults.NEXT_PUBLIC_SUPABASE_URL,
    })
  }

  console.log('\n[verify] linting local supabase schema')
  const lintResult = runSupabaseCommand(['db', 'lint', '--local'], {
    stdio: 'inherit',
  })

  if (lintResult.status !== 0) {
    process.exit(lintResult.status ?? 1)
  }

  console.log('\n[verify] checking applied migration versions')
  const migrationListResult = runSupabaseCommand(['migration', 'list', '--local'])

  if (migrationListResult.status !== 0) {
    console.error(migrationListResult.stderr || migrationListResult.stdout)
    process.exit(migrationListResult.status ?? 1)
  }

  const localMigrationVersions = getLocalMigrationVersions()
  const appliedMigrationVersions = extractMigrationVersions(migrationListResult.stdout)

  const missingAppliedVersions = localMigrationVersions.filter(
    (version) => !appliedMigrationVersions.has(version),
  )

  const extraAppliedVersions = [...appliedMigrationVersions].filter(
    (version) => !localMigrationVersions.includes(version),
  )

  if (missingAppliedVersions.length > 0 || extraAppliedVersions.length > 0) {
    console.error('[verify] local migration state does not match checked-in migrations')

    if (missingAppliedVersions.length > 0) {
      console.error(`[verify] missing applied versions: ${missingAppliedVersions.join(', ')}`)
    }

    if (extraAppliedVersions.length > 0) {
      console.error(`[verify] unexpected applied versions: ${extraAppliedVersions.join(', ')}`)
    }

    console.error('[verify] run `pnpm supabase:reset` to realign the local database')
    process.exit(1)
  }

  await verifySeedData(appEnv)
  verifyGeneratedTypes()
  await verifyAuthMilestone({
    appEnv,
    appUrl: getConfiguredAppUrl(),
  })

  console.log('[verify] local supabase stack is reachable and migration versions match the repository')
}

async function verifySeedData(appEnv) {
  console.log('\n[verify] checking deterministic seed fixtures')

  const [profiles, roleMemberships] = await Promise.all([
    fetchRestRows({
      apiKey: appEnv.SUPABASE_SERVICE_ROLE_KEY,
      path: 'profiles?select=id,username,display_name&order=username.asc',
      projectUrl: appEnv.NEXT_PUBLIC_SUPABASE_URL,
    }),
    fetchRestRows({
      apiKey: appEnv.SUPABASE_SERVICE_ROLE_KEY,
      path: 'user_role_memberships?select=user_id,role,granted_by',
      projectUrl: appEnv.NEXT_PUBLIC_SUPABASE_URL,
    }),
  ])

  const rolesByUserId = roleMemberships.reduce((accumulator, membership) => {
    const roles = accumulator.get(membership.user_id) ?? new Set()
    roles.add(membership.role)
    accumulator.set(membership.user_id, roles)
    return accumulator
  }, new Map())

  for (const expectedProfile of seededProfiles) {
    const actualProfile = profiles.find((profile) => profile.id === expectedProfile.user_id)

    if (!actualProfile) {
      console.error(`[verify] missing seeded profile fixture: ${expectedProfile.username}`)
      console.error('[verify] run `pnpm supabase:reset` to reload deterministic local fixtures')
      process.exit(1)
    }

    if (
      actualProfile.username !== expectedProfile.username
      || actualProfile.display_name !== expectedProfile.display_name
    ) {
      console.error(`[verify] seeded profile fixture drift detected: ${expectedProfile.username}`)
      console.error('[verify] expected:', expectedProfile)
      console.error('[verify] actual:', actualProfile)
      console.error('[verify] run `pnpm supabase:reset` to realign local seed data')
      process.exit(1)
    }

    const actualRoleSet = rolesByUserId.get(expectedProfile.user_id) ?? new Set()
    const actualRoles = [...actualRoleSet].sort()
    const expectedRoles = [...expectedProfile.roleSet].sort()

    if (actualRoles.join(',') !== expectedRoles.join(',')) {
      console.error(`[verify] seeded role fixture drift detected for: ${expectedProfile.username}`)
      console.error(`[verify] expected roles: ${expectedRoles.join(', ')}`)
      console.error(`[verify] actual roles: ${actualRoles.join(', ') || '(none)'}`)
      console.error('[verify] run `pnpm supabase:reset` to realign local seed data')
      process.exit(1)
    }
  }

  console.log('[verify] deterministic seed fixtures are present')
}

function verifyGeneratedTypes() {
  console.log('\n[verify] checking generated Supabase types')

  const typesResult = runSupabaseCommand(['gen', 'types', 'typescript', '--local', '--schema', 'public'])

  if (typesResult.status !== 0) {
    console.error(typesResult.stderr || typesResult.stdout)
    process.exit(typesResult.status ?? 1)
  }

  const generatedTypes = normalizeText(typesResult.stdout)
  const checkedInTypes = normalizeText(readFileSync(generatedTypesPath, 'utf8'))

  if (generatedTypes !== checkedInTypes) {
    console.error('[verify] checked-in Supabase types are out of date')
    console.error('[verify] run `pnpm supabase:types` and commit the refreshed file')
    process.exit(1)
  }

  console.log('[verify] checked-in Supabase types match the local schema')
}

async function fetchRestRows({ apiKey, path, projectUrl }) {
  const response = await fetch(`${projectUrl}/rest/v1/${path}`, {
    headers: {
      apikey: apiKey,
      authorization: `Bearer ${apiKey}`,
    },
  })

  if (!response.ok) {
    console.error(`[verify] rest check failed for ${path}`)
    console.error(`[verify] ${response.status} ${response.statusText}`)
    console.error(`[verify] ${await response.text()}`)
    process.exit(1)
  }

  return response.json()
}

function normalizeText(value) {
  return value.replace(/\r\n/g, '\n').trimEnd()
}

function getConfiguredAppUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }

  const localEnvPath = join(projectRoot, '.env.local')

  if (!existsSync(localEnvPath)) {
    return 'http://localhost:3000'
  }

  const envFile = readFileSync(localEnvPath, 'utf8')
  const envEntries = envFile
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'))

  let appUrl = 'http://localhost:3000'

  for (const entry of envEntries) {
    const separatorIndex = entry.indexOf('=')

    if (separatorIndex === -1) {
      continue
    }

    const key = entry.slice(0, separatorIndex).trim()
    const value = entry.slice(separatorIndex + 1).trim().replace(/^"(.*)"$/, '$1')

    if (key === 'NEXT_PUBLIC_APP_URL' && value) {
      appUrl = value
    }
  }

  return appUrl
}
