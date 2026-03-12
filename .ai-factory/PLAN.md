# Implementation Plan: Application foundation

Branch: none
Created: 2026-03-12

## Settings
- Testing: yes
- Logging: verbose
- Docs: yes

## Roadmap Linkage
Milestone: "Application foundation"
Rationale: This plan covers the initial Next.js project scaffold, shared technical baseline, and app-level conventions required before schema, auth, and domain modules can be implemented cleanly.

## Assumptions
- The repository remains in fast-plan mode because Git has no commits yet and a branch-based workflow would add overhead without benefit.
- The goal of this milestone is to establish runnable application infrastructure, not to deliver Supabase schema, full authentication flows, or learning-domain features.
- The implementation should follow the modular monolith layout defined in `.ai-factory/ARCHITECTURE.md`.
- The file `design.html` is the current UI reference for page composition, component rhythm, and the target color palette for the first product-facing screens.
- The visual reference in `design.html` can be structurally reused, but all user-facing copy in the application must remain in Russian.

## Commit Plan
- **Commit 1** (after tasks 1-3): `chore: scaffold nextjs application foundation`
- **Commit 2** (after tasks 4-6): `feat: add app shell env and logging foundation`
- **Commit 3** (after tasks 7-9): `feat: align core shells with approved design reference`
- **Commit 4** (after tasks 10-11): `docs: document application foundation setup`

## Tasks

### Phase 1: Bootstrap
- [x] Task 1: Scaffold the Next.js TypeScript application with App Router, baseline scripts, and the initial dependency set required for the architecture.
  Files: `package.json`, `tsconfig.json`, `next.config.*`, `app/`, `src/`
  Logging: no feature logs yet; ensure install/build/start failures surface clearly through standard tooling output and document expected startup diagnostics.

- [x] Task 2: Create the target folder structure from the architecture document so future modules have stable boundaries from day one.
  Files: `app/(public)/`, `app/(auth)/`, `app/(cabinet)/`, `src/modules/`, `src/lib/`, `src/shared/`, `src/server/`, `supabase/`
  Logging: add only setup-level comments or diagnostics where bootstrapping could fail; avoid noisy runtime logs for static structure work.

- [x] Task 3: Add environment parsing and validation for application-level configuration, including `LOG_LEVEL` and placeholders for future Supabase integration.
  Files: `src/lib/env/*`, `.env.example`, startup wiring files
  Logging: log validated runtime mode and active log level in DEBUG/INFO without leaking secrets; fail fast with structured startup errors when required variables are missing.

### Phase 2: Core Foundation
- [x] Task 4: Build the root layout, global styles, metadata baseline, and route-group shells for public, auth, and cabinet areas.
  Files: `app/layout.tsx`, `app/globals.css`, `app/(public)/*`, `app/(auth)/*`, `app/(cabinet)/*`
  Logging: keep UI rendering logs minimal; route-level server boundaries should log unexpected failures through the shared logger rather than per-render noise.

- [x] Task 5: Establish shared UI and design foundations such as tokens, base components, and reusable layout primitives that fit the existing product direction.
  Files: `src/shared/ui/*`, `src/shared/utils/*`, styling/token files
  Logging: do not log normal component renders; only log initialization or asset-loading failures that affect bootstrapping or recoverability.

- [x] Task 6: Implement the cross-cutting technical baseline for structured errors and environment-driven logging.
  Files: `src/lib/logger/*`, `src/shared/types/*`, `src/server/guards/*` or equivalent error helpers
  Logging: standardize log format, levels, and context fields; log entry/exit around server boundaries and all unexpected exceptions at ERROR with safe metadata.

### Phase 3: Design Alignment
- [x] Task 7: Extract the approved visual direction from `design.html` into application-level tokens and shared styling rules.
  Files: `design.html`, `app/globals.css`, `src/shared/ui/tokens.css`, shared styling helpers
  Logging: do not add render-time logs for purely visual work; if any design-config bootstrap step can fail, surface it only once with safe startup context.

- [x] Task 8: Rebuild the public landing, auth flows, and cabinet dashboard shells so they match the approved reference structure while keeping all UI copy in Russian.
  Files: `app/(public)/*`, `app/(auth)/*`, `app/(cabinet)/cabinet/*`, related shared UI pieces
  Depends on: Task 4, Task 5, Task 7
  Logging: keep route rendering quiet; preserve server-boundary logging for unexpected failures only.

- [x] Task 9: Expand the shared UI foundation around the approved design system so future lessons, exercise, progress, and profile pages can reuse stable primitives instead of duplicating one-off markup.
  Files: `src/shared/ui/*`, `src/shared/utils/*`, optional design notes or mapping docs
  Depends on: Task 5, Task 7, Task 8
  Logging: avoid component-level logs; only log unexpected initialization failures for shared technical primitives if they affect recoverability.

### Phase 4: Integration Readiness
- [x] Task 10: Add the infrastructure skeleton for future Supabase usage without implementing domain queries or schema logic yet.
  Files: `src/lib/supabase/*`, placeholder adapters, shared types
  Depends on: Task 3, Task 6, Task 9
  Logging: log client creation/configuration failures and auth-boundary issues without exposing tokens, URLs with secrets, or raw session payloads.

- [x] Task 11: Add baseline verification and developer onboarding artifacts so the scaffold can be reliably continued in the next milestones.
  Files: `README.md` or focused setup doc, optional health-check page, package scripts
  Depends on: Task 1, Task 3, Task 4, Task 6, Task 8, Task 10
  Logging: document expected local startup messages, how `LOG_LEVEL` changes behavior, and which failures should block progress versus warn only.

## Acceptance Criteria
- The repository boots as a Next.js App Router application with the planned folder structure in place.
- Environment variables are validated centrally and missing required values fail early with safe error messages.
- Logging is controlled through `LOG_LEVEL` and available as a reusable app-level utility.
- Public, auth, and cabinet route groups have a usable shell layout ready for later feature work and aligned with the approved design reference.
- The first product-facing screens use the shared color palette and visual system extracted from `design.html`, with Russian-language UI copy.
- The codebase has explicit locations for modules, shared UI, server guards, env handling, and future Supabase adapters.
- The project includes enough setup documentation that the next milestone can begin without rediscovering foundation decisions.

## Out of Scope
- SQL migrations, seed data, or Row Level Security implementation
- Production-ready authentication flows and session UX
- Lesson, exercise, progress, or profile business logic
- CI/CD, full test coverage, or deployment automation beyond basic local verification
