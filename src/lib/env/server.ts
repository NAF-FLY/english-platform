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
    throw new EnvValidationError('server', parsedEnv.error)
  }

  cachedServerEnv = parsedEnv.data

  return cachedServerEnv
}
