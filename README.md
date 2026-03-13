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
   - `AUTH_CALLBACK_PATH`, `AUTH_ERROR_PATH`, and `AUTH_DEFAULT_RETURN_TO_PATH` default to `/callback`, `/auth-error`, and `/cabinet`.
   - `AUTH_ALLOWED_REDIRECT_ORIGINS` accepts a comma-separated list of extra same-app origins allowed to round-trip auth redirects; `.env.example` includes `http://127.0.0.1:3000` for local host switching.
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` configure the public/browser and SSR clients.
   - `SUPABASE_SERVICE_ROLE_KEY` is backend-only and required for privileged server operations and health reporting.
   - The checked-in `.env.example` sets the local callback and redirect contract and leaves auth keys blank on purpose; populate them from `pnpm supabase:env` or replace them with hosted project credentials.

8. Start the app:

   ```bash
   pnpm dev
   ```

9. In a separate terminal, run the full local verification path:

   ```bash
   pnpm verify:supabase
   ```

10. For a faster auth-only regression pass during this milestone, use:

   ```bash
   pnpm verify:auth
   ```

11. Open `http://localhost:3000`.

## Scripts

- `pnpm dev` runs the local development server.
- `pnpm lint` runs ESLint with zero warnings allowed.
- `pnpm typecheck` runs TypeScript in no-emit mode.
- `pnpm build` builds the production bundle.
- `pnpm verify` runs `lint`, `typecheck`, and `build` sequentially for baseline verification.
- `pnpm verify:auth` runs the local Supabase verification path plus the auth smoke suite only, skipping the baseline `lint`, `typecheck`, and `build` steps for faster iteration.
- `pnpm verify:supabase` runs the baseline checks plus local Supabase status, schema linting, migration-state verification, seed fixture checks, generated-type drift detection, and the auth smoke suite.
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
| `AUTH_CALLBACK_PATH` | no | Internal callback path used in Supabase email confirmation links; defaults to `/callback` |
| `AUTH_ERROR_PATH` | no | Internal auth error landing path for expired or invalid links; defaults to `/auth-error` |
| `AUTH_DEFAULT_RETURN_TO_PATH` | no | Safe fallback destination after auth and auth-route redirects; defaults to `/cabinet` |
| `AUTH_ALLOWED_REDIRECT_ORIGINS` | no | Extra comma-separated same-app origins allowed for auth redirects and `returnTo` normalization |
| `NEXT_PUBLIC_SUPABASE_URL` | yes for Supabase-backed work | Supabase project URL for SSR/browser clients; defaults to `http://127.0.0.1:55321` in this repository's local CLI mode |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes for Supabase-backed work | Public anonymous key for SSR/browser clients; use the local CLI export or hosted anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | yes for admin/server checks | Backend-only admin key for server-side privileged operations and verification flows |

`SUPABASE_SERVICE_ROLE_KEY` must never be exposed to the browser. The admin client in [`src/lib/supabase/admin.ts`](/home/mrazcore/Projects/english-platform/src/lib/supabase/admin.ts) is server-only and disables session persistence on purpose.

## Auth Redirect Contract

- Local Supabase email confirmation now assumes `supabase/config.toml` points `site_url` at `http://localhost:3000` and allows both `http://localhost:3000/callback` and `http://127.0.0.1:3000/callback`.
- The repository defaults keep sign-up confirmation-first by enabling `auth.email.enable_confirmations = true` in local Supabase config.
- `returnTo` is normalized to same-origin internal paths only. External origins, protocol-relative paths, and auth-loop destinations such as `/sign-in`, `/sign-up`, `/callback`, and `/auth-error` are rejected and fall back to `/cabinet`.
- Root proxy refreshes Supabase SSR cookies on `/cabinet`, `/sign-in`, `/sign-up`, `/callback`, and `/auth-error`, redirects anonymous users away from `/cabinet`, and redirects authenticated users away from duplicate auth-entry routes.

## Auth Workflow

The current milestone delivers a server-first auth contract:

- Anonymous requests to `/cabinet` are redirected to `/sign-in?returnTo=%2Fcabinet`.
- Authenticated requests to `/sign-in` and `/sign-up` are redirected back to the validated `returnTo` path or `/cabinet`.
- Password sign-in creates SSR-compatible Supabase cookies and unlocks `/cabinet` without any client-side auth store.
- Sign-out clears the Supabase SSR session and returns the user to the sign-in surface with the signed-out notice.
- `/callback` exchanges valid auth codes into a server session, redirects success cases to `/cabinet`, routes missing-code links to `/auth-error?reason=missing-code`, and routes invalid or reused links to `/auth-error?reason=invalid-link`.

Local email-confirmation note:

- Product behavior remains confirmation-first in the UI: after sign-up the user always lands in a "check your email" state instead of entering the cabinet directly.
- In the local Supabase CLI emulator, direct `signUp()` responses may still create a confirmed user record immediately even with `auth.email.enable_confirmations = true`. Because of that emulator nuance, automated callback verification uses a seeded magic-link flow through Mailpit instead of relying on sign-up email delivery.
- Manual local verification should still treat the sign-up screen as confirmation-pending UX, not as an immediate cabinet entry path.

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

Recommended auth smoke credentials:

- Primary learner login: `learner@english-platform.test` / `DevOnlyPass123!`
- Team-member login: `staff@english-platform.test` / `DevOnlyPass123!`
- Admin login: `admin@english-platform.test` / `DevOnlyPass123!`

## Logging

