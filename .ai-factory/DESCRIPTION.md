# Project: English Platform

## Overview
English Platform is a web application for learning English using the "Polyglot 16" method. The product focuses on structured lessons, interactive exercises, and gradual grammar reinforcement inside a personal learning cabinet.

Users can register, move through lessons in sequence, track their progress, and manage their study flow in a clear dashboard-oriented interface.

## Core Features
- User registration and authentication
- Sequential lesson flow with controlled progression
- Interactive exercises for grammar reinforcement
- Progress tracking by lesson and learning stage
- Personal cabinet for managing the study journey

## Tech Stack
- **Language:** TypeScript
- **Framework:** Next.js
- **Database:** PostgreSQL via self-hosted Supabase
- **Auth:** Supabase Auth
- **ORM / Data Access:** Supabase client + SQL migrations
- **Deployment Note:** Supabase services are expected to run in Docker

## Architecture Notes
- Application style: modular monolith
- Frontend and server logic should use Next.js App Router
- Business capabilities should be organized into explicit modules such as auth, lessons, exercises, progress, and profile
- Access control should rely on Supabase Auth and Row Level Security where appropriate
- See `.ai-factory/ARCHITECTURE.md` for detailed architecture guidelines

## Non-Functional Requirements
- Logging: configurable through `LOG_LEVEL`
- Error handling: predictable structured errors for UI and server flows
- Security: session-based authentication, protected routes, and RLS-aware data access
- Performance: lessons and dashboards should favor server rendering where it reduces client complexity
- Operations: self-hosted Supabase requires explicit backup, update, and secret management procedures
