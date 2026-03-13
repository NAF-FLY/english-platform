import 'server-only'

import {
  readSupabaseAuthState,
  signInWithPasswordViaSupabase,
} from '@/src/modules/auth/infrastructure/supabase-auth-adapter'
import type {
  SignInWithPasswordInput,
  SignInWithPasswordResult,
} from '@/src/modules/auth/types'
import { AppError } from '@/src/shared/types'

import {
  createAuthApplicationLogger,
  logUnexpectedAuthFailure,
  requireAuthenticatedUser,
  resolveKnownSignInFailure,
} from './auth-operation-helpers'

const logger = createAuthApplicationLogger('signInWithPassword')

export async function signInWithPassword(
  input: SignInWithPasswordInput,
): Promise<SignInWithPasswordResult> {
  try {
    const result = await signInWithPasswordViaSupabase(input)

    if (result.error) {
      const knownFailure = resolveKnownSignInFailure(result.error)

      if (knownFailure) {
        return { status: knownFailure }
      }

      throw new AppError('UNEXPECTED', 'Supabase password sign-in failed unexpectedly.', {
        cause: result.error,
        context: {
          boundary: 'auth',
          operation: 'signInWithPassword',
        },
      })
    }

    const authState = await readSupabaseAuthState()

    return {
      status: 'signed-in',
      user: requireAuthenticatedUser(authState, 'signInWithPassword'),
    }
  } catch (error) {
    logUnexpectedAuthFailure(logger, error)

    if (error instanceof AppError) {
      throw error
    }

    throw new AppError('UNEXPECTED', 'Failed to complete password sign-in.', {
      cause: error,
      context: {
        boundary: 'auth',
        operation: 'signInWithPassword',
      },
    })
  }
}
