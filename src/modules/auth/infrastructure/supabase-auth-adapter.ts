import 'server-only'

import { createLogger } from '@/src/lib/logger'
import { createServerSupabaseClient } from '@/src/lib/supabase/server'
import { AppError } from '@/src/shared/types'

const logger = createLogger({ scope: 'auth-adapter' })

export type AuthUserSnapshot = {
  email: string | null
  id: string
}

export type AuthStateSnapshot = {
  user: AuthUserSnapshot | null
}

export async function getSupabaseAuthState(): Promise<AuthStateSnapshot> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      logger.error('failed to resolve authenticated user from supabase', {
        boundary: 'auth',
        operation: 'auth.getUser',
      }, error)

      throw new AppError('UNEXPECTED', 'Failed to resolve authenticated user.', {
        cause: error,
        context: {
          boundary: 'auth',
          operation: 'auth.getUser',
        },
      })
    }

    if (!data.user) {
      return { user: null }
    }

    return {
      user: {
        email: data.user.email ?? null,
        id: data.user.id,
      },
    }
  } catch (error) {
    logger.error('supabase auth adapter execution failed', {
      boundary: 'auth',
      operation: 'getSupabaseAuthState',
    }, error)

    if (error instanceof AppError) {
      throw error
    }

    throw new AppError('UNEXPECTED', 'Supabase auth adapter execution failed.', {
      cause: error,
      context: {
        boundary: 'auth',
        operation: 'getSupabaseAuthState',
      },
    })
  }
}
