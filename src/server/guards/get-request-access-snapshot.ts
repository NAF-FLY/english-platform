import 'server-only'

import { createLogger } from '@/src/lib/logger'
import { isSupabaseMissingSessionError } from '@/src/modules/auth/infrastructure/supabase-auth-error'
import {
  createServerSupabaseClient,
  getProfileSnapshot,
  getRoleSnapshots,
  type PlatformRole,
  type ProfileSnapshot,
} from '@/src/lib/supabase'
import { AppError } from '@/src/shared/types'

const logger = createLogger({ scope: 'access-guard' })

export type RequestAccessUser = {
  email: string | null
  id: string
  profile: ProfileSnapshot | null
  roles: PlatformRole[]
}

export type RequestAccessSnapshot = {
  isAdmin: boolean
  isAuthenticated: boolean
  isInternal: boolean
  user: RequestAccessUser | null
}

export async function getRequestAccessSnapshot(): Promise<RequestAccessSnapshot> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      if (isSupabaseMissingSessionError(error)) {
        return createAnonymousAccessSnapshot()
      }

      throw new AppError('UNEXPECTED', 'Failed to resolve authenticated user.', {
        cause: error,
        context: {
          boundary: 'access',
          operation: 'auth.getUser',
        },
      })
    }

    if (!data.user) {
      return createAnonymousAccessSnapshot()
    }

    const [profile, roles] = await Promise.all([
      getProfileSnapshot(supabase, data.user.id),
      getRoleSnapshots(supabase, data.user.id),
    ])

    const isAdmin = roles.includes('admin')
    const isInternal = isAdmin || roles.includes('staff')

    return {
      isAdmin,
      isAuthenticated: true,
      isInternal,
      user: {
        email: data.user.email ?? null,
        id: data.user.id,
        profile,
        roles,
      },
    }
  } catch (error) {
    logger.error('failed to resolve request access snapshot', {
      boundary: 'access',
      operation: 'getRequestAccessSnapshot',
    }, error)

    if (error instanceof AppError) {
      throw error
    }

    throw new AppError('UNEXPECTED', 'Failed to resolve request access snapshot.', {
      cause: error,
      context: {
        boundary: 'access',
        operation: 'getRequestAccessSnapshot',
      },
    })
  }
}

function createAnonymousAccessSnapshot(): RequestAccessSnapshot {
  return {
    isAdmin: false,
    isAuthenticated: false,
    isInternal: false,
    user: null,
  }
}
