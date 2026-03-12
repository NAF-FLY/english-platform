import { isAppError } from '@/src/shared/types'

export function getErrorDetails(error: unknown) {
  if (isAppError(error)) {
    return {
      code: error.code,
      context: error.context,
      message: error.message,
      name: error.name,
      stack: error.stack,
      statusCode: error.statusCode,
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
    }
  }

  return {
    message: 'Unexpected non-error value was thrown.',
    name: 'NonErrorThrow',
    value:
      typeof error === 'string' || typeof error === 'number' || typeof error === 'boolean'
        ? error
        : JSON.stringify(error),
  }
}
