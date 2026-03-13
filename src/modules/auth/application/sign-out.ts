import 'server-only'

import { signOutViaSupabase } from '@/src/modules/auth/infrastructure/supabase-auth-adapter'
import { isSupabaseMissingSessionError } from '@/src/modules/auth/infrastructure/supabase-auth-error'
import type { SignOutResult } from '@/src/modules/auth/types'
import { AppError } from '@/src/shared/types'

import {
  createAuthApplicationLogger,
  logUnexpectedAuthFailure,
} from './auth-operation-helpers'

const logger = createAuthApplicationLogger('signOut')

export async function signOut(): Promise<SignOutResult> {
  try {
    const result = await signOutViaSupabase()

    if (result.error && !isSupabaseMissingSessionError(result.error)) {
      throw new AppError('UNEXPECTED', 'Supabase sign-out failed unexpectedly.', {
        cause: result.error,
        context: {
          boundary: 'auth',
          operation: 'signOut',
        },
      })
    }

    return { status: 'signed-out' }
  } catch (error) {
    logUnexpectedAuthFailure(logger, error)

    if (error instanceof AppError) {
      throw error
    }

    throw new AppError('UNEXPECTED', 'Failed to sign out.', {
      cause: error,
      context: {
        boundary: 'auth',
        operation: 'signOut',
      },
    })
  }
}
