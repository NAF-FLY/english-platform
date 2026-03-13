import 'server-only'

import { AppError } from '@/src/shared/types'

import type { SupabaseClient } from './server'
import type { Tables } from './types'

export type ProfileSnapshot = Pick<
  Tables<'profiles'>,
  'avatar_url' | 'display_name' | 'id' | 'username'
>

export type PlatformRole = Tables<'user_role_memberships'>['role']

export async function getProfileSnapshot(
  supabase: SupabaseClient,
  userId: string,
): Promise<ProfileSnapshot | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, username, avatar_url')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw new AppError('UNEXPECTED', 'Failed to resolve profile snapshot.', {
      cause: error,
      context: {
        operation: 'profiles.select',
        table: 'profiles',
      },
    })
  }

  return data
}

export async function getRoleSnapshots(
  supabase: SupabaseClient,
  userId: string,
): Promise<PlatformRole[]> {
  const { data, error } = await supabase
    .from('user_role_memberships')
    .select('role')
    .eq('user_id', userId)

  if (error) {
    throw new AppError('UNEXPECTED', 'Failed to resolve role memberships.', {
      cause: error,
      context: {
        operation: 'user_role_memberships.select',
        table: 'user_role_memberships',
      },
    })
  }

  return data.map(({ role }) => role)
}

export async function checkTableAccess(
  supabase: SupabaseClient,
  table: 'profiles' | 'user_role_memberships',
) {
  const query = table === 'profiles'
    ? supabase.from('profiles').select('id').limit(1)
    : supabase.from('user_role_memberships').select('user_id').limit(1)

  const { error } = await query

  if (error) {
    throw new AppError('UNEXPECTED', `Failed to verify ${table} access.`, {
      cause: error,
      context: {
        operation: `${table}.select`,
        table,
      },
    })
  }
}
