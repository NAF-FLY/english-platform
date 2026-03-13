import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { createLogger } from '@/src/lib/logger'
import { getAuthErrorPath } from '@/src/lib/supabase/config'
import { exchangeCodeForSession } from '@/src/modules/auth/application'
import {
  resolveAuthenticatedRouteDestination,
  sanitizeReturnToPath,
} from '@/src/server/guards/auth-route-policy'

const logger = createLogger({ scope: 'auth-route' })

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const safeReturnTo = sanitizeReturnToPath(request.nextUrl.searchParams.get('returnTo'))

  try {
    const result = await exchangeCodeForSession({ code })

    if (result.status === 'signed-in') {
      return NextResponse.redirect(
        new URL(resolveAuthenticatedRouteDestination(safeReturnTo), request.url),
      )
    }

    return NextResponse.redirect(
      new URL(buildAuthErrorDestination(result.status, safeReturnTo), request.url),
    )
  } catch (error) {
    logger.error('callback route failed', {
      boundary: 'auth',
      failureType: 'unexpected',
      operation: 'callbackRoute',
      path: request.nextUrl.pathname,
    }, error)

    return NextResponse.redirect(
      new URL(buildAuthErrorDestination('invalid-link', safeReturnTo), request.url),
    )
  }
}

function buildAuthErrorDestination(
  reason: 'invalid-link' | 'missing-code',
  returnTo: string | null,
): string {
  const searchParams = new URLSearchParams({
    reason,
  })

  if (returnTo) {
    searchParams.set('returnTo', returnTo)
  }

  return `${getAuthErrorPath()}?${searchParams.toString()}`
}
