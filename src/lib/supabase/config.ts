import 'server-only'

import { getServerEnv } from '@/src/lib/env/server'
import { createLogger } from '@/src/lib/logger'
import { AppError } from '@/src/shared/types'

type PublicSupabaseConfig = {
  anonKey: string
  url: string
}

type AdminSupabaseConfig = PublicSupabaseConfig & {
  serviceRoleKey: string
}

export type SupabaseConfigurationMode = 'external' | 'local' | 'missing'

export type SupabaseConfigurationSnapshot = {
  adminClientConfigured: boolean
  mode: SupabaseConfigurationMode
  publicClientConfigured: boolean
  urlOrigin: string | null
}

const logger = createLogger({ scope: 'supabase' })

export function getSupabaseConfigurationSnapshot(): SupabaseConfigurationSnapshot {
  const env = getServerEnv()
  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY

  if (!url) {
    return {
      adminClientConfigured: false,
      mode: 'missing',
      publicClientConfigured: false,
      urlOrigin: null,
    }
  }

  const parsedUrl = new URL(url)
  const isLocalHost = parsedUrl.hostname === '127.0.0.1' || parsedUrl.hostname === 'localhost'

  return {
    adminClientConfigured: Boolean(url && anonKey && serviceRoleKey),
    mode: isLocalHost ? 'local' : 'external',
    publicClientConfigured: Boolean(url && anonKey),
    urlOrigin: parsedUrl.origin,
  }
}

export function getSupabasePublicConfig(): PublicSupabaseConfig {
  const env = getServerEnv()
  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const snapshot = getSupabaseConfigurationSnapshot()

  const missing = [
    !url ? 'NEXT_PUBLIC_SUPABASE_URL' : null,
    !anonKey ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY' : null,
  ].filter((value): value is string => value !== null)

  if (missing.length > 0 || !url || !anonKey) {
    logger.error('supabase public configuration is incomplete', {
      missingKeys: missing.join(','),
      mode: snapshot.mode,
      target: 'public-client',
    })

    throw new AppError('ENV_INVALID', 'Supabase public configuration is incomplete.', {
      context: {
        missingKeys: missing.join(','),
        mode: snapshot.mode,
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
  const snapshot = getSupabaseConfigurationSnapshot()

  if (!serviceRoleKey) {
    logger.error('supabase admin configuration is incomplete', {
      missingKeys: 'SUPABASE_SERVICE_ROLE_KEY',
      mode: snapshot.mode,
      target: 'admin-client',
    })

    throw new AppError('ENV_INVALID', 'Supabase admin configuration is incomplete.', {
      context: {
        missingKeys: 'SUPABASE_SERVICE_ROLE_KEY',
        mode: snapshot.mode,
        target: 'admin-client',
      },
    })
  }

  return {
    ...publicConfig,
    serviceRoleKey,
  }
}
