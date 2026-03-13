# English Platform

English Platform is a Next.js application for learning English with the Polyglot 16 method. The current milestone delivers the application foundation, shared UI system, environment validation, and a runnable local Supabase platform with schema migrations, generated types, RLS rules, and deterministic development fixtures.

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

3. Install and start the local Supabase stack:

   ```bash
   pnpm supabase:start
   ```

4. Print the live local Supabase credentials and confirm `.env.local` matches them:

   ```bash
   pnpm supabase:env
   ```

5. Reset the local database to the checked-in schema state and load deterministic fixtures:

   ```bash
   pnpm supabase:reset
   ```

6. Refresh checked-in Supabase types after any schema change:

   ```bash
   pnpm supabase:types
   ```

7. Fill in the required variables:

   - `NEXT_PUBLIC_APP_URL` is required now.
   - `LOG_LEVEL` controls server logging verbosity.
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` configure the public/browser and SSR clients.
   - `SUPABASE_SERVICE_ROLE_KEY` is backend-only and required for privileged server operations and health reporting.
   - The checked-in `.env.example` sets the repository-local URL default and leaves auth keys blank on purpose; populate them from `pnpm supabase:env` or replace them with hosted project credentials.

8. Start the app:

   ```bash
   pnpm dev
   ```

9. In a separate terminal, run the full local verification path:

   ```bash
   pnpm verify:supabase
   ```

10. Open `http://localhost:3000`.

## Scripts

- `pnpm dev` runs the local development server.
- `pnpm lint` runs ESLint with zero warnings allowed.
- `pnpm typecheck` runs TypeScript in no-emit mode.
- `pnpm build` builds the production bundle.
- `pnpm verify` runs `lint`, `typecheck`, and `build` sequentially for baseline verification.
- `pnpm verify:supabase` runs the baseline checks plus local Supabase status, schema linting, migration-state verification, seed fixture checks, and generated-type drift detection.
- `pnpm supabase:start` starts the local Supabase stack with only the services needed for the current milestone.
- `pnpm supabase:stop` stops the local Supabase stack.
- `pnpm supabase:status` shows the local Supabase container status.
- `pnpm supabase:env` prints the app-facing local Supabase env values from the running stack.
- `pnpm supabase:reset` resets the local database and reapplies checked-in migrations plus `supabase/seed.sql`.
- `pnpm supabase:lint` runs `supabase db lint --local` against the running local database.
- `pnpm supabase:types` regenerates [`src/lib/supabase/types.ts`](/home/mrazcore/Projects/english-platform/src/lib/supabase/types.ts) from the live local `public` schema.

## Environment Variables

| Variable | Required now | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | yes | Canonical application URL used for metadata and runtime reporting |
| `LOG_LEVEL` | yes | Server log verbosity: `debug`, `info`, `warn`, `error` |
| `NEXT_PUBLIC_SUPABASE_URL` | yes for Supabase-backed work | Supabase project URL for SSR/browser clients; defaults to `http://127.0.0.1:55321` in this repository's local CLI mode |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes for Supabase-backed work | Public anonymous key for SSR/browser clients; use the local CLI export or hosted anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | yes for admin/server checks | Backend-only admin key for server-side privileged operations and verification flows |

`SUPABASE_SERVICE_ROLE_KEY` must never be exposed to the browser. The admin client in [`src/lib/supabase/admin.ts`](/home/mrazcore/Projects/english-platform/src/lib/supabase/admin.ts) is server-only and disables session persistence on purpose.

## Local Supabase Workflow

1. `pnpm supabase:start` boots a deterministic local stack for this milestone.
2. `pnpm supabase:env` prints the exact app env values exported by the running stack.
3. `pnpm supabase:reset` reapplies checked-in migrations and `supabase/seed.sql`.
4. `pnpm supabase:types` refreshes checked-in TypeScript types whenever migrations change the `public` schema.
5. `pnpm verify:supabase` confirms the local stack is running, the database is reachable, `supabase db lint` passes, applied migration versions match the repository, deterministic fixtures were loaded, and [`src/lib/supabase/types.ts`](/home/mrazcore/Projects/english-platform/src/lib/supabase/types.ts) is still in sync.

