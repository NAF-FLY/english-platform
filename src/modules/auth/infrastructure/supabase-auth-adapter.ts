import 'server-only'

import { createServerSupabaseClient } from '@/src/lib/supabase'
import { getRequestAccessSnapshot } from '@/src/server/guards/get-request-access-snapshot'
import { AppError } from '@/src/shared/types'

import type {
  AuthStateResult,
  SignInWithPasswordInput,
  SignUpWithPasswordInput,
} from '../types'

type SignUpWithPasswordAdapterInput = SignUpWithPasswordInput & {
  emailRedirectTo: string
}

export async function readSupabaseAuthState(): Promise<AuthStateResult> {
  try {
    const access = await getRequestAccessSnapshot()

    if (!access.user) {
      return {
        status: 'anonymous',
        user: null,
      }
    }

    return {
      status: 'authenticated',
      user: {
        email: access.user.email,
        id: access.user.id,
        profile: access.user.profile,
        roles: access.user.roles,
      },
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }

    throw new AppError('UNEXPECTED', 'Failed to read auth state from Supabase.', {
      cause: error,
      context: {
        boundary: 'auth',
        operation: 'readSupabaseAuthState',
      },
    })
  }
}

export async function signInWithPasswordViaSupabase(
  input: SignInWithPasswordInput,
) {
  return executeAuthOperation('signInWithPassword', async () => {
    const supabase = await createServerSupabaseClient()

    return supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    })
  })
}

export async function signUpWithPasswordViaSupabase(
  input: SignUpWithPasswordAdapterInput,
) {
  return executeAuthOperation('signUpWithPassword', async () => {
    const supabase = await createServerSupabaseClient()

    return supabase.auth.signUp({
      email: input.email,
      options: {
        data: {
          display_name: input.displayName,
        },
        emailRedirectTo: input.emailRedirectTo,
      },
      password: input.password,
    })
  })
}

export async function signOutViaSupabase() {
  return executeAuthOperation('signOut', async () => {
    const supabase = await createServerSupabaseClient()
    return supabase.auth.signOut()
  })
}

export async function exchangeCodeForSessionViaSupabase(code: string) {
  return executeAuthOperation('exchangeCodeForSession', async () => {
    const supabase = await createServerSupabaseClient()
    return supabase.auth.exchangeCodeForSession(code)
  })
}

async function executeAuthOperation<T>(
  operation: string,
  execute: () => Promise<T>,
): Promise<T> {
  try {
    return await execute()
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }

    throw new AppError('UNEXPECTED', 'Supabase auth adapter execution failed.', {
      cause: error,
      context: {
        boundary: 'auth',
        operation,
      },
    })
  }
}
