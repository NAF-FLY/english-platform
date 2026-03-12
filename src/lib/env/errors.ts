import type { ZodError } from 'zod'

type EnvScope = 'client' | 'server'

type EnvValidationIssue = {
  path: string
  message: string
}

export class EnvValidationError extends Error {
  readonly issues: EnvValidationIssue[]

  constructor(scope: EnvScope, error: ZodError) {
    super(`Invalid ${scope} environment configuration`)
    this.name = 'EnvValidationError'
    this.issues = error.issues.map((issue) => ({
      path: issue.path.join('.') || '<root>',
      message: issue.message,
    }))
  }
}