The start command intentionally excludes heavy services that this milestone does not need yet: realtime, storage, edge functions, logflare, vector, and supavisor. Re-enable them later when the product actually depends on those capabilities.

## Seed Fixtures

`supabase/seed.sql` creates three deterministic local auth users for policy and schema validation:

- `learner@english-platform.test`
- `staff@english-platform.test`
- `admin@english-platform.test`

Every fixture uses the password `DevOnlyPass123!`.

The seed also guarantees these application-facing records:

- `polyglot-learner` has the `learner` role
- `polyglot-staff` has the `learner` and `staff` roles
- `polyglot-admin` has the `learner` and `admin` roles

These fixtures are local-development only. They exist to exercise profile synchronization, role membership setup, service-role health checks, and future authenticated flows without inventing ad hoc data on every reset.

## Logging

- Runtime configuration is reported once during startup through the shared logger in [`src/lib/env/runtime.ts`](/home/mrazcore/Projects/english-platform/src/lib/env/runtime.ts).
- `LOG_LEVEL=debug` includes boundary enter/leave diagnostics and startup confirmation.
- `LOG_LEVEL=info` includes startup confirmation without debug-level boundary noise.
- `warn` and `error` suppress normal startup/info logs and keep only elevated events.

Expected local startup behavior:

- missing required env values should block boot with a structured validation error;
- missing Supabase values do not block purely static/public routes until a Supabase client or admin boundary is instantiated;
- Supabase client creation failures are logged with safe metadata only, without keys or raw session payloads.

## Verification Checklist

1. Run `pnpm verify`.
2. Run `pnpm verify:supabase` after `pnpm supabase:start`.
3. If the database drifts, run `pnpm supabase:reset` and repeat `pnpm verify:supabase`.
4. If you changed migrations, run `pnpm supabase:types` before repeating `pnpm verify:supabase`.
5. Open `/`, `/sign-in`, `/sign-up`, and `/cabinet`.
6. Call `GET /api/health` and confirm the JSON payload reflects the current runtime state.
7. Expect `/api/health` to return `"status": "ok"` only when both public and service-role Supabase settings are present.
8. Expect `checks.profilesTable` and `checks.roleMembershipsTable` to report `"reachable"` once the local stack is up and `.env.local` contains the live credentials from `pnpm supabase:env`.
9. Expect `requestAccess.isAuthenticated` to remain `false` for anonymous browser requests until the next auth milestone wires real sign-in/session handling into the app.
10. If Supabase env values are still empty, expect `/api/health` to return `"status": "degraded"` with `supabase: "missing-public-env"` or `"missing-service-role"` until the app is pointed at a real stack.

## Supabase Skeleton

The integration-ready baseline is split into dedicated files:

- [`src/lib/supabase/browser.ts`](/home/mrazcore/Projects/english-platform/src/lib/supabase/browser.ts) for browser usage
- [`src/lib/supabase/server.ts`](/home/mrazcore/Projects/english-platform/src/lib/supabase/server.ts) for Server Components and route handlers
- [`src/lib/supabase/middleware.ts`](/home/mrazcore/Projects/english-platform/src/lib/supabase/middleware.ts) for future session refresh middleware
- [`src/lib/supabase/admin.ts`](/home/mrazcore/Projects/english-platform/src/lib/supabase/admin.ts) for privileged backend-only operations
- [`src/modules/auth/infrastructure/supabase-auth-adapter.ts`](/home/mrazcore/Projects/english-platform/src/modules/auth/infrastructure/supabase-auth-adapter.ts) as the first auth-facing adapter

These files intentionally stop at infrastructure boundaries. They do not include schema queries, route protection policy, or user-facing auth flows yet.
