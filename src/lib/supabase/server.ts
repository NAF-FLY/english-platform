import 'server-only'

import { createServerClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

import { createLogger } from '@/src/lib/logger'
import { AppError } from '@/src/shared/types'

import { getSupabasePublicConfig } from './config'
import type { Database } from './types'

const logger = createLogger({ scope: 'supabase' })

export type ServerSupabaseClient = SupabaseClient<Database>

export async function createServerSupabaseClient(): Promise<ServerSupabaseClient> {
  const cookieStore = await cookies()

  try {
    const { anonKey, url } = getSupabasePublicConfig()

    return createServerClient<Database>(url, anonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, options, value }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            logger.warn(
              'supabase server client could not persist cookies in the current context',
              { target: 'server-client' },
              error,
            )
          }
        },
      },
    })
  } catch (error) {
    logger.error('failed to create supabase server client', { target: 'server-client' }, error)

    if (error instanceof AppError) {
      throw error
    }

    throw new AppError('UNEXPECTED', 'Failed to create Supabase server client.', {
      cause: error,
      context: {
        target: 'server-client',
      },
    })
  }
}

export type { SupabaseClient }
