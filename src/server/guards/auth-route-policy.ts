import {
  getAuthConfigurationSnapshot,
  getAuthCallbackUrl,
  getAuthDefaultReturnToPath,
  getAuthErrorPath,
  getConfiguredAppOrigin,
  isAllowedAuthRedirectOrigin,
} from '@/src/lib/supabase/config'

const authEntryPaths = new Set([
  '/sign-in',
  '/sign-up',
])

export const proxyMatcher = [
  '/auth-error',
  '/callback',
  '/cabinet',
  '/cabinet/:path*',
  '/sign-in',
  '/sign-up',
] as const

export type RouteAccessDecision =
  | {
    action: 'allow'
  }
  | {
    action: 'redirect'
    destination: string
    reason: 'anonymous-protected-route' | 'authenticated-auth-route'
  }

type RouteAccessDecisionInput = {
  isAuthenticated: boolean
  pathname: string
  returnTo: string | null
  search: string
}

export function sanitizeReturnToPath(candidate: string | null | undefined): string | null {
  if (!candidate) {
    return null
  }

  const normalizedCandidate = candidate.trim()

  if (normalizedCandidate.length === 0) {
    return null
  }

  try {
    const url = normalizedCandidate.startsWith('/')
      ? new URL(normalizedCandidate, getConfiguredAppOrigin())
      : new URL(normalizedCandidate)

    if (!isAllowedAuthRedirectOrigin(url.origin)) {
      return null
    }

    const normalizedPath = `${url.pathname}${url.search}${url.hash}`

    if (!normalizedPath.startsWith('/') || normalizedPath.startsWith('//')) {
      return null
    }

    if (isBlockedReturnToPath(url.pathname)) {
      return null
    }

    return normalizedPath
  } catch {
    return null
  }
}

export function resolveAuthenticatedRouteDestination(
  returnTo: string | null | undefined,
): string {
  return sanitizeReturnToPath(returnTo) ?? getAuthDefaultReturnToPath()
}

export function buildSignInRedirectDestination(
  returnTo: string | null | undefined,
): string {
  const sanitizedReturnTo = sanitizeReturnToPath(returnTo)

  if (!sanitizedReturnTo) {
    return '/sign-in'
  }

  const searchParams = new URLSearchParams({
    returnTo: sanitizedReturnTo,
  })

  return `/sign-in?${searchParams.toString()}`
}

export function buildAuthRouteHref(
  pathname: string,
  returnTo: string | null | undefined,
): string {
  const sanitizedReturnTo = sanitizeReturnToPath(returnTo)

  if (!sanitizedReturnTo) {
    return pathname
  }

  const searchParams = new URLSearchParams({
    returnTo: sanitizedReturnTo,
  })

  return `${pathname}?${searchParams.toString()}`
}

export function buildAuthCallbackUrl(
  returnTo: string | null | undefined,
): string {
  const callbackUrl = new URL(getAuthCallbackUrl())
  const sanitizedReturnTo = sanitizeReturnToPath(returnTo)

  if (sanitizedReturnTo) {
    callbackUrl.searchParams.set('returnTo', sanitizedReturnTo)
  }

  return callbackUrl.toString()
}

export function getRouteAccessDecision({
  isAuthenticated,
  pathname,
  returnTo,
  search,
}: RouteAccessDecisionInput): RouteAccessDecision {
  if (!isAuthenticated && isProtectedRoute(pathname)) {
    return {
      action: 'redirect',
      destination: buildSignInRedirectDestination(`${pathname}${search}`),
      reason: 'anonymous-protected-route',
    }
  }

  if (isAuthenticated && authEntryPaths.has(pathname)) {
    return {
      action: 'redirect',
      destination: resolveAuthenticatedRouteDestination(returnTo),
      reason: 'authenticated-auth-route',
    }
  }

  return { action: 'allow' }
}

function isBlockedReturnToPath(pathname: string): boolean {
  const { callbackPath } = getAuthConfigurationSnapshot()

  return (
    authEntryPaths.has(pathname)
    || pathname === callbackPath
    || pathname === getAuthErrorPath()
  )
}

function isProtectedRoute(pathname: string): boolean {
  return pathname === '/cabinet' || pathname.startsWith('/cabinet/')
}
