import 'server-only'

import { EnvValidationError } from './errors'
import { serverEnvSchema, type ServerEnv } from './shared'

let cachedServerEnv: ServerEnv | undefined

export function getServerEnv(): ServerEnv {
  if (cachedServerEnv) {
    return cachedServerEnv
  }

  const parsedEnv = serverEnvSchema.safeParse(process.env)

  if (!parsedEnv.success) {
    const error = new EnvValidationError('server', parsedEnv.error)

    console.error(JSON.stringify({
      context: {
        issues: error.issues.map(({ path }) => path).join(','),
        scope: 'server',
      },
      error: {
        code: error.code,
        name: error.name,
      },
      level: 'error',
      message: 'environment validation failed',
      scope: 'env',
      timestamp: new Date().toISOString(),
    }))

    throw error
  }

  cachedServerEnv = parsedEnv.data

  return cachedServerEnv
}
