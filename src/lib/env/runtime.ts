import 'server-only'

import { getServerEnv } from './server'

declare global {
  var __englishPlatformRuntimeLogged: boolean | undefined
}

export type RuntimeConfiguration = {
  appUrl: string
  logLevel: 'debug' | 'info' | 'warn' | 'error'
  nodeEnv: 'development' | 'test' | 'production'
  supabaseConfigured: boolean
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
    supabaseConfigured: Boolean(
      env.NEXT_PUBLIC_SUPABASE_URL &&
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
        env.SUPABASE_SERVICE_ROLE_KEY,
    ),
  }
}

export function reportRuntimeConfiguration() {
  const runtimeConfiguration = getRuntimeConfiguration()

  if (globalThis.__englishPlatformRuntimeLogged) {
    return runtimeConfiguration
  }

  if (runtimeConfiguration.logLevel === 'debug') {
    console.debug('[startup] runtime configuration validated', {
      logLevel: runtimeConfiguration.logLevel,
      nodeEnv: runtimeConfiguration.nodeEnv,
      supabaseConfigured: runtimeConfiguration.supabaseConfigured,
    })
  }

  if (runtimeConfiguration.logLevel === 'info') {
    console.info('[startup] runtime configuration validated', {
      logLevel: runtimeConfiguration.logLevel,
      nodeEnv: runtimeConfiguration.nodeEnv,
      supabaseConfigured: runtimeConfiguration.supabaseConfigured,
    })
  }

  globalThis.__englishPlatformRuntimeLogged = true

  return runtimeConfiguration
}
