import { createServerClient } from '@supabase/ssr'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { createLogger } from '@/src/lib/logger'
import { isSupabaseMissingSessionError } from '@/src/modules/auth/infrastructure/supabase-auth-error'
import { AppError } from '@/src/shared/types'

import { getSupabasePublicConfig } from './config'
import type { Database } from './types'

const logger = createLogger({ scope: 'supabase-middleware' })

type ProxySessionSnapshot = {
  isAuthenticated: boolean
  response: NextResponse
}

export async function refreshProxySession(
  request: NextRequest,
): Promise<ProxySessionSnapshot> {
  let response = NextResponse.next({
    request,
  })

  try {
    const { anonKey, url } = getSupabasePublicConfig()
    const supabase = createServerClient<Database>(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })

          response = NextResponse.next({
            request,
          })

          cookiesToSet.forEach(({ name, options, value }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    })

    const { data, error } = await supabase.auth.getUser()

    if (error) {
      if (isSupabaseMissingSessionError(error)) {
        return {
          isAuthenticated: false,
          response,
        }
      }

      logger.error('proxy session refresh failed', {
        boundary: 'auth',
        operation: 'proxy.auth.getUser',
        path: request.nextUrl.pathname,
      }, error)

      throw new AppError('UNEXPECTED', 'Failed to refresh Supabase session in proxy.', {
        cause: error,
        context: {
          boundary: 'auth',
          operation: 'proxy.auth.getUser',
          path: request.nextUrl.pathname,
        },
      })
    }

    return {
      isAuthenticated: Boolean(data.user),
      response,
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }

    logger.error('proxy session refresh failed', {
      boundary: 'auth',
      operation: 'proxy.auth.getUser',
      path: request.nextUrl.pathname,
    }, error)

    throw new AppError('UNEXPECTED', 'Failed to refresh Supabase session in proxy.', {
      cause: error,
      context: {
        boundary: 'auth',
        operation: 'proxy.auth.getUser',
        path: request.nextUrl.pathname,
      },
    })
  }
}
