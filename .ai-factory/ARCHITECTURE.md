# Architecture: Modular Monolith

## Overview
This project should start as a modular monolith built on Next.js App Router with Supabase as the backing platform for Postgres and authentication. That gives fast delivery for a single product while keeping strong boundaries between business areas such as lessons, exercises, progress, and profile.

The domain is more structured than a simple CRUD app, but it does not justify microservices or heavy DDD overhead at the start. A modular monolith keeps deployment simple, preserves product velocity, and still gives enough internal separation to avoid turning the codebase into a feature blob.

## Decision Rationale
- **Project type:** learning platform with structured educational flows and user progress
- **Tech stack:** TypeScript, Next.js App Router, self-hosted Supabase, PostgreSQL
- **Key factor:** moderate domain complexity with a strong need for fast iteration and clear module boundaries

## Folder Structure
```text
app/
├── (public)/                  # Landing and public routes
├── (auth)/                    # Login, registration, auth callbacks
├── (cabinet)/                 # Protected user cabinet area
├── lessons/                   # Lesson routes and nested segments
├── api/                       # Thin route handlers when needed
└── layout.tsx                 # Root layout

src/
├── modules/
│   ├── auth/
│   │   ├── application/       # Auth use cases and orchestration
│   │   ├── infrastructure/    # Supabase auth adapters
│   │   ├── types/
│   │   └── ui/
│   ├── lessons/
│   │   ├── application/       # Lesson sequencing and access rules
│   │   ├── infrastructure/    # Lesson queries and persistence
│   │   ├── types/
│   │   └── ui/
│   ├── exercises/
│   ├── progress/
│   └── profile/
├── lib/
│   ├── supabase/              # Shared server/browser Supabase clients
│   └── env/                   # Environment parsing and validation
├── shared/
│   ├── ui/                    # Reusable presentational components
│   ├── utils/                 # Pure utilities with no product semantics
│   └── types/                 # Cross-module shared types only when justified
└── server/
    └── guards/                # Server-only access and auth helpers

supabase/
├── migrations/                # SQL migrations
├── seed.sql                   # Local bootstrap data
└── config.toml                # Supabase local configuration
```

## Dependency Rules
- `app/` may depend on `src/modules/*`, `src/lib/*`, and `src/shared/*`
- `src/modules/<module>/ui` may depend on its own `application`, `types`, `src/shared`, and framework primitives
- `src/modules/<module>/application` may depend on its own `infrastructure` only through explicit adapters or service boundaries
- `src/shared/*` must not depend on any business module
- `src/lib/*` provides technical integration code and must not contain business rules

- ✅ Route segments call module application functions or server-side orchestration helpers
- ✅ Supabase clients are created in `src/lib/supabase` and reused through module adapters
- ❌ One business module importing another module's infrastructure internals
- ❌ Business rules implemented directly in `app/page.tsx`, `route.ts`, or UI components
- ❌ Shared utilities becoming a dumping ground for feature-specific logic

## Layer/Module Communication
- Route handlers, Server Components, and Server Actions should call a module's application layer
- Each module should expose a small public surface, for example `getLessonForUser`, `completeExercise`, `getProgressSummary`
- Cross-module communication should happen through application services, not by reaching into another module's SQL or Supabase queries
- Authorization checks should happen close to the server boundary and be reinforced by RLS in the database

## Key Principles
1. Keep business logic inside modules, not in route files or UI trees.
2. Treat Supabase as infrastructure: useful and central, but not a reason to scatter auth and query code across the app.
3. Prefer server-first rendering and mutations when it simplifies security, data fetching, and progress consistency.

## Code Examples

### Module-Level Read Model
```typescript
// src/modules/lessons/application/get-lesson-for-user.ts
import { createServerSupabaseClient } from '@/src/lib/supabase/server'

type GetLessonForUserParams = {
  lessonId: string
  userId: string
}

export async function getLessonForUser({
  lessonId,
  userId,
}: GetLessonForUserParams) {
  const supabase = await createServerSupabaseClient()

  const { data: lesson, error } = await supabase
    .from('lessons')
    .select('id, title, order_index, content')
    .eq('id', lessonId)
    .single()

  if (error) {
    throw new Error('Failed to load lesson')
  }

  const { data: progress } = await supabase
    .from('lesson_progress')
    .select('status')
    .eq('lesson_id', lessonId)
    .eq('user_id', userId)
    .maybeSingle()

  return {
    lesson,
    progressStatus: progress?.status ?? 'not_started',
  }
}
```

### Thin Route Composition
```typescript
// app/lessons/[lessonId]/page.tsx
import { redirect } from 'next/navigation'

import { requireUser } from '@/src/server/guards/require-user'
import { getLessonForUser } from '@/src/modules/lessons/application/get-lesson-for-user'

type PageProps = {
  params: Promise<{ lessonId: string }>
}

export default async function LessonPage({ params }: PageProps) {
  const { lessonId } = await params
  const user = await requireUser()
  const result = await getLessonForUser({
    lessonId,
    userId: user.id,
  })

  if (!result.lesson) {
    redirect('/cabinet')
  }

  return <div>{result.lesson.title}</div>
}
```

## Anti-Patterns
- ❌ Writing Supabase queries directly in every page and component
- ❌ Mixing lesson progression rules with rendering concerns
- ❌ Sharing raw table shapes across the whole app as if they were stable domain contracts
- ❌ Treating RLS as optional and duplicating inconsistent permission checks in multiple layers
