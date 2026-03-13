import 'server-only'

import { createLogger } from '@/src/lib/logger'
import { createAdminSupabaseClient } from '@/src/lib/supabase/admin'
import { getSupabaseConfigurationSnapshot } from '@/src/lib/supabase/config'
import { checkTableAccess } from '@/src/lib/supabase'
import { AppError } from '@/src/shared/types'

import { getRequestAccessSnapshot } from './get-request-access-snapshot'

const logger = createLogger({ scope: 'supabase-health' })

export type SupabasePlatformHealth = {
  checks: {
    app: 'ready'
    authContext: 'authenticated' | 'anonymous'
    profilesTable: 'reachable' | 'skipped'
    roleMembershipsTable: 'reachable' | 'skipped'
    supabase: 'configured' | 'missing-public-env' | 'missing-service-role'
  }
  requestAccess: {
    isAdmin: boolean
    isAuthenticated: boolean
    isInternal: boolean
    userId: string | null
  }
  status: 'degraded' | 'ok'
  supabase: ReturnType<typeof getSupabaseConfigurationSnapshot>
}

export async function getSupabasePlatformHealth(): Promise<SupabasePlatformHealth> {
  const configuration = getSupabaseConfigurationSnapshot()

  try {
    const [requestAccess, tableChecks] = await Promise.all([
      configuration.publicClientConfigured
        ? getRequestAccessSnapshot()
        : Promise.resolve({
            isAdmin: false,
            isAuthenticated: false,
            isInternal: false,
            user: null,
          }),
      configuration.adminClientConfigured
        ? verifySchemaAccess()
        : Promise.resolve(null),
    ])

    return {
      checks: {
        app: 'ready',
        authContext: requestAccess.isAuthenticated ? 'authenticated' : 'anonymous',
        profilesTable: tableChecks?.profilesTable ?? 'skipped',
        roleMembershipsTable: tableChecks?.roleMembershipsTable ?? 'skipped',
        supabase: configuration.publicClientConfigured
          ? configuration.adminClientConfigured
            ? 'configured'
            : 'missing-service-role'
          : 'missing-public-env',
      },
      requestAccess: {
        isAdmin: requestAccess.isAdmin,
        isAuthenticated: requestAccess.isAuthenticated,
        isInternal: requestAccess.isInternal,
        userId: requestAccess.user?.id ?? null,
      },
      status: configuration.adminClientConfigured ? 'ok' : 'degraded',
      supabase: configuration,
    }
  } catch (error) {
    logger.error('failed to resolve supabase platform health', {
      boundary: 'system:health',
      operation: 'getSupabasePlatformHealth',
    }, error)

    if (error instanceof AppError) {
      throw error
    }

    throw new AppError('UNEXPECTED', 'Failed to resolve Supabase platform health.', {
      cause: error,
      context: {
        boundary: 'system:health',
        operation: 'getSupabasePlatformHealth',
      },
    })
  }
}

async function verifySchemaAccess() {
  const supabase = createAdminSupabaseClient()

  await Promise.all([
    checkTableAccess(supabase, 'profiles'),
    checkTableAccess(supabase, 'user_role_memberships'),
  ])

  return {
    profilesTable: 'reachable' as const,
    roleMembershipsTable: 'reachable' as const,
  }
}
