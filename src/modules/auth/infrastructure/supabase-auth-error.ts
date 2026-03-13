export type SupabaseAuthErrorLike = Error & {
  __isAuthError?: boolean
  code?: string
  status?: number
}

export function isSupabaseAuthError(error: unknown): error is SupabaseAuthErrorLike {
  return typeof error === 'object' && error !== null && '__isAuthError' in error
}

export function getSupabaseAuthErrorCode(error: unknown): string | null {
  if (!isSupabaseAuthError(error) || typeof error.code !== 'string') {
    return null
  }

  return error.code
}

export function getSupabaseAuthErrorMessage(error: unknown): string | null {
  if (!isSupabaseAuthError(error) || typeof error.message !== 'string') {
    return null
  }

  return error.message
}

export function getSupabaseAuthErrorStatus(error: unknown): number | null {
  if (!isSupabaseAuthError(error) || typeof error.status !== 'number') {
    return null
  }

  return error.status
}

export function isSupabaseMissingSessionError(error: unknown): boolean {
  return (
    isSupabaseAuthError(error)
    && error.name === 'AuthSessionMissingError'
    && error.message === 'Auth session missing!'
    && error.status === 400
  )
}
