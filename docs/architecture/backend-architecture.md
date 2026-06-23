# M2.1 — Backend Architecture

> **Scope:** This document defines the **backend architecture for Nexus Anime** as delivered under Milestone 2 (Database & Backend Foundation). It covers the full backend layer — module structure, folder layout, dependency rules, and API versioning — as implemented inside the Next.js 16 modular monolith.

> **Note on NestJS:** The project roadmap and ADR-001 originally considered a separate NestJS API. That approach was **rejected** in favor of a unified Next.js 16 App Router monolith. The architecture below reflects the **as-built** design. There is no NestJS runtime; the "backend" is implemented as Route Handlers + Server Actions + Service/Repository layers inside `apps/web`.

---

## 1. Architecture Overview

Nexus Anime uses a **layered modular monolith** inside Next.js 16 App Router. The backend layer lives entirely within `apps/web` and is structured around domain modules.

### 1.1 Runtime Model

```
┌─────────────────────────────────────────────────────────┐
│  Edge (Cloudflare)                                      │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Vercel Pro (Next.js 16 App Router)               │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │  Route Handlers  /  Server Actions          │  │  │
│  │  │  (HTTP parsing, Zod validation, envelope)  │  │  │
│  │  │         ↓                                   │  │  │
│  │  │  Services                                   │  │  │
│  │  │  (business logic, orchestration)            │  │  │
│  │  │         ↓                                   │  │  │
│  │  │  Repositories                               │  │  │
│  │  │  (Drizzle queries only)                     │  │  │
│  │  │         ↓                                   │  │  │
│  │  │  Drizzle ORM  →  Neon PostgreSQL            │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Layer Responsibilities

| Layer | Location | Responsibility | May Import |
|-------|----------|----------------|------------|
| **Route Handler** | `app/api/**/route.ts` | HTTP method dispatch, Zod validation, auth guard, envelope wrapping | Services, validation schemas |
| **Server Action** | `actions/*.ts` | Form mutation, revalidation, optimistic updates | Services |
| **Service** | `features/*/services/*.ts` | Business logic, orchestration, external SDK calls | Repositories, other Services |
| **Repository** | `features/*/repositories/*.ts` | Drizzle queries only — no business logic | `@nexus/db` (Drizzle client + schema) |
| **Middleware** | `middleware.ts` (root) | Session resolution, auth redirect, subscription gate, rate limiting | `@nexus/auth` (session helper) |

---

## 2. Module Structure

The backend is organized into **domain modules** under `apps/web/features/`. Each module follows a consistent internal structure.

### 2.1 Module Layout

```
features/<domain>/
├── api/                    # Route handlers (if domain exposes HTTP endpoints)
│   └── <resource>/
│       └── route.ts
├── actions/                # Server Actions (if domain has mutations)
│   └── <action>.ts
├── services/               # Business logic
│   └── <domain>-service.ts
├── repositories/           # Data access (Drizzle queries)
│   └── <domain>-repository.ts
├── schemas/                # Zod validation schemas
│   └── <domain>-schema.ts
├── types/                  # Domain-specific TypeScript types
│   └── <domain>.ts
└── index.ts                # Public API of the module
```

### 2.2 Domain Modules (M2 Delivery)

| Module | Domain | Sprint | Endpoints / Actions |
|--------|--------|--------|---------------------|
| `catalog` | Title browsing, search, shelves | S2–S3 | `GET /api/v1/titles`, `GET /api/v1/titles/[slug]`, `GET /api/v1/genres`, `GET /api/v1/shelves`, `GET /api/v1/shelves/[key]` |
| `auth` | Authentication, session, OAuth | S4 | `actions/login`, `actions/register`, `actions/logout`, Auth.js route handler |
| `billing` | Subscriptions, Stripe | S5 | `actions/subscribe`, `actions/portal`, `POST /api/v1/webhooks/stripe` |
| `library` | Watchlist, watch progress, preferences | S7 | `actions/watchlist/add`, `actions/progress/update` |
| `admin` | CMS, content ingestion | S8 | `actions/title/create`, `actions/episode/publish` |

### 2.3 Module Index Convention

Each module exports a single `index.ts` that defines its **public boundary**. Other modules may only import from this barrel — never from internal files directly.

```typescript
// features/catalog/index.ts
export { CatalogService } from './services/catalog-service';
export { TitleRepository } from './repositories/title-repository';
export type { Title, TitleDetail } from './types/catalog';
```

---

## 3. Folder Structure

### 3.1 Top-Level `apps/web` Layout (M2)

```
apps/web/
├── app/
│   ├── (marketing)/              # Marketing pages (public)
│   ├── (catalog)/                # Catalog pages (public)
│   ├── (auth)/                   # Auth pages (public)
│   ├── (app)/                    # App shell (authenticated)
│   ├── (legal)/                  # Legal pages (public)
│   ├── admin/                    # Admin CMS (staff only)
│   ├── api/                      # HTTP API endpoints
│   │   ├── health/
│   │   │   └── route.ts          # GET — liveness probe
│   │   ├── v1/
│   │   │   ├── titles/
│   │   │   │   ├── route.ts      # GET — list titles (paginated, filterable)
│   │   │   │   └── [slug]/
│   │   │   │       └── route.ts  # GET — single title detail
│   │   │   ├── genres/
│   │   │   │   └── route.ts      # GET — list all genres
│   │   │   ├── shelves/
│   │   │   │   ├── route.ts      # GET — list all shelves
│   │   │   │   └── [key]/
│   │   │   │       └── route.ts  # GET — single shelf with items
│   │   │   └── webhooks/
│   │   │       └── stripe/
│   │   │           └── route.ts  # POST — Stripe webhook (S5)
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts      # Auth.js handler (S4)
│   ├── dev/
│   │   └── components/           # Primitive showcase (dev only)
│   ├── layout.tsx                # Root layout
│   └── not-found.tsx
├── components/
│   ├── ui/                       # Re-exports from @nexus/ui
│   └── layout/                   # Layout components (providers, page shell)
├── features/                     # Domain modules (backend logic)
│   ├── catalog/
│   │   ├── api/                  # Route handler re-exports
│   │   ├── services/
│   │   │   └── catalog-service.ts
│   │   ├── repositories/
│   │   │   ├── title-repository.ts
│   │   │   ├── genre-repository.ts
│   │   │   └── shelf-repository.ts
│   │   ├── schemas/
│   │   │   └── catalog-schema.ts
│   │   ├── types/
│   │   │   └── catalog.ts
│   │   └── index.ts
│   ├── auth/                     # S4
│   ├── billing/                  # S5
│   ├── library/                  # S7
│   └── admin/                    # S8
├── lib/
│   ├── api/
│   │   ├── envelope.ts           # Success/error envelope helpers
│   │   ├── index.ts              # Re-exports
│   │   └── pagination.ts         # Pagination helpers (cursor + offset)
│   ├── env.ts                    # Zod-validated environment (server-only)
│   └── utils.ts                  # Shared utilities (cn, etc.)
├── actions/                      # Server Actions (global, cross-domain)
│   ├── auth.ts                   # S4
│   ├── billing.ts                # S5
│   └── library.ts                # S7
├── types/
│   └── index.ts                  # Shared TypeScript types
├── middleware.ts                  # Root middleware (session, auth, rate limit)
├── next.config.ts
├── tsconfig.json
├── vitest.config.ts
└── __tests__/
    ├── api/                      # API integration tests
    │   ├── titles.test.ts
    │   ├── genres.test.ts
    │   └── shelves.test.ts
    └── features/                 # Domain-level unit tests
        └── catalog/
            └── catalog-service.test.ts
```

### 3.2 Package Layout (M2 Additions)

Two new workspace packages are introduced in M2:

```
packages/
├── db/                           # @nexus/db — Drizzle schema + client
│   ├── src/
│   │   ├── client.ts             # Drizzle client singleton (Neon)
│   │   ├── schema/
│   │   │   ├── users.ts
│   │   │   ├── titles.ts
│   │   │   ├── seasons.ts
│   │   │   ├── episodes.ts
│   │   │   ├── genres.ts
│   │   │   ├── title-genres.ts
│   │   │   ├── shelves.ts
│   │   │   ├── shelf-items.ts
│   │   │   ├── subscriptions.ts
│   │   │   ├── watchlist-items.ts
│   │   │   ├── watch-progress.ts
│   │   │   └── user-preferences.ts
│   │   ├── migrations/           # Generated SQL migrations
│   │   └── index.ts
│   ├── drizzle.config.ts
│   ├── package.json
│   └── tsconfig.json
└── auth/                         # @nexus/auth — Auth.js config (S4)
    ├── src/
    │   ├── config.ts
    │   ├── handlers.ts
    │   └── index.ts
    ├── package.json
    └── tsconfig.json
```

---

## 4. Dependency Rules

### 4.1 Import Boundary Rules

The following import constraints are enforced by ESLint (`no-restricted-imports` + `import/no-cycle`):

| Layer | May Import | May NOT Import |
|-------|-----------|----------------|
| **Route Handler** | Services, Validation schemas, `@nexus/db` (for type-only imports) | Repositories directly, React components, Client code |
| **Server Action** | Services, Validation schemas | Repositories directly, Route handlers |
| **Service** | Repositories, Other Services (same domain), `@nexus/db`, External SDKs | Route handlers, React components, Next.js server-only APIs |
| **Repository** | `@nexus/db` (Drizzle client + schema) | Services, Route handlers, React components, Any `next/*` module |
| **Component (Server)** | Services (for data fetching) | Repositories, `@nexus/db`, `next/headers` directly |
| **Component (Client)** | API routes (via fetch), Server Actions | Services, Repositories, `@nexus/db`, Any server module |

### 4.2 Module-to-Module Dependencies

```
catalog ←── auth ←── billing
   ↑           ↑
   └───────────┘
   (billing gates catalog access via subscription check)

library ←── catalog
   (library references titles but does not depend on catalog module directly)

admin ←── auth + catalog
   (admin creates titles, requires auth guard)
```

### 4.3 Workspace Package Dependencies

```mermaid
graph TD
    web[apps/web] --> db[@nexus/db]
    web --> auth[@nexus/auth]
    web --> ui[@nexus/ui]
    web --> config-eslint[@nexus/config-eslint]
    web --> config-typescript[@nexus/config-typescript]
    web --> config-tailwind[@nexus/config-tailwind]
    db --> config-typescript
    auth --> db
    auth --> config-typescript
    ui --> config-typescript
```

### 4.4 Anti-Corruption Rules

1. **No `server-only` leakage:** Files that import `server-only` must never be imported by client components. ESLint rule `import/no-server-side-imports` enforces this.
2. **No direct repository access from route handlers:** Route handlers must go through a Service. This keeps business logic testable independently of HTTP.
3. **No Drizzle queries in services:** All Drizzle queries live in repositories. Services orchestrate but do not write SQL.
4. **No cross-domain imports between repositories:** A `TitleRepository` may not import from `SubscriptionRepository`. Cross-domain data assembly happens in the Service layer.
5. **Environment variables only via `lib/env.ts`:** No direct `process.env` access outside the validated env module.

---

## 5. API Versioning Strategy

### 5.1 Versioning Approach

Nexus Anime uses **URL-prefix versioning** for all API routes:

```
/api/v1/titles        ← current version
/api/v1/titles/[slug]
/api/v1/genres
/api/v1/shelves
```

The `v1` prefix is **explicit** — all versioned endpoints live under `/api/v1/`. When a breaking change is introduced, a `v2` prefix is added and `v1` is maintained in parallel for a deprecation window.

### 5.2 Version Lifecycle

| Phase | Behavior | Header |
|-------|----------|--------|
| **Active** | Default version, fully supported | `API-Version: v1` |
| **Deprecated** | Still functional, sunset announced | `API-Version: v1`, `Deprecation: true`, `Sunset: <ISO date>` |
| **Retired** | Returns `410 Gone` with migration guide link | N/A |

### 5.3 Breaking Change Policy

A **breaking change** is any of:
- Removing or renaming a response field
- Changing a field's type or nullability
- Removing an endpoint
- Changing the error code contract
- Tightening validation (rejecting previously accepted input)

**Non-breaking changes** (new fields, new optional query parameters, new endpoints) are added to the current version without a version bump.

### 5.4 Version Negotiation

Clients may request a specific version via:
1. **URL prefix** (primary): `/api/v2/titles`
2. **Accept header** (optional): `Accept: application/vnd.nexus.v2+json`

If no version is specified, the server responds with the **current active version** (default: `v1`).

### 5.5 Envelope Version Metadata

Every API response includes the version in the envelope:

```json
// Success
{
  "data": { ... },
  "meta": {
    "requestId": "req_abc123",
    "version": "v1"
  }
}

// Error
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "...",
    "details": []
  },
  "meta": {
    "requestId": "req_abc123",
    "version": "v1"
  }
}
```

---

## 6. Request/Response Flow

### 6.1 Read Path (Catalog Example)

```
GET /api/v1/titles?genre=action&page=2
  │
  ├─ middleware.ts
  │   ├─ Resolve session (if any)
  │   ├─ Rate limit check
  │   └─ Pass through
  │
  ├─ app/api/v1/titles/route.ts
  │   ├─ Parse query params
  │   ├─ Zod validation (ListTitlesSchema)
  │   ├─ Call CatalogService.list({ genre: 'action', page: 2 })
  │   │   ├─ TitleRepository.findByGenre({ genre, offset, limit })
  │   │   │   └─ Drizzle: SELECT ... FROM titles JOIN titleGenres ...
  │   │   ├─ GenreRepository.getSlugMap()
  │   │   └─ Return paginated TitleSummary[]
  │   ├─ Wrap in envelope: { data: [...], meta: { requestId, version } }
  │   └─ Return Response.json(..., { headers: { 'API-Version': 'v1' } })
  │
  └─ Client receives 200 JSON
```

### 6.2 Write Path (Server Action Example)

```
POST (Server Action) → actions/watchlist/add.ts
  │
  ├─ Auth guard (requireSubscriber)
  │   └─ Redirect to /login if unauthenticated
  │
  ├─ Zod validation (AddToWatchlistSchema)
  │
  ├─ LibraryService.addToWatchlist({ userId, titleId })
  │   ├─ TitleRepository.exists(titleId)  — verify title exists
  │   ├─ WatchlistRepository.find(userId, titleId)  — check duplicate
  │   └─ WatchlistRepository.insert({ userId, titleId, addedAt })
  │
  ├─ revalidatePath('/nexus/library')
  └─ Return { success: true }
```

---

## 7. Error Handling

### 7.1 Error Codes

| Code | HTTP | Meaning |
|------|------|---------|
| `VALIDATION_ERROR` | 400 | Input failed Zod validation |
| `UNAUTHORIZED` | 401 | Missing or invalid session |
| `FORBIDDEN` | 403 | Valid session, insufficient permission |
| `NOT_FOUND` | 404 | Resource does not exist |
| `CONFLICT` | 409 | Duplicate resource (e.g., already in watchlist) |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server failure |

### 7.2 Error Response Shape

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  },
  "meta": { "requestId": "req_abc123", "version": "v1" }
}
```

### 7.3 Error Handling in Services

Services throw typed errors. Route handlers catch and translate:

```typescript
// In service
throw new NotFoundError('Title', slug);

// In route handler
try {
  const title = await catalogService.getBySlug({ slug });
  return successEnvelope(title);
} catch (err) {
  if (err instanceof NotFoundError) {
    return errorEnvelope(404, 'NOT_FOUND', `Title ${err.ref} not found`);
  }
  throw err; // 500 — unhandled
}
```

---

## 8. Database Layer

### 8.1 Schema Organization

All Drizzle schemas live in `packages/db/src/schema/`. Each entity is a separate file. Relations are defined in a dedicated `relations.ts` file to avoid circular imports.

```typescript
// packages/db/src/schema/titles.ts
export const titles = pgTable('titles', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  title: varchar('title', { length: 500 }).notNull(),
  synopsis: text('synopsis'),
  coverImageUrl: varchar('cover_image_url', { length: 1024 }),
  // ...
});
```

### 8.2 Migration Workflow

```bash
# After schema change
pnpm db:generate     # Generate SQL migration from schema diff
pnpm db:migrate      # Apply migration to Neon (or local Postgres)
pnpm db:studio       # Open Drizzle Studio for visual inspection
```

### 8.3 Entity Map (M2)

| Table | Key Columns | Relationships |
|-------|-------------|---------------|
| `users` | id, email, name, image | → subscriptions, watchlist_items, watch_progress, user_preferences |
| `titles` | id, slug, title, synopsis, cover_image_url | M:N genres, → seasons, → shelves via shelf_items |
| `seasons` | id, title_id, number, title | → titles, → episodes |
| `episodes` | id, season_id, number, title, duration | → seasons, → stream_assets |
| `stream_assets` | id, episode_id, signed_url, expires_at | → episodes |
| `genres` | id, slug, name | M:N titles |
| `title_genres` | title_id, genre_id | Junction table |
| `shelves` | id, key, name, description | → shelf_items |
| `shelf_items` | id, shelf_id, title_id, position, added_at | → shelves, → titles |
| `subscriptions` | id, user_id, stripe_customer_id, status, current_period_end | → users |
| `watchlist_items` | id, user_id, title_id, added_at | → users, → titles |
| `watch_progress` | id, user_id, episode_id, position_seconds, updated_at | → users, → episodes |
| `user_preferences` | id, user_id, playback_quality, subtitle_language | → users |

---

## 9. Caching Strategy

### 9.1 Cache Layers

| Layer | Technology | TTL | Use Case |
|-------|-----------|-----|----------|
| **ISR** | Next.js fetch cache | 60s (default) | Title detail pages, genre lists |
| **Redis** | Upstash Redis | 5–60 min | Session data, rate limit counters, hot queries |
| **Client** | TanStack Query | 30s stale, 5min GC | Catalog browse, search results |

### 9.2 Cache Invalidation

- **Time-based:** ISR revalidates on a fixed interval (60s for catalog pages).
- **Event-based:** Server Actions call `revalidatePath` / `revalidateTag` after mutations.
- **Stripe webhooks:** Subscription changes trigger `revalidateTag('subscription')`.

---

## 10. Security Boundaries

### 10.1 Route Protection Matrix

| Route Pattern | Guard | Redirect |
|---------------|-------|----------|
| `/api/v1/*` | Rate limit (100 req/15min per IP) | 429 |
| `/api/v1/webhooks/*` | Stripe signature verification | 400 |
| `/nexus/*` | `requireAuth()` | /login |
| `/nexus/watch/*` | `requireSubscriber()` | /pricing |
| `/admin/*` | `requireRole('admin')` | /login |
| `/api/v1/admin/*` | `requireRole('admin')` + API key | 403 |

### 10.2 Middleware Stack (Order)

1. **Session resolution** — populate `req.user` from JWT cookie
2. **Rate limiting** — Upstash Redis sliding window
3. **Route matcher** — apply guards based on path prefix
4. **CORS headers** — for API routes (same-origin in prod, localhost in dev)
5. **Security headers** — Helmet via `next.config.ts`

---

## 11. Observability

### 11.1 Logging

- **Development:** `console.log` with pretty-printed JSON
- **Production:** Structured JSON to Axiom (via `next-logger` or custom pino transport)
- **Log levels:** `debug`, `info`, `warn`, `error`

### 11.2 Metrics (S9+)

- **Request latency:** P50 / P95 / P99 per endpoint
- **Error rate:** 5xx percentage per endpoint
- **Cache hit ratio:** ISR + Redis
- **Database query time:** P95 per repository method

### 11.3 Error Tracking

Sentry integration (S9) captures:
- Unhandled route handler errors
- Service-level exceptions with context (userId, requestId)
- Database query failures (sanitized — no raw SQL in breadcrumbs)

---

## 12. Testing Strategy

### 12.1 Test Layers

| Layer | Tool | Scope | Location |
|-------|------|-------|----------|
| **Unit** | Vitest | Services, Repositories, Schemas | `__tests__/features/` |
| **Integration** | Vitest + testcontainers | Route handlers against real Postgres | `__tests__/api/` |
| **E2E** | Playwright | Full user journeys (S9) | `e2e/` |

### 12.2 M2 Testing Requirements

- **Unit tests:** All Zod schemas, all Service methods with mocked Repository
- **Integration tests:** All catalog API endpoints against local Postgres (via Docker)
- **Coverage target:** ≥ 80% line coverage on `features/catalog/`

---

## 13. Environment Configuration

### 13.1 Environment Tiers

| Tier | File | Purpose |
|------|------|---------|
| Local | `.env.local` | Developer machine (gitignored) |
| Preview | Vercel env vars | PR preview deployments |
| Staging | Vercel env vars | Pre-production validation |
| Production | Vercel env vars | Live traffic |

### 13.2 Required Variables (M2)

```bash
# Database
DATABASE_URL=postgresql://nexus:nexus@localhost:5432/nexus_anime

# Auth (S4)
AUTH_SECRET=<32-char-random>
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

# Stripe (S5)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Upstash Redis (S7)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

---

## 14. Sprint M2 Deliverables Checklist

| Deliverable | Sprint | Status |
|-------------|--------|--------|
| Neon PostgreSQL project | S2 | ⬜ |
| Drizzle schema (13 tables) | S2 | ⬜ |
| Drizzle migrations generated + applied | S2 | ⬜ |
| `@nexus/db` workspace package | S2 | ⬜ |
| TitleRepository, GenreRepository, ShelfRepository | S2 | ⬜ |
| CatalogService (browse, search, shelf assembly) | S2 | ⬜ |
| Route handlers: `/api/v1/titles`, `/api/v1/titles/[slug]`, `/api/v1/genres`, `/api/v1/shelves`, `/api/v1/shelves/[key]` | S2 | ⬜ |
| Zod validation on all inputs | S2 | ⬜ |
| Standard API envelope on all responses | S2 | ⬜ |
| Seed data: 12+ genres, 3 shelves | S2 | ⬜ |
| Integration tests for catalog API | S2 | ⬜ |
| Home page with HeroBanner + 3 ContentShelves | S3 | ⬜ |
| Browse page with genre filter | S3 | ⬜ |
| Search page with PostgreSQL FTS | S3 | ⬜ |
| Title detail page with episode list | S3 | ⬜ |
| ISR for title pages | S3 | ⬜ |

---

## 15. References

- [ADR-001: Modular Monolith in Next.js 16](adr/001-modular-monolith-nextjs.md)
- [Master Roadmap](master-roadmap.md) — v10.0
- [M1 Spec](../milestone-1-project-foundation.md)
- [Sprint Plans](sprint-plans.md) — Sprints 2–3
- [GitHub Issues](github-issues.md) — Issues #008–#017
