import type { ZodError } from 'zod'

import { AppError } from '@/src/shared/types'

type EnvScope = 'client' | 'server'

type EnvValidationIssue = {
  path: string
  message: string
}

export class EnvValidationError extends AppError {
  readonly issues: EnvValidationIssue[]

  constructor(scope: EnvScope, error: ZodError) {
    super('ENV_INVALID', `Invalid ${scope} environment configuration`, {
      context: {
        issueCount: error.issues.length,
        scope,
      },
      expose: false,
      statusCode: 500,
    })
    this.name = 'EnvValidationError'
    this.issues = error.issues.map((issue) => ({
      path: issue.path.join('.') || '<root>',
      message: issue.message,
    }))
  }
}
