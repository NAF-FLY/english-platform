import { getAppSupabaseEnv, getStatusEnv, localSupabaseDefaults } from './supabase-local.mjs'

const status = getStatusEnv()

if (!status.ok) {
  console.error('[supabase:env] local supabase stack is unavailable')
  console.error(`[supabase:env] ${status.error}`)
  console.error('[supabase:env] run `pnpm supabase:start` first')
  process.exit(1)
}

const appEnv = getAppSupabaseEnv(status.env)

console.log('# Copy these values into .env.local')
console.log('NEXT_PUBLIC_APP_URL=http://localhost:3000')
console.log(`NEXT_PUBLIC_SUPABASE_URL=${appEnv.NEXT_PUBLIC_SUPABASE_URL}`)
console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY=${appEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY}`)
console.log(`SUPABASE_SERVICE_ROLE_KEY=${appEnv.SUPABASE_SERVICE_ROLE_KEY}`)

if (appEnv.NEXT_PUBLIC_SUPABASE_URL !== localSupabaseDefaults.NEXT_PUBLIC_SUPABASE_URL) {
  console.log('\n# The running stack URL differs from the repository default and should be copied as-is.')
}
