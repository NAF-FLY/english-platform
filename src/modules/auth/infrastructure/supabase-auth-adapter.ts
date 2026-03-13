import 'server-only'

import { createLogger } from '@/src/lib/logger'
import {
  createServerSupabaseClient,
  type ServerSupabaseClient,
} from '@/src/lib/supabase/server'
import type { Tables } from '@/src/lib/supabase/types'
import { AppError } from '@/src/shared/types'

const logger = createLogger({ scope: 'auth-adapter' })

export type AuthProfileSnapshot = Pick<Tables<'profiles'>, 'avatar_url' | 'display_name' | 'id' | 'username'>
export type AuthRole = Tables<'user_role_memberships'>['role']

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
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.auth.getUser()

    if (error) {
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

    const [profile, roles] = await Promise.all([
      getAuthProfileSnapshot(supabase, data.user.id),
      getAuthRoles(supabase, data.user.id),
    ])

    return {
      user: {
        email: data.user.email ?? null,
        id: data.user.id,
        profile,
        roles,
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

async function getAuthProfileSnapshot(
  supabase: ServerSupabaseClient,
  userId: string,
): Promise<AuthProfileSnapshot | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, username, avatar_url')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw new AppError('UNEXPECTED', 'Failed to resolve authenticated profile.', {
      cause: error,
      context: {
        boundary: 'auth',
        operation: 'profiles.select',
        table: 'profiles',
      },
    })
  }

  return data
}

async function getAuthRoles(
  supabase: ServerSupabaseClient,
  userId: string,
): Promise<AuthRole[]> {
  const { data, error } = await supabase
    .from('user_role_memberships')
    .select('role')
    .eq('user_id', userId)

  if (error) {
    throw new AppError('UNEXPECTED', 'Failed to resolve authenticated roles.', {
      cause: error,
      context: {
        boundary: 'auth',
        operation: 'user_role_memberships.select',
        table: 'user_role_memberships',
      },
    })
  }

  return data.map(({ role }) => role)
}
