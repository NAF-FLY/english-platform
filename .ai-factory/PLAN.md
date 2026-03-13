# Implementation Plan: Authentication and protected cabinet

Branch: none
Created: 2026-03-13

## Settings
- Testing: yes
- Logging: verbose
- Docs: yes

## Roadmap Linkage
Milestone: "Authentication and protected cabinet"
Rationale: This plan turns the current Supabase-ready UI shells and request access snapshot into a real learner authentication flow with protected routing, session persistence, and the first personalized cabinet boundary that later lesson and progress milestones can build on safely.

## Locked Decisions
- The project stays in fast-plan mode and continues the current branchless workflow unless implementation later proves auth changes need an isolated feature branch.
- MVP authentication is limited to Supabase `email/password`; the existing Google and Apple buttons remain clearly deferred UI affordances and must not imply real provider support.
- Sign-up is confirmation-first: after registration the product shows a “check your email” state and does not auto-sign the learner into the cabinet.
- Sign-up reuses the existing database trigger `public.handle_auth_user_created()` for profile bootstrap and learner-role assignment instead of duplicating profile creation in application code.
- Session truth remains server-first through Next.js App Router, Supabase SSR cookies, and route middleware rather than a client-side global auth store.
- Route protection must cover both sides of the flow: anonymous users do not enter `/cabinet`, and authenticated users are redirected away from `/sign-in` and `/sign-up`.
- `returnTo` is supported, but only for validated internal application paths; any missing or unsafe destination falls back to `/cabinet`.
- This milestone delivers an identity-level cabinet shell only; lesson sequencing, progress aggregation, profile editing, and richer dashboard logic stay intentionally shallow until their dedicated roadmap milestones.
- Recovery scope is minimal: expired or invalid auth links must resolve to a clear non-dead-end state, but full password reset UX stays out of scope.
- Local self-hosted Supabase configuration must include explicit auth redirect and callback settings so email confirmation and SSR session exchange work consistently in development and deployment handoff.

## Commit Plan
- **Commit 1** (after tasks 1-4): `chore: add auth route policy and middleware boundaries`
- **Commit 2** (after tasks 5-8): `feat: implement supabase email auth flows`
- **Commit 3** (after tasks 9-11): `feat: protect cabinet and personalize learner shell`
- **Commit 4** (after tasks 12-13): `docs: document auth and protected cabinet workflow`

## Tasks

### Phase 1: Auth Platform Contract
- [x] Task 1: Extend the local Supabase Auth and environment contract for callback URLs, allowed redirects, safe internal `returnTo` usage, and SSR cookie-based session handling so sign-in, sign-up, and email-confirmation flows work in both local and deployed environments without hidden config drift.
  Files: `supabase/config.toml`, `.env.example`, `src/lib/env/*`, `src/lib/supabase/config.ts`, `README.md`
  Logging: keep env/config validation fail-fast and structured; log missing or invalid auth configuration with safe metadata only and never expose cookies, secrets, or redirect tokens.

- [x] Task 2: Add the auth application surface that wraps Supabase email/password operations and translates provider responses into stable app-level results for sign in, sign up, sign out, callback exchange, and auth-state reads.
  Files: `src/modules/auth/application/*`, `src/modules/auth/types/*`, `src/modules/auth/infrastructure/supabase-auth-adapter.ts`
  Depends on: Task 1
  Logging: emit one structured log per unexpected auth boundary failure with operation and safe error context; never log plaintext credentials, raw sessions, or recovery tokens.

- [x] Task 3: Introduce explicit access and redirect helpers that define policy for public pages, auth pages, and protected cabinet routes, reusing the existing request access snapshot instead of scattering auth checks across route components.
  Files: `src/server/guards/*`, `src/modules/auth/application/*`, optional shared auth result types under `src/shared/types/*`
  Depends on: Task 2
  Logging: boundary decisions may emit debug-level diagnostics during development, but normal anonymous-to-login redirects must stay quiet and predictable.

- [x] Task 4: Create the root `proxy.ts` and integrate `src/lib/supabase/middleware.ts` so request cookies are refreshed consistently and route groups can enforce `/(cabinet)` protection while redirecting already-authenticated users away from `/(auth)` routes.
  Files: `proxy.ts`, `src/lib/supabase/middleware.ts`, optional route matcher helpers or docs
  Depends on: Task 3
  Logging: keep success-path middleware silent; log only unexpected session-refresh or redirect-construction failures with safe route metadata and no cookie contents.

### Phase 2: User-Facing Auth Flows
- [x] Task 5: Wire the sign-up route to a real server action or application use case that submits email, password, and display-name metadata to Supabase Auth, relies on the existing DB trigger for profile bootstrap, and always ends in an explicit confirmation-pending state instead of immediate cabinet access.
  Files: `app/(auth)/sign-up/page.tsx`, `src/modules/auth/application/*`, `src/modules/auth/ui/*`, optional shared form primitives
  Depends on: Task 2, Task 3
  Logging: validation and provider failures should map to stable user-facing errors; boundary logs may include operation and provider code but never raw credentials or confirmation links.

- [x] Task 6: Wire the sign-in route to a real server action or application use case for email/password authentication, validated internal `returnTo` handling, and consistent messaging for invalid credentials, missing confirmation, or stale auth state.
  Files: `app/(auth)/sign-in/page.tsx`, `src/modules/auth/application/*`, `src/modules/auth/ui/*`, optional query-param helpers
  Depends on: Task 2, Task 3
  Logging: only unexpected provider or redirect failures should be logged; normal authentication denials remain user-visible but non-noisy.

