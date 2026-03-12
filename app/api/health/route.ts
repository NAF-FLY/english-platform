import { NextResponse } from 'next/server'

import { getRuntimeConfiguration } from '@/src/lib/env'
import { runServerBoundary } from '@/src/server/guards/run-server-boundary'

export const dynamic = 'force-dynamic'

export async function GET() {
  return runServerBoundary({
    boundary: 'system:health',
    operation() {
      const runtime = getRuntimeConfiguration()

      return NextResponse.json({
        application: 'english-platform',
        checks: {
          app: 'ready',
          supabase: runtime.supabaseConfigured ? 'configured' : 'missing-env',
        },
        logLevel: runtime.logLevel,
        nodeEnv: runtime.nodeEnv,
        status: runtime.supabaseConfigured ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
      })
    },
  })
}
