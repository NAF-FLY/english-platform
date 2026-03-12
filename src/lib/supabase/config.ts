import 'server-only'

import { getServerEnv } from '@/src/lib/env'
import { createLogger } from '@/src/lib/logger'
import { AppError } from '@/src/shared/types'

type PublicSupabaseConfig = {
  anonKey: string
  url: string
}

type AdminSupabaseConfig = PublicSupabaseConfig & {
  serviceRoleKey: string
}

const logger = createLogger({ scope: 'supabase' })

export function getSupabasePublicConfig(): PublicSupabaseConfig {
  const env = getServerEnv()
  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const missing = [
    !url ? 'NEXT_PUBLIC_SUPABASE_URL' : null,
    !anonKey ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY' : null,
  ].filter((value): value is string => value !== null)

  if (missing.length > 0 || !url || !anonKey) {
    logger.error('supabase public configuration is incomplete', {
      missingKeys: missing.join(','),
      target: 'public-client',
    })

    throw new AppError('ENV_INVALID', 'Supabase public configuration is incomplete.', {
      context: {
        missingKeys: missing.join(','),
        target: 'public-client',
      },
    })
  }

  return {
    anonKey,
    url,
  }
}

export function getSupabaseAdminConfig(): AdminSupabaseConfig {
  const env = getServerEnv()
  const publicConfig = getSupabasePublicConfig()
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceRoleKey) {
    logger.error('supabase admin configuration is incomplete', {
      missingKeys: 'SUPABASE_SERVICE_ROLE_KEY',
      target: 'admin-client',
    })

    throw new AppError('ENV_INVALID', 'Supabase admin configuration is incomplete.', {
      context: {
        missingKeys: 'SUPABASE_SERVICE_ROLE_KEY',
        target: 'admin-client',
      },
    })
  }

  return {
    ...publicConfig,
    serviceRoleKey,
  }
}
