import { EnvValidationError } from './errors'
import { publicEnvSchema, type PublicEnv } from './shared'

let cachedClientEnv: PublicEnv | undefined

export function getClientEnv(): PublicEnv {
  if (cachedClientEnv) {
    return cachedClientEnv
  }

  const parsedEnv = publicEnvSchema.safeParse(process.env)

  if (!parsedEnv.success) {
    const error = new EnvValidationError('client', parsedEnv.error)

    console.error(JSON.stringify({
      context: {
        issues: error.issues.map(({ path }) => path).join(','),
        scope: 'client',
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

  cachedClientEnv = parsedEnv.data

  return cachedClientEnv
}
