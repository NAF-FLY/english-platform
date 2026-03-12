# Project Roadmap

> Build an English learning platform around the Polyglot 16 method with guided lessons, interactive practice, and clear learner progress.

> Launch priority: deliver an MVP with curated learning content, authenticated learner flows, and an internal content management path before investing in broader operational polish.

## Milestones

- [x] **Product and architecture baseline** — define product scope, core modules, stack, and implementation constraints for the first delivery phase
- [ ] **Application foundation** — scaffold the Next.js App Router project, shared layout, environment validation, and base technical conventions
- [ ] **Supabase platform and schema** — set up self-hosted Supabase, initial SQL migrations, seed data, and Row Level Security foundations
- [ ] **Authentication and protected cabinet** — implement sign up, sign in, session handling, route protection, and the initial personal cabinet shell
- [ ] **Curriculum and lesson content model** — define how Polyglot 16 units, lessons, explanations, and exercise payloads are stored and seeded for the first release
- [ ] **Lesson domain and sequencing** — model Polyglot 16 lessons, unlock rules, lesson navigation, and server-side lesson loading flows
- [ ] **Exercise engine** — build grammar exercise types, answer validation, feedback flow, and result persistence
- [ ] **Progress tracking and dashboard** — store per-user completion state, expose progress summaries, and show learning status in the cabinet
- [ ] **Internal content admin** — provide protected internal tools to create, edit, review, and publish lessons and exercises without direct database edits
- [ ] **Quality gates and observability** — add structured errors, logging via `LOG_LEVEL`, linting, testing, and basic health checks
- [ ] **Deployment and operations** — prepare production deployment, backups, secret handling, and update procedures for the app and self-hosted Supabase

## Completed

| Milestone | Date |
|-----------|------|
| Product and architecture baseline | 2026-03-12 |
