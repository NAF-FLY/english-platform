import 'server-only'

import { createLogger } from '@/src/lib/logger'
import {
  getSupabaseAuthErrorCode,
  getSupabaseAuthErrorMessage,
  getSupabaseAuthErrorStatus,
  isSupabaseAuthError,
} from '@/src/modules/auth/infrastructure/supabase-auth-error'
import type { AuthStateResult, AuthUserSnapshot } from '@/src/modules/auth/types'
import { AppError } from '@/src/shared/types'

const callbackFailureCodes = new Set([
  'bad_code_verifier',
  'bad_oauth_callback',
  'flow_state_expired',
  'flow_state_not_found',
  'otp_expired',
])

const signInFailureCodes = new Set([
  'invalid_credentials',
  'user_not_found',
])

const signUpDuplicateCodes = new Set([
  'email_exists',
  'identity_already_exists',
  'user_already_exists',
])

export function createAuthApplicationLogger(operation: string) {
  return createLogger({
    defaultContext: {
      boundary: 'auth',
      operation,
    },
    scope: 'auth-application',
  })
}

export function getSafeAuthErrorContext(error: unknown) {
  return {
    providerErrorCode: getSupabaseAuthErrorCode(error) ?? undefined,
    providerErrorName: isSupabaseAuthError(error) ? error.name : undefined,
    providerErrorStatus: getSupabaseAuthErrorStatus(error) ?? undefined,
  }
}

export function requireAuthenticatedUser(
  state: AuthStateResult,
  operation: string,
): AuthUserSnapshot {
  if (state.status === 'authenticated') {
    return state.user
  }

  throw new AppError('UNEXPECTED', 'Authenticated auth operation did not resolve a user session.', {
    context: {
      boundary: 'auth',
      operation,
      state: state.status,
    },
  })
}

export function resolveKnownSignInFailure(error: unknown) {
  const code = getSupabaseAuthErrorCode(error)

  if (code === 'email_not_confirmed') {
    return 'email-not-confirmed' as const
  }

  if (code && signInFailureCodes.has(code)) {
    return 'invalid-credentials' as const
  }

  const message = getSupabaseAuthErrorMessage(error)?.toLowerCase()

  if (message?.includes('email not confirmed')) {
    return 'email-not-confirmed' as const
  }

  if (message?.includes('invalid login credentials')) {
    return 'invalid-credentials' as const
  }

  return null
}

export function resolveKnownSignUpFailure(error: unknown) {
  const code = getSupabaseAuthErrorCode(error)

  if (code && signUpDuplicateCodes.has(code)) {
    return 'email-already-registered' as const
  }

  const message = getSupabaseAuthErrorMessage(error)?.toLowerCase()

  if (message?.includes('user already registered')) {
    return 'email-already-registered' as const
  }

  return null
}

export function isRecoverableCallbackFailure(error: unknown): boolean {
  const code = getSupabaseAuthErrorCode(error)

  if (code && callbackFailureCodes.has(code)) {
    return true
  }

  const message = getSupabaseAuthErrorMessage(error)?.toLowerCase()

  return Boolean(
    message?.includes('expired')
    || message?.includes('invalid')
    || message?.includes('code verifier')
    || message?.includes('flow state'),
  )
}

export function logUnexpectedAuthFailure(
  logger: ReturnType<typeof createAuthApplicationLogger>,
  error: unknown,
) {
  logger.error('auth application operation failed', getSafeAuthErrorContext(error), error)
}
