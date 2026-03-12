import 'server-only'

import { createServerClient } from '@supabase/ssr'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { createLogger } from '@/src/lib/logger'
import { AppError } from '@/src/shared/types'

import { getSupabasePublicConfig } from './config'
import type { Database } from './types'

const logger = createLogger({ scope: 'supabase-middleware' })

type MiddlewareSupabaseClientOptions = {
  request: NextRequest
  response?: NextResponse
}

export function createMiddlewareSupabaseClient({
  request,
  response = NextResponse.next({
    request,
  }),
}: MiddlewareSupabaseClientOptions) {
  try {
    const { anonKey, url } = getSupabasePublicConfig()

    const supabase = createServerClient<Database>(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, options, value }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    })

    return { response, supabase }
  } catch (error) {
    logger.error('failed to create supabase middleware client', { target: 'middleware-client' }, error)

    if (error instanceof AppError) {
      throw error
    }

    throw new AppError('UNEXPECTED', 'Failed to create Supabase middleware client.', {
      cause: error,
      context: {
        target: 'middleware-client',
      },
    })
  }
}
