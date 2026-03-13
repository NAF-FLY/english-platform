import 'server-only'

import { createLogger } from '@/src/lib/logger'
import type { PlatformRole, ProfileSnapshot } from '@/src/lib/supabase'
import { getRequestAccessSnapshot } from '@/src/server/guards/get-request-access-snapshot'
import { AppError } from '@/src/shared/types'

const logger = createLogger({ scope: 'auth-adapter' })

export type AuthProfileSnapshot = ProfileSnapshot
export type AuthRole = PlatformRole

export type AuthUserSnapshot = {
  email: string | null
  id: string
  profile: AuthProfileSnapshot | null
  roles: AuthRole[]
}

export type AuthStateSnapshot = {
  user: AuthUserSnapshot | null
}

export async function getSupabaseAuthState(): Promise<AuthStateSnapshot> {
  try {
    const access = await getRequestAccessSnapshot()

    if (!access.user) {
      return { user: null }
    }

    return {
      user: {
        email: access.user.email,
        id: access.user.id,
        profile: access.user.profile,
        roles: access.user.roles,
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
