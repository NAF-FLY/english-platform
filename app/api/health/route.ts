import { NextResponse } from 'next/server'

import { getRuntimeConfiguration } from '@/src/lib/env'
import { getSupabasePlatformHealth } from '@/src/server/guards/get-supabase-platform-health'
import { runServerBoundary } from '@/src/server/guards/run-server-boundary'

export const dynamic = 'force-dynamic'

export async function GET() {
  return runServerBoundary({
    boundary: 'system:health',
    async operation() {
      const runtime = getRuntimeConfiguration()
      const supabaseHealth = await getSupabasePlatformHealth()

      return NextResponse.json({
        application: 'english-platform',
        checks: supabaseHealth.checks,
        logLevel: runtime.logLevel,
        nodeEnv: runtime.nodeEnv,
        requestAccess: supabaseHealth.requestAccess,
        status: supabaseHealth.status,
        supabase: supabaseHealth.supabase,
        timestamp: new Date().toISOString(),
      })
    },
  })
}
