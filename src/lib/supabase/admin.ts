import 'server-only'

import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

import { createLogger } from '@/src/lib/logger'
import { AppError } from '@/src/shared/types'

import { getSupabaseAdminConfig } from './config'
import type { Database } from './types'

const logger = createLogger({ scope: 'supabase-admin' })

export type AdminSupabaseClient = SupabaseClient<Database>

export function createAdminSupabaseClient(): AdminSupabaseClient {
  try {
    const { serviceRoleKey, url } = getSupabaseAdminConfig()

    return createClient<Database>(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  } catch (error) {
    logger.error('failed to create supabase admin client', { target: 'admin-client' }, error)

    if (error instanceof AppError) {
      throw error
    }

    throw new AppError('UNEXPECTED', 'Failed to create Supabase admin client.', {
      cause: error,
      context: {
        target: 'admin-client',
      },
    })
  }
}
