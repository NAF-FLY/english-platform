import 'server-only'

import { getServerEnv } from '@/src/lib/env/server'
import type { LogLevel } from '@/src/lib/env/shared'
import type { ErrorContext } from '@/src/shared/types'
import { getErrorDetails } from '@/src/shared/utils/get-error-details'

export type LogContext = ErrorContext

const logLevelWeight: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
}

type LoggerOptions = {
  defaultContext?: LogContext
  scope: string
}

type LogWriter = (message?: unknown, ...optionalParams: unknown[]) => void

export function createLogger({ defaultContext = {}, scope }: LoggerOptions) {
  const activeLevel = getServerEnv().LOG_LEVEL

  const write = (level: LogLevel, message: string, context: LogContext = {}, error?: unknown) => {
    if (logLevelWeight[level] < logLevelWeight[activeLevel]) {
      return
    }

    const payload = {
      context: sanitizeContext({ ...defaultContext, ...context }),
      error: error ? getErrorDetails(error) : undefined,
      level,
      message,
      scope,
      timestamp: new Date().toISOString(),
    }

    getWriter(level)(JSON.stringify(payload))
  }

  return {
    child(context: LogContext) {
      return createLogger({
        defaultContext: {
          ...defaultContext,
          ...sanitizeContext(context),
        },
        scope,
      })
    },
    debug(message: string, context?: LogContext) {
      write('debug', message, context)
    },
    error(message: string, context?: LogContext, error?: unknown) {
      write('error', message, context, error)
    },
    info(message: string, context?: LogContext) {
      write('info', message, context)
    },
    warn(message: string, context?: LogContext, error?: unknown) {
      write('warn', message, context, error)
    },
  }
}

function getWriter(level: LogLevel): LogWriter {
  if (level === 'error') {
    return console.error
  }

  if (level === 'warn') {
    return console.warn
  }

  if (level === 'info') {
    return console.info
  }

  return console.debug
}

function sanitizeContext(context: LogContext) {
  return Object.fromEntries(
    Object.entries(context).filter(([, value]) => value !== undefined),
  )
}
