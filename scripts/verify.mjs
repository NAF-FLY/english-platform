import {
  extractMigrationVersions,
  getAppSupabaseEnv,
  getLocalMigrationVersions,
  getStatusEnv,
  localSupabaseDefaults,
  runCommand,
  runSupabaseCommand,
  supabaseRunner,
} from './supabase-local.mjs'

const shouldVerifySupabase = process.argv.includes('--supabase')

const checks = [
  ['lint', [supabaseRunner, ['run', 'lint']]],
  ['typecheck', [supabaseRunner, ['run', 'typecheck']]],
  ['build', [supabaseRunner, ['run', 'build']]],
]

for (const [label, [command, args]] of checks) {
  console.log(`\n[verify] running ${label}`)

  const result = runCommand(command, args, {
    stdio: 'inherit',
  })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

if (shouldVerifySupabase) {
  verifySupabase()
}

console.log('\n[verify] all checks passed')

function verifySupabase() {
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

  console.log('[verify] local supabase stack is reachable and migration versions match the repository')
}
