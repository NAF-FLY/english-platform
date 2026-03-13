import 'server-only'

import { createLogger } from '@/src/lib/logger'
import { getSupabaseConfigurationSnapshot } from '@/src/lib/supabase/config'

import { getServerEnv } from './server'

declare global {
  var __englishPlatformRuntimeLogged: boolean | undefined
}

export type RuntimeConfiguration = {
  appUrl: string
  logLevel: 'debug' | 'info' | 'warn' | 'error'
  nodeEnv: 'development' | 'test' | 'production'
  supabase: ReturnType<typeof getSupabaseConfigurationSnapshot>
}

export function getMetadataBase() {
  return new URL(getServerEnv().NEXT_PUBLIC_APP_URL)
}

export function getRuntimeConfiguration(): RuntimeConfiguration {
  const env = getServerEnv()

  return {
    appUrl: env.NEXT_PUBLIC_APP_URL,
    logLevel: env.LOG_LEVEL,
    nodeEnv: env.NODE_ENV,
    supabase: getSupabaseConfigurationSnapshot(),
  }
}

export function reportRuntimeConfiguration() {
  const runtimeConfiguration = getRuntimeConfiguration()
  const logger = createLogger({ scope: 'startup' })

  if (globalThis.__englishPlatformRuntimeLogged) {
    return runtimeConfiguration
  }

  if (runtimeConfiguration.logLevel === 'debug') {
    logger.debug('runtime configuration validated', {
      logLevel: runtimeConfiguration.logLevel,
      nodeEnv: runtimeConfiguration.nodeEnv,
      supabaseAdminConfigured: runtimeConfiguration.supabase.adminClientConfigured,
      supabaseMode: runtimeConfiguration.supabase.mode,
      supabasePublicConfigured: runtimeConfiguration.supabase.publicClientConfigured,
    })
  }

  if (runtimeConfiguration.logLevel === 'info') {
    logger.info('runtime configuration validated', {
      logLevel: runtimeConfiguration.logLevel,
      nodeEnv: runtimeConfiguration.nodeEnv,
      supabaseAdminConfigured: runtimeConfiguration.supabase.adminClientConfigured,
      supabaseMode: runtimeConfiguration.supabase.mode,
      supabasePublicConfigured: runtimeConfiguration.supabase.publicClientConfigured,
    })
  }

  globalThis.__englishPlatformRuntimeLogged = true

  return runtimeConfiguration
}
