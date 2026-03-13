import 'server-only'

import {
  exchangeCodeForSessionViaSupabase,
  readSupabaseAuthState,
} from '@/src/modules/auth/infrastructure/supabase-auth-adapter'
import type {
  ExchangeCodeForSessionInput,
  ExchangeCodeForSessionResult,
} from '@/src/modules/auth/types'
import { AppError } from '@/src/shared/types'

import {
  createAuthApplicationLogger,
  isRecoverableCallbackFailure,
  logUnexpectedAuthFailure,
  requireAuthenticatedUser,
} from './auth-operation-helpers'

const logger = createAuthApplicationLogger('exchangeCodeForSession')

export async function exchangeCodeForSession(
  input: ExchangeCodeForSessionInput,
): Promise<ExchangeCodeForSessionResult> {
  if (!input.code) {
    return { status: 'missing-code' }
  }

  try {
    const result = await exchangeCodeForSessionViaSupabase(input.code)

    if (result.error) {
      if (isRecoverableCallbackFailure(result.error)) {
        return { status: 'invalid-link' }
      }

      throw new AppError('UNEXPECTED', 'Supabase auth code exchange failed unexpectedly.', {
        cause: result.error,
        context: {
          boundary: 'auth',
          operation: 'exchangeCodeForSession',
        },
      })
    }

    const authState = await readSupabaseAuthState()

    return {
      status: 'signed-in',
      user: requireAuthenticatedUser(authState, 'exchangeCodeForSession'),
    }
  } catch (error) {
    logUnexpectedAuthFailure(logger, error)

    if (error instanceof AppError) {
      throw error
    }

    throw new AppError('UNEXPECTED', 'Failed to exchange auth code for a session.', {
      cause: error,
      context: {
        boundary: 'auth',
        operation: 'exchangeCodeForSession',
      },
    })
  }
}
