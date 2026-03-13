import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { refreshProxySession } from '@/src/lib/supabase/middleware'
import { getRouteAccessDecision } from '@/src/server/guards/auth-route-policy'

export async function proxy(request: NextRequest) {
  const session = await refreshProxySession(request)
  const decision = getRouteAccessDecision({
    isAuthenticated: session.isAuthenticated,
    pathname: request.nextUrl.pathname,
    returnTo: request.nextUrl.searchParams.get('returnTo'),
    search: request.nextUrl.search,
  })

  if (decision.action === 'allow') {
    return session.response
  }

  const redirectResponse = NextResponse.redirect(new URL(decision.destination, request.url))

  session.response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie)
  })

  return redirectResponse
}

export const config = {
  matcher: [
    '/auth-error',
    '/callback',
    '/cabinet',
    '/cabinet/:path*',
    '/sign-in',
    '/sign-up',
  ],
}
