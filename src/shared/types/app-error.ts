export type ErrorContextValue = boolean | null | number | string | undefined

export type ErrorContext = Record<string, ErrorContextValue>

export type AppErrorCode =
  | 'AUTH_REQUIRED'
  | 'ENV_INVALID'
  | 'NOT_FOUND'
  | 'UNEXPECTED'

type AppErrorOptions = {
  cause?: unknown
  context?: ErrorContext
  expose?: boolean
  statusCode?: number
}

export class AppError extends Error {
  readonly code: AppErrorCode
  readonly context: ErrorContext
  readonly expose: boolean
  readonly statusCode: number

  constructor(code: AppErrorCode, message: string, options: AppErrorOptions = {}) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.context = options.context ?? {}
    this.expose = options.expose ?? false
    this.statusCode = options.statusCode ?? 500
    ;(this as Error & { cause?: unknown }).cause = options.cause
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}
