import 'server-only'

import {
  signOutViaSupabase,
  signUpWithPasswordViaSupabase,
} from '@/src/modules/auth/infrastructure/supabase-auth-adapter'
import { isSupabaseMissingSessionError } from '@/src/modules/auth/infrastructure/supabase-auth-error'
import type {
  SignUpWithPasswordInput,
  SignUpWithPasswordResult,
} from '@/src/modules/auth/types'
import { buildAuthCallbackUrl } from '@/src/server/guards/auth-route-policy'
import { AppError } from '@/src/shared/types'

import {
  createAuthApplicationLogger,
  logUnexpectedAuthFailure,
  resolveKnownSignUpFailure,
} from './auth-operation-helpers'

const logger = createAuthApplicationLogger('signUpWithPassword')

export async function signUpWithPassword(
  input: SignUpWithPasswordInput,
): Promise<SignUpWithPasswordResult> {
  try {
    const result = await signUpWithPasswordViaSupabase({
      ...input,
      emailRedirectTo: buildAuthCallbackUrl(input.returnTo),
    })

    if (result.error) {
      const knownFailure = resolveKnownSignUpFailure(result.error)

      if (knownFailure) {
        return { status: knownFailure }
      }

      throw new AppError('UNEXPECTED', 'Supabase password sign-up failed unexpectedly.', {
        cause: result.error,
        context: {
          boundary: 'auth',
          operation: 'signUpWithPassword',
        },
      })
    }

    if (result.data.session) {
      const signOutResult = await signOutViaSupabase()

      if (signOutResult.error && !isSupabaseMissingSessionError(signOutResult.error)) {
        throw new AppError('UNEXPECTED', 'Sign-up created a session that could not be cleared.', {
          cause: signOutResult.error,
          context: {
            boundary: 'auth',
            operation: 'signUpWithPassword',
            expected: 'confirmation-required',
          },
        })
      }
    }

    if (!result.data.user) {
      throw new AppError('UNEXPECTED', 'Sign-up completed without a user payload.', {
        context: {
          boundary: 'auth',
          operation: 'signUpWithPassword',
        },
      })
    }

    return {
      email: input.email,
      status: 'confirmation-required',
    }
  } catch (error) {
    logUnexpectedAuthFailure(logger, error)

    if (error instanceof AppError) {
      throw error
    }

    throw new AppError('UNEXPECTED', 'Failed to complete password sign-up.', {
      cause: error,
      context: {
        boundary: 'auth',
        operation: 'signUpWithPassword',
      },
    })
  }
}
