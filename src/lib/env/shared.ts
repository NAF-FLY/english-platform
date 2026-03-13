import { z } from 'zod'

const emptyStringToUndefined = (value: unknown) => {
  if (typeof value !== 'string') {
    return value
  }

  const trimmedValue = value.trim()

  return trimmedValue === '' ? undefined : trimmedValue
}

const csvToStringArray = (value: unknown) => {
  if (value === undefined) {
    return []
  }

  if (typeof value !== 'string') {
    return value
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

const internalPathSchema = z
  .string()
  .trim()
  .regex(/^\/(?!\/).*/, 'Expected an internal path that starts with a single "/".')

const redirectOriginSchema = z
  .string()
  .trim()
  .url()
  .transform((value) => new URL(value).origin)

export const logLevelValues = ['debug', 'info', 'warn', 'error'] as const

export const logLevelSchema = z.enum(logLevelValues)

export const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().trim().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.preprocess(
    emptyStringToUndefined,
    z.string().trim().url().optional(),
  ),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.preprocess(
    emptyStringToUndefined,
    z.string().trim().min(1).optional(),
  ),
})

export const serverEnvSchema = publicEnvSchema.extend({
  AUTH_ALLOWED_REDIRECT_ORIGINS: z.preprocess(
    csvToStringArray,
    z.array(redirectOriginSchema),
  ).default([]),
  AUTH_CALLBACK_PATH: z.preprocess(
    emptyStringToUndefined,
    internalPathSchema.default('/callback'),
  ),
  AUTH_DEFAULT_RETURN_TO_PATH: z.preprocess(
    emptyStringToUndefined,
    internalPathSchema.default('/cabinet'),
  ),
  AUTH_ERROR_PATH: z.preprocess(
    emptyStringToUndefined,
    internalPathSchema.default('/auth-error'),
  ),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: logLevelSchema.default('info'),
  SUPABASE_SERVICE_ROLE_KEY: z.preprocess(
    emptyStringToUndefined,
    z.string().trim().min(1).optional(),
  ),
})

export type LogLevel = z.infer<typeof logLevelSchema>
export type PublicEnv = z.infer<typeof publicEnvSchema>
export type ServerEnv = z.infer<typeof serverEnvSchema>
