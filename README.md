# English Platform

English Platform is a Next.js application for learning English with the Polyglot 16 method. The current milestone delivers the application foundation, shared UI system, environment validation, logging, and the Supabase integration skeleton for the next phases.

## Stack

- TypeScript
- Next.js App Router
- Supabase (`@supabase/ssr`, `@supabase/supabase-js`)
- PostgreSQL via self-hosted Supabase

## Quick Start

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create a local env file:

   ```bash
   cp .env.example .env.local
   ```

3. Fill in the required variables:

   - `NEXT_PUBLIC_APP_URL` is required now.
   - `LOG_LEVEL` controls server logging verbosity.
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` stay optional until the auth/data milestone, but the new Supabase skeleton will fail fast if you try to instantiate clients without them.

4. Start the app:

   ```bash
   pnpm dev
   ```

5. Open `http://localhost:3000`.

## Scripts

- `pnpm dev` runs the local development server.
- `pnpm lint` runs ESLint with zero warnings allowed.
- `pnpm typecheck` runs TypeScript in no-emit mode.
- `pnpm build` builds the production bundle.
- `pnpm verify` runs `lint`, `typecheck`, and `build` sequentially for baseline verification.

## Environment Variables

| Variable | Required now | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | yes | Canonical application URL used for metadata and runtime reporting |
| `LOG_LEVEL` | yes | Server log verbosity: `debug`, `info`, `warn`, `error` |
| `NEXT_PUBLIC_SUPABASE_URL` | no | Supabase project URL for SSR/browser clients |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | no | Public anonymous key for SSR/browser clients |
| `SUPABASE_SERVICE_ROLE_KEY` | no | Backend-only admin key for server-side privileged operations |

`SUPABASE_SERVICE_ROLE_KEY` must never be exposed to the browser. The admin client in [`src/lib/supabase/admin.ts`](/home/mrazcore/Projects/english-platform/src/lib/supabase/admin.ts) is server-only and disables session persistence on purpose.

## Logging

- Runtime configuration is reported once during startup through the shared logger in [`src/lib/env/runtime.ts`](/home/mrazcore/Projects/english-platform/src/lib/env/runtime.ts).
- `LOG_LEVEL=debug` includes boundary enter/leave diagnostics and startup confirmation.
- `LOG_LEVEL=info` includes startup confirmation without debug-level boundary noise.
- `warn` and `error` suppress normal startup/info logs and keep only elevated events.

Expected local startup behavior:

- missing required env values should block boot with a structured validation error;
- missing optional Supabase values do not block the app until a Supabase client is instantiated;
- Supabase client creation failures are logged with safe metadata only, without keys or raw session payloads.

## Verification Checklist

1. Run `pnpm verify`.
2. Open `/`, `/sign-in`, `/sign-up`, and `/cabinet`.
3. Call `GET /api/health` and confirm the JSON payload reflects the current runtime state.
4. If Supabase env values are still empty, expect `/api/health` to return `"status": "degraded"` with `supabase: "missing-env"` until the next milestone wires the real backend.

## Supabase Skeleton

The integration-ready baseline is split into dedicated files:

- [`src/lib/supabase/browser.ts`](/home/mrazcore/Projects/english-platform/src/lib/supabase/browser.ts) for browser usage
- [`src/lib/supabase/server.ts`](/home/mrazcore/Projects/english-platform/src/lib/supabase/server.ts) for Server Components and route handlers
- [`src/lib/supabase/middleware.ts`](/home/mrazcore/Projects/english-platform/src/lib/supabase/middleware.ts) for future session refresh middleware
- [`src/lib/supabase/admin.ts`](/home/mrazcore/Projects/english-platform/src/lib/supabase/admin.ts) for privileged backend-only operations
- [`src/modules/auth/infrastructure/supabase-auth-adapter.ts`](/home/mrazcore/Projects/english-platform/src/modules/auth/infrastructure/supabase-auth-adapter.ts) as the first auth-facing adapter

These files intentionally stop at infrastructure boundaries. They do not include schema queries, route protection policy, or user-facing auth flows yet.
