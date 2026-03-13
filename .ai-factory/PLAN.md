# Implementation Plan: Supabase platform and schema

Branch: none
Created: 2026-03-13

## Settings
- Testing: yes
- Logging: verbose
- Docs: yes

## Roadmap Linkage
Milestone: "Supabase platform and schema"
Rationale: This plan turns the current Supabase integration skeleton into a runnable local platform with real database migrations, generated types, seed data, and RLS rules that the next auth and curriculum milestones can safely build on.

## Assumptions
- The milestone should stay in fast-plan mode and continue the existing branchless workflow unless implementation later requires an isolated feature branch.
- Self-hosted Supabase is expected to run locally through Docker and the Supabase CLI workflow described in `.ai-factory/DESCRIPTION.md`.
- The current `src/lib/supabase/*` files are infrastructure placeholders and should now be connected to an actual schema instead of the empty `Database` type in `src/lib/supabase/types.ts`.
- This milestone should establish database and security foundations only; it must not prematurely implement full learner flows, cabinet UX, or lesson business logic.
- Schema design should prefer cross-cutting foundations and minimal domain contracts that unblock later milestones, while leaving rich curriculum/exercise payload modeling to the dedicated roadmap steps that follow.

## Commit Plan
- **Commit 1** (after tasks 1-3): `chore: configure local supabase platform workflow`
- **Commit 2** (after tasks 4-6): `feat: add initial database schema and generated supabase types`
- **Commit 3** (after tasks 7-9): `feat: add rls policies and development seed data`
- **Commit 4** (after tasks 10-11): `docs: document supabase platform and schema workflow`

## Tasks

### Phase 1: Platform Bootstrap
- [x] Task 1: Add the local Supabase platform configuration and developer commands so the repository can start, stop, and reset the self-hosted stack deterministically.
  Files: `supabase/config.toml`, `package.json`, optional helper scripts under `scripts/`
  Logging: log platform bootstrap failures through existing server tooling only when app startup depends on Supabase availability; CLI-level failures should remain visible through command output and docs instead of custom runtime noise.

- [x] Task 2: Expand the environment contract for Supabase development and deployment handoff so local CLI defaults, public URL/key usage, and service-role usage are explicit.
  Files: `.env.example`, `README.md`, `src/lib/env/*`, `src/lib/supabase/config.ts`
  Depends on: Task 1
  Logging: keep env validation fail-fast and structured; log missing or malformed Supabase configuration with safe metadata only and never expose secrets, JWT settings, or raw keys.

- [x] Task 3: Add a baseline verification path for the local Supabase stack so developers can confirm the database is reachable and schema state matches the checked-in migrations.
  Files: `package.json`, `scripts/verify.mjs`, optional `app/api/health/route.ts` updates, Supabase helper scripts
  Depends on: Task 1, Task 2
  Logging: emit a single clear INFO/DEBUG confirmation when connectivity checks succeed in development and structured ERROR logs when schema/bootstrap checks fail unexpectedly.

### Phase 2: Initial Schema Foundation
- [ ] Task 4: Create the first SQL migration with shared database primitives such as extensions, timestamp helpers, common trigger functions, and foundational enums or lookup structures needed across modules.
  Files: `supabase/migrations/*.sql`
  Logging: database functions should not create noisy audit output by default; document failure surfaces and rely on migration tooling plus app-boundary logging for diagnostics.

- [ ] Task 5: Add the first application-facing tables centered on identity and access foundations, including a public profile record linked to `auth.users` and any minimal role/membership structures required for future protected areas and internal admin tooling.
  Files: `supabase/migrations/*.sql`
  Depends on: Task 4
  Logging: keep schema-level defaults deterministic; if any trigger-based synchronization is added, ensure failures surface as database errors rather than silent partial writes.

- [ ] Task 6: Replace the placeholder Supabase database typing with generated schema types and thread those types through the shared client factories and adapters.
  Files: `src/lib/supabase/types.ts`, `src/lib/supabase/browser.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/admin.ts`, `src/modules/auth/infrastructure/supabase-auth-adapter.ts`, `package.json`
  Depends on: Task 4, Task 5
  Logging: log type-backed client initialization failures and query contract mismatches at the shared boundary only; avoid per-query noise in module code.

### Phase 3: Security and Access Rules
- [ ] Task 7: Enable Row Level Security on every new application-facing table and add reusable helper functions or policy conventions for authenticated-user ownership and internal-role checks.
  Files: `supabase/migrations/*.sql`
  Depends on: Task 5
  Logging: do not add SQL-side debug logging for normal policy evaluation; rely on Postgres/Supabase errors and application boundary logs for denied or misconfigured access.

- [ ] Task 8: Implement the first concrete policies for self-service profile access, restricted admin access, and service-role-only operations so the next auth milestone starts from a secure default.
  Files: `supabase/migrations/*.sql`, optional schema docs under `.ai-factory/` or `README.md`
  Depends on: Task 7
  Logging: unexpected policy failures should be captured at the app/server boundary with operation context, while normal authorization denials remain non-noisy and predictable.

- [ ] Task 9: Add thin application-level integration points that consume the new schema safely without implementing full auth UX yet, such as typed connectivity checks, profile snapshot access, or schema-aware health reporting.
  Files: `app/api/health/route.ts`, `src/lib/supabase/*`, `src/server/guards/*`, optional module infrastructure helpers
  Depends on: Task 6, Task 8
  Logging: keep success-path logs minimal; enrich failure logs with boundary, operation, and table/policy context without including raw session payloads or sensitive identifiers.

### Phase 4: Seed Data and Operational Readiness
- [ ] Task 10: Replace the placeholder seed file with deterministic development seed data that exercises the foundational schema, including at minimum representative profile/role fixtures and any minimal reference data required to validate RLS behavior locally.
  Files: `supabase/seed.sql`, optional supporting migration comments or helper docs
  Depends on: Task 5, Task 8
  Logging: seed execution should stay tooling-driven; document expected success/failure signals and avoid adding bespoke runtime logs for one-off data loading.

- [ ] Task 11: Document and verify the full platform workflow end to end, covering local Supabase startup, migration reset, seed loading, generated type refresh, and the expected security/health checks for this milestone.
  Files: `README.md`, optional focused docs under `.ai-factory/` or `docs/`, `package.json`, `scripts/verify.mjs`
  Depends on: Task 3, Task 6, Task 9, Task 10
  Logging: document which startup and verification messages are expected at `debug` vs `info`, and which failures should block progress immediately versus warn during local setup.

## Acceptance Criteria
- The repository can run a local self-hosted Supabase stack through checked-in configuration and documented developer commands.
- The project contains versioned SQL migrations for shared database foundations and the first auth-adjacent application tables.
- `src/lib/supabase/types.ts` is generated from the real schema rather than left as an empty placeholder, and shared Supabase clients use those types.
- Row Level Security is enabled on new tables, with explicit policies for self-access, internal/admin access, and privileged backend operations where justified.
- `supabase/seed.sql` loads deterministic development fixtures that make local schema validation and policy testing practical.
- The application has at least one schema-aware verification path proving that env configuration, connectivity, migrations, and policy-sensitive access behave as expected.
- Developer documentation explains how to bootstrap, reset, verify, and evolve the local Supabase platform without rediscovering setup decisions.

## Out of Scope
- End-user sign-up, sign-in, session UX, middleware protection, and cabinet route enforcement
- Full curriculum, lesson, exercise, or progress table design beyond minimal cross-cutting schema groundwork
- Internal admin UI screens or content-management workflows
- Production deployment hardening, backup automation, and long-term operations playbooks beyond local platform readiness
