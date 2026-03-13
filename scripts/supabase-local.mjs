import { existsSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))

export const projectRoot = resolve(scriptDirectory, '..')
export const supabaseDirectory = join(projectRoot, 'supabase')
export const migrationsDirectory = join(supabaseDirectory, 'migrations')
export const supabaseRunner = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'

export const localSupabaseDefaults = {
  NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:55321',
}

export function runCommand(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? projectRoot,
    encoding: 'utf8',
    shell: false,
    stdio: options.stdio ?? 'pipe',
  })

  return {
    ...result,
    stderr: result.stderr ?? '',
    stdout: result.stdout ?? '',
  }
}

export function runSupabaseCommand(args, options = {}) {
  return runCommand(supabaseRunner, ['exec', 'supabase', ...args], options)
}

export function getStatusEnv() {
  const result = runSupabaseCommand(['status', '-o', 'env'])

  if (result.status !== 0) {
    return {
      error: result.stderr.trim() || result.stdout.trim() || 'Supabase status command failed.',
      ok: false,
    }
  }

  return {
    env: parseEnvOutput(result.stdout),
    ok: true,
  }
}

export function getAppSupabaseEnv(statusEnv) {
  return {
    NEXT_PUBLIC_SUPABASE_URL: statusEnv.API_URL ?? '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: statusEnv.ANON_KEY ?? '',
    SUPABASE_SERVICE_ROLE_KEY: statusEnv.SERVICE_ROLE_KEY ?? '',
  }
}

export function getLocalMigrationVersions() {
  if (!existsSync(migrationsDirectory)) {
    return []
  }

  const migrationEntries = readdirSync(migrationsDirectory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.sql'))
    .map((entry) => entry.name)
    .sort()

  return migrationEntries
    .map((name) => name.match(/^(\d+)_/)?.[1] ?? null)
    .filter((value) => value !== null)
}

export function extractMigrationVersions(output) {
  return new Set(output.match(/\b\d{10,}\b/g) ?? [])
}

function parseEnvOutput(output) {
  return output
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce((env, line) => {
      const separatorIndex = line.indexOf('=')

      if (separatorIndex === -1) {
        return env
      }

      const key = line.slice(0, separatorIndex).trim()
      const rawValue = line.slice(separatorIndex + 1).trim()
      const value = rawValue.replace(/^"(.*)"$/, '$1')
      env[key] = value
      return env
    }, {})
}
