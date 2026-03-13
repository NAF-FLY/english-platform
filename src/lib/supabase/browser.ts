'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

import { getClientEnv } from '@/src/lib/env/client'
import { AppError } from '@/src/shared/types'

import type { Database } from './types'

export type BrowserSupabaseClient = SupabaseClient<Database>

let browserClient: BrowserSupabaseClient | undefined

export function createBrowserSupabaseClient(): BrowserSupabaseClient {
  if (browserClient) {
    return browserClient
  }

  const env = getClientEnv()

  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new AppError('ENV_INVALID', 'Supabase browser client is not configured.', {
      context: {
        missingAnonKey: !env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        missingUrl: !env.NEXT_PUBLIC_SUPABASE_URL,
        target: 'browser-client',
      },
    })
  }

  browserClient = createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  )

  return browserClient
}
