import { NextResponse } from 'next/server'

import { getRuntimeConfiguration } from '@/src/lib/env'
import { runServerBoundary } from '@/src/server/guards/run-server-boundary'

export const dynamic = 'force-dynamic'

export async function GET() {
  return runServerBoundary({
    boundary: 'system:health',
    operation() {
      const runtime = getRuntimeConfiguration()
      const supabaseCheck = runtime.supabase.publicClientConfigured
        ? runtime.supabase.adminClientConfigured
          ? 'configured'
          : 'missing-service-role'
        : 'missing-public-env'

      return NextResponse.json({
        application: 'english-platform',
        checks: {
          app: 'ready',
          supabase: supabaseCheck,
        },
        logLevel: runtime.logLevel,
        nodeEnv: runtime.nodeEnv,
        status: runtime.supabase.adminClientConfigured ? 'ok' : 'degraded',
        supabase: {
          adminClientConfigured: runtime.supabase.adminClientConfigured,
          mode: runtime.supabase.mode,
          publicClientConfigured: runtime.supabase.publicClientConfigured,
          urlOrigin: runtime.supabase.urlOrigin,
        },
        timestamp: new Date().toISOString(),
      })
    },
  })
}
