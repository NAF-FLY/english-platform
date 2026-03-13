import 'server-only'

import { readSupabaseAuthState } from '@/src/modules/auth/infrastructure/supabase-auth-adapter'
import type { AuthStateResult } from '@/src/modules/auth/types'
import { AppError } from '@/src/shared/types'

import {
  createAuthApplicationLogger,
  logUnexpectedAuthFailure,
} from './auth-operation-helpers'

const logger = createAuthApplicationLogger('getAuthState')

export async function getAuthState(): Promise<AuthStateResult> {
  try {
    return await readSupabaseAuthState()
  } catch (error) {
    logUnexpectedAuthFailure(logger, error)

    if (error instanceof AppError) {
      throw error
    }

    throw new AppError('UNEXPECTED', 'Failed to resolve auth state.', {
      cause: error,
      context: {
        boundary: 'auth',
        operation: 'getAuthState',
      },
    })
  }
}