- [x] Task 7: Add callback and sign-out entrypoints for the post-auth lifecycle, including Supabase code exchange, safe redirect resolution, expired or invalid link handling, and user-initiated session termination.
  Files: `app/(auth)/callback/route.ts`, optional `app/(auth)/auth-error/page.tsx`, `src/modules/auth/application/*`, `src/server/guards/*`, protected action entrypoints under `app/(cabinet)/`
  Depends on: Task 4, Task 5, Task 6
  Logging: callback failures should capture route boundary and failure type without including OAuth or email-link codes, raw cookies, or unredacted user payloads.

- [x] Task 8: Extract shared auth form-state and message components so sign-in, sign-up, confirmation, and error states reuse one UX contract, and downgrade the current social-entry buttons from misleading CTAs into clearly disabled or deferred MVP affordances.
  Files: `src/modules/auth/ui/*`, `app/(auth)/sign-in/page.tsx`, `app/(auth)/sign-up/page.tsx`, `app/globals.css` or shared UI styles
  Depends on: Task 5, Task 6, Task 7
  Logging: none beyond existing server-boundary wrappers; UI-state changes should not add per-render or per-interaction log noise.

### Phase 3: Protected Cabinet Shell
- [x] Task 9: Create a minimal server-side cabinet or profile read model that resolves the authenticated learner's display identity, role flags, and header-level cabinet data through module code instead of hardcoded page copy, without pulling lesson or progress aggregation into this milestone.
  Files: `src/modules/profile/application/*`, `src/modules/profile/infrastructure/*`, or `src/modules/auth/application/*` if the read model stays auth-scoped; `src/server/guards/get-request-access-snapshot.ts`
  Depends on: Task 2, Task 3
  Logging: profile-read failures should be logged once at the read-model boundary with operation and table context, never with raw auth payloads.

- [x] Task 10: Convert the `(cabinet)` layout and `/cabinet` page from a generic showcase shell into a protected personalized cabinet that requires a session, shows the current learner identity and role-aware navigation, and exposes a real sign-out control while preserving future lesson and progress panels as placeholders.
  Files: `app/(cabinet)/layout.tsx`, `app/(cabinet)/cabinet/page.tsx`, `src/shared/ui/workspace-shell.tsx`, `src/modules/auth/ui/*`, `src/modules/profile/application/*`
  Depends on: Task 4, Task 7, Task 9
  Logging: normal protected rendering should stay quiet; unexpected cabinet-load failures should surface through the existing server boundary with auth or cabinet context only.

- [x] Task 11: Make public and auth-adjacent surfaces session-aware so returning users see the right primary CTA, authenticated users are redirected away from duplicate auth screens, and anonymous users are always funneled to sign-in before protected content.
  Files: `app/(public)/page.tsx`, `app/(public)/layout.tsx`, `app/(auth)/layout.tsx`, `src/server/guards/*`, optional shared navigation helpers
  Depends on: Task 4, Task 6, Task 10
  Logging: redirect-policy mismatches and unexpected access-snapshot failures should be logged once at the boundary; expected CTA branching should not log.

### Phase 4: Verification and Docs
- [x] Task 12: Add verification coverage for the auth milestone using deterministic local fixtures and seeded accounts, covering anonymous protected-route redirect, successful seeded sign-in, sign-out, callback handling, invalid or expired auth-link behavior, and cabinet access after session establishment.
  Files: `scripts/verify.mjs`, `package.json`, optional lightweight auth smoke helpers
  Depends on: Task 4, Task 7, Task 10, Task 11
  Logging: verification should print concise pass or fail diagnostics and rely on runtime logs only for unexpected application-side failures.

- [x] Task 13: Document the end-to-end auth and protected cabinet workflow, including local seeded credentials, email-confirmation behavior, redirect rules, middleware expectations, and the manual plus automated verification checklist for this milestone.
  Files: `README.md`, optional focused docs under `.ai-factory/` or `docs/`
  Depends on: Task 12
  Logging: document which auth events are expected at `debug` versus `info` and which failures should block progress immediately versus warn during local setup.

## Acceptance Criteria
- Email/password sign up, sign in, and sign out work end to end against the local self-hosted Supabase stack.
- The application maintains session cookies across requests through SSR-compatible middleware and uses that state for route protection rather than a client-only auth source of truth.
- Sign-up always lands in a confirmation-pending state, and the confirmation callback exchanges the auth code into a valid SSR session before redirecting onward.
- Anonymous requests to `/cabinet` are redirected to sign-in, and authenticated users are redirected away from `/sign-in` and `/sign-up` to `/cabinet` or a validated internal return path.
- Sign-up relies on the existing database-triggered profile and learner-role bootstrap instead of duplicating profile creation in application code.
- Invalid or expired auth links resolve to a clear user-facing error state instead of a dead-end or silent failure.
- The initial cabinet shell shows real current-user identity, role flags, and a functioning sign-out path while keeping later lesson and progress panels intentionally lightweight.
- Local verification and documentation explain seeded-user login, confirmation or callback caveats, redirect policy, and expected middleware behavior.

## Out of Scope
- Social OAuth provider implementation for Google or Apple beyond keeping the UI honest about those paths being deferred.
- Full password-reset and recovery UX beyond the minimal callback and error plumbing required to avoid broken auth links.
- Lesson sequencing, exercise submission, progress aggregation, or full profile-editing workflows.
- Internal staff or admin dashboards beyond preserving role-aware hooks for future protected areas.