- Runtime configuration is reported once during startup through the shared logger in [`src/lib/env/runtime.ts`](/home/mrazcore/Projects/english-platform/src/lib/env/runtime.ts).
- `LOG_LEVEL=debug` includes boundary enter/leave diagnostics and startup confirmation.
- `LOG_LEVEL=info` includes startup confirmation without debug-level boundary noise.
- `warn` and `error` suppress normal startup/info logs and keep only elevated events.

Auth-specific expectations:

- `debug`: boundary entry/exit, route-policy tracing, runtime configuration confirmation, and local verification startup details.
- `info`: high-level startup confirmation only; normal anonymous-to-sign-in redirects and successful auth flows should stay quiet.
- `warn`: use for degraded local setup that still allows progress, such as a documented local API URL mismatch or a temporarily non-persistent server-cookie context during non-critical flows.
- `error`: unexpected auth boundary failures, callback exchange failures, missing required env values, broken Supabase client construction, or request-access snapshot failures.

Expected local startup behavior:

- missing required env values should block boot with a structured validation error;
- missing Supabase values do not block purely static/public routes until a Supabase client or admin boundary is instantiated;
- invalid auth-path or redirect-origin env values should fail fast before auth proxy or application helpers run;
- Supabase client creation failures are logged with safe metadata only, without keys or raw session payloads.

Progress policy for this milestone:

- Block immediately: missing required env, failed auth smoke checks, invalid callback handling, broken middleware redirects, missing seed fixtures, schema drift, or out-of-date generated Supabase types.
- Warn during local setup: documented hostname drift such as `localhost` vs `127.0.0.1`, or emulator quirks that do not invalidate the actual route-protection contract.

## Verification Checklist

Automated:

1. Run `pnpm verify`.
2. Run `pnpm verify:supabase` after `pnpm supabase:start`.
3. Use `pnpm verify:auth` when you only need the seeded auth smoke suite without re-running `lint`, `typecheck`, and `build`.
4. Expect the automated auth smoke suite to cover anonymous `/cabinet` redirect, seeded password sign-in, SSR cabinet access, authenticated `/sign-in` redirect, sign-out session teardown, callback missing-code handling, callback success via Mailpit magic-link, and invalid or reused callback links.
5. If the database drifts, run `pnpm supabase:reset` and repeat `pnpm verify:supabase`.
6. If you changed migrations, run `pnpm supabase:types` before repeating `pnpm verify:supabase`.
7. Call `GET /api/health` and confirm the JSON payload reflects the current runtime state.
8. Expect `/api/health` to return `"status": "ok"` only when both public and service-role Supabase settings are present.
9. Expect `checks.profilesTable` and `checks.roleMembershipsTable` to report `"reachable"` once the local stack is up and `.env.local` contains the live credentials from `pnpm supabase:env`.

Manual:

1. Open `/`, `/sign-in`, `/sign-up`, and `/cabinet`.
2. Expect an anonymous request to `/cabinet` to redirect to `/sign-in?returnTo=%2Fcabinet`.
3. Sign in with `learner@english-platform.test` / `DevOnlyPass123!` and confirm the cabinet renders the seeded display name and email.
4. While signed in, open `/sign-in` or `/sign-up` directly and confirm the middleware redirects back to `/cabinet` or the validated `returnTo` destination.
5. Use the cabinet sign-out button and confirm the browser lands on `/sign-in?notice=signed-out`.
6. Submit the sign-up form with a fresh email and confirm the UI stays in the confirmation-pending state instead of entering `/cabinet`.
7. Trigger a local magic-link sign-in and confirm the resulting link resolves through `/callback` before the user reaches `/cabinet`.
8. Open `/callback` without a code and confirm `/auth-error?reason=missing-code`.
9. Re-open a used magic-link callback and confirm `/auth-error?reason=invalid-link`.
10. If Supabase env values are still empty, expect `/api/health` to return `"status": "degraded"` with `supabase: "missing-public-env"` or `"missing-service-role"` until the app is pointed at a real stack.

## Supabase Skeleton

The integration-ready baseline is split into dedicated files:

- [`src/lib/supabase/browser.ts`](/home/mrazcore/Projects/english-platform/src/lib/supabase/browser.ts) for browser usage
- [`src/lib/supabase/server.ts`](/home/mrazcore/Projects/english-platform/src/lib/supabase/server.ts) for Server Components and route handlers
- [`src/lib/supabase/middleware.ts`](/home/mrazcore/Projects/english-platform/src/lib/supabase/middleware.ts) for SSR session refresh helpers used by the root proxy
- [`src/lib/supabase/admin.ts`](/home/mrazcore/Projects/english-platform/src/lib/supabase/admin.ts) for privileged backend-only operations
- [`src/modules/auth/application/index.ts`](/home/mrazcore/Projects/english-platform/src/modules/auth/application/index.ts) for stable auth application operations
- [`src/modules/auth/infrastructure/supabase-auth-adapter.ts`](/home/mrazcore/Projects/english-platform/src/modules/auth/infrastructure/supabase-auth-adapter.ts) as the Supabase auth adapter
- [`src/server/guards/auth-route-policy.ts`](/home/mrazcore/Projects/english-platform/src/server/guards/auth-route-policy.ts) for route classification and safe `returnTo` handling
- [`proxy.ts`](/home/mrazcore/Projects/english-platform/proxy.ts) for route-level session refresh and redirect enforcement

These files now cover the auth platform contract and middleware boundaries. User-facing form actions, callback routes, and cabinet personalization still land in the next phases.
