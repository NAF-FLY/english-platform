import 'server-only'

import { createLogger, type LogContext } from '@/src/lib/logger'

type RunServerBoundaryOptions<T> = {
  boundary: string
  context?: LogContext
  operation: () => Promise<T> | T
}

export async function runServerBoundary<T>({
  boundary,
  context,
  operation,
}: RunServerBoundaryOptions<T>) {
  const logger = createLogger({
    defaultContext: {
      boundary,
      ...context,
    },
    scope: 'server-boundary',
  })

  logger.debug('entering boundary')

  try {
    const result = await operation()
    logger.debug('leaving boundary')
    return result
  } catch (error) {
    logger.error('boundary execution failed', context, error)
    throw error
  }
}
