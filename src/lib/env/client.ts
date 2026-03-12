import { EnvValidationError } from './errors'
import { publicEnvSchema, type PublicEnv } from './shared'

let cachedClientEnv: PublicEnv | undefined

export function getClientEnv(): PublicEnv {
  if (cachedClientEnv) {
    return cachedClientEnv
  }

  const parsedEnv = publicEnvSchema.safeParse(process.env)

  if (!parsedEnv.success) {
    throw new EnvValidationError('client', parsedEnv.error)
  }

  cachedClientEnv = parsedEnv.data

  return cachedClientEnv
}
