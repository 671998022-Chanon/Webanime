# M2.5 — Redis Strategy

> **Scope:** This document defines the **complete Redis caching strategy for Nexus Anime** as delivered under Milestone 2 (Database & Backend Foundation). It covers cache domains, key conventions, TTL strategy, invalidation patterns, rate limiting, the `@nexus/cache` workspace package, environment configuration, and scaling triggers.

> **Status:** Draft — Pending Review
> **Date:** 2026-06-23
> **Author:** Tech Lead
> **Milestone:** M2 (Sprints 2–3, with S11 Beta delivery)

---

## Table of Contents

1. [Overview & Position in the Cache Hierarchy](#1-overview--position-in-the-cache-hierarchy)
2. [Infrastructure & Client Selection](#2-infrastructure--client-selection)
3. [The `@nexus/cache` Workspace Package](#3-the-nexuscache-workspace-package)
4. [Cache Domains & TTL Strategy](#4-cache-domains--ttl-strategy)
5. [Key Naming Conventions](#5-key-naming-conventions)
6. [Read-Through Pattern & Cache Warming](#6-read-through-pattern--cache-warming)
7. [Cache Invalidation Strategy](#7-cache-invalidation-strategy)
8. [Middleware Rate Limiting](#8-middleware-rate-limiting)
9. [Session & Auth Caching](#9-session--auth-caching)
10. [Environment Variables & `lib/env.ts`](#10-environment-variables--libenvts)
11. [Scaling Triggers & Alignment with Master Roadmap](#11-scaling-triggers--alignment-with-master-roadmap)
12. [Observability](#12-observability)
13. [Testing Strategy](#13-testing-strategy)
14. [Sprint Deliverables](#14-sprint-deliverables)
15. [References](#15-references)

---

## 1. Overview & Position in the Cache Hierarchy

Nexus Anime uses a **three-tier caching architecture**. Redis occupies the middle tier — serving hot data between the Next.js ISR layer (which caches full HTML responses) and the TanStack Query client (which caches JSON in the browser).

### 1.1 Cache Tier Placement

```
┌─────────────────────────────────────────────────────────────────────┐
│  Browser (TanStack Query)                                           │
│  TTL: 30s stale / 5min GC                                          │
│  Scope: Per-user catalog browse, search results                    │
├─────────────────────────────────────────────────────────────────────┤
│  Next.js ISR Fetch Cache                                            │
│  TTL: 60s (default)                                                │
│  Scope: Title detail pages, genre lists (HTML fragments)            │
├─────────────────────────────────────────────────────────────────────┤
│  Upstash Redis  ◄── THIS DOCUMENT                                   │
│  TTL: 5–60 min                                                     │
│  Scope: Hot query results, rate limit counters, sessions, shelves   │
├─────────────────────────────────────────────────────────────────────┤
│  Neon PostgreSQL (Drizzle ORM)                                      │
│  Source of truth                                                    │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Why Redis Matters at M2

Although the master roadmap lists Redis as a "Beta feature" (S11), the caching infrastructure is **designed and scaffolded in M2** for two reasons:

1. **Rate limiting requires Redis** from S4 onward (middleware stack section 10.2). The Upstash Redis REST client must be wired, tested, and functional before middleware rate limiting goes live.
2. **Shelf caching is the first scaling trigger** (1K MAU per section 7.3 of the master roadmap). The `@nexus/cache` package and key conventions must be in place so that the 1K MAU trigger can be met by flipping a feature flag rather than writing new infrastructure.

This document therefore covers both the **scaffolding** (M2) and the **active caching logic** (S11 Beta) in a single specification.

---

## 2. Infrastructure & Client Selection

### 2.1 Upstash Redis (REST Client)

Nexus Anime uses **Upstash Redis** as the managed Redis provider. Upstash is chosen because:

- **REST-based access** — works from Vercel Edge Functions and Next.js Route Handlers without requiring a persistent TCP connection. This eliminates the need for connection pooling logic and avoids the ioredis "socket already connected" issues common in serverless environments.
- **Pay-per-request pricing** — aligns with the pay-go tier at 10K MAU scaling.
- **Global replication** — available at the 100K MAU tier (Upstash Pro 1GB) for multi-region low-latency reads.

### 2.2 Client Library: `@upstash/redis` (NOT ioredis)

The project uses the **`@upstash/redis`** npm package — Upstash's official TypeScript SDK. This is a **REST client**, not an ioredis TCP client.

| Concern | `@upstash/redis` | `ioredis` |
|---------|------------------|-----------|
| Connection model | HTTP REST (stateless) | Persistent TCP socket |
| Edge compatibility | Native (fetch-based) | Requires Node.js runtime |
| Connection pooling | Not needed (stateless) | Required in serverless |
| Turborepo compatibility | No native build issues | Can hang on dev server restart |
| Upstash integration | First-class (URL + token) | Requires REST proxy or TLS hack |

**Anti-rule:** Do not add `ioredis` as a dependency. The architecture is committed to the REST model for all Redis access.

### 2.3 Local Development

Per the M1 Docker strategy (`tooling/docker/docker-compose.yml`), a `redis:7-alpine` container runs on `localhost:6379`. The `@upstash/redis` client connects to this local instance during development via the `REDIS_URL` environment variable (see Section 10). The local Redis has AOF disabled and is **not consumed by the application until S11** — it exists for developer environment parity and early testing.

### 2.4 Production vs Local

| Concern | Local (Docker) | Production |
|---------|----------------|------------|
| Provider | `redis:7-alpine` container | Upstash Redis |
| Connection | `redis://localhost:6379` | `https://<upstash-url>` |
| Client | `@upstash/redis` (REST) | `@upstash/redis` (REST) |
| Auth | None | Token-based (`UPSTASH_REDIS_REST_TOKEN`) |
| Persistence | AOF disabled | Upstash managed |

---

## 3. The `@nexus/cache` Workspace Package

### 3.1 Package Location & Purpose

A new workspace package **`@nexus/cache`** is introduced under `packages/cache/`. This package is the **single entry point for all Redis access** in the monolith. No other package or app may import `@upstash/redis` directly.

```
packages/
├── cache/                           # @nexus/cache — Redis client + helpers
│   ├── src/
│   │   ├── client.ts                # Upstash Redis client singleton
│   │   ├── keys.ts                  # Key builder functions
│   │   ├── ttl.ts                   # TTL constants
│   │   ├── serializers.ts           # JSON serialization helpers
│   │   ├── rate-limit.ts            # Sliding window rate limiter
│   │   ├── domains/
│   │   │   ├── anime.ts             # Anime detail cache helpers
│   │   │   ├── trending.ts          # Trending/popularity cache helpers
│   │   │   ├── search.ts            # Search result cache helpers
│   │   │   └── homepage.ts          # Homepage/shelf cache helpers
│   │   └── index.ts                 # Public API barrel
│   ├── package.json
│   └── tsconfig.json
```

### 3.2 Package Dependencies

```json
{
  "name": "@nexus/cache",
  "version": "0.0.0",
  "private": true,
  "dependencies": {
    "@upstash/redis": "^1.34.0"
  },
  "devDependencies": {
    "@nexus/config-typescript": "workspace:*",
    "typescript": "^5.8.2"
  }
}
```

### 3.3 Client Singleton

```typescript
// packages/cache/src/client.ts
import { Redis } from "@upstash/redis";

let client: Redis | null = null;

export function getRedis(): Redis {
  if (!client) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      throw new Error(
        "Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN. " +
        "See docs/redis-strategy.md for configuration."
      );
    }

    client = new Redis({ url, token });
  }

  return client;
}

// For testing — allows injection of a mock client
export function setRedis(mock: Redis | null): void {
  client = mock;
}
```

**Note on environment validation:** The `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` variables are validated in `lib/env.ts` (see Section 10). The `getRedis()` function reads them directly because `@nexus/cache` is a workspace package that may be used outside the `apps/web` context where `lib/env.ts` lives. The env vars are always set in deployment environments; the runtime check above provides a clear error message if they are missing.

### 3.4 Workspace Graph

```mermaid
graph TD
    web[apps/web] --> cache[@nexus/cache]
    web --> db[@nexus/db]
    web --> auth[@nexus/auth]
    web --> ui[@nexus/ui]
    cache --> config-typescript[@nexus/config-typescript]
    db --> config-typescript
    auth --> db
    auth --> config-typescript
    ui --> config-typescript
```

---

## 4. Cache Domains & TTL Strategy

### 4.1 TTL Table

| Domain | Cache Key Pattern | TTL | Justification |
|--------|-------------------|-----|---------------|
| **Anime Details** | `v1:anime:{slug}` | 30 min | Title metadata changes rarely (admin-driven). 30 min balances freshness with DB load reduction. At 10K MAU, title pages are the highest-traffic surface. |
| **Trending / Popularity** | `v1:trending:{scope}:{cursor}` | 10 min | Trending lists shift as new anime airs or gains ratings. 10 min provides near-real-time updates without recalculating ranking on every request. |
| **Search Results** | `v1:search:{query_hash}:{cursor}` | 5 min | Search queries are high-cardinality (many unique queries). Short TTL prevents stale results while reducing DB FTS load. Hash the query string to normalize (lowercase + trim). |
| **Homepage / Shelves** | `v1:shelves:{key}` | 15 min | Shelves are curated (admin-managed) but should reflect changes within minutes. 15 min is a compromise — the homepage is the most-visited page and benefits from caching, but shelf updates should not take 60 min to appear. |
| **Genre List** | `v1:genres` | 60 min | Genre taxonomy is static after seeding. 60 min TTL is acceptable; invalidation on genre mutation is also implemented as a safety net. |
| **Studio List** | `v1:studios` | 60 min | Same rationale as genres — rarely changes reference data. |
| **Subscription Status** | `v1:subscription:{userId}` | 5 min | Must be fresh for gating decisions. 5 min ensures subscription state (e.g., cancellation, expiry) is reflected quickly without hammering the `subscriptions` table. |
| **Session Data** | N/A (handled by Auth.js) | Session TTL | Auth.js manages session persistence in its own store. Redis is not used for session storage in M2 — sessions live in the JWT cookie. This row is for documentation only. |
| **Rate Limit Counters** | `v1:rate:{ip}:{window}` | 15 min (auto-expire) | Sliding window counters auto-expire after the window passes. TTL is set to the window duration (15 min). |

### 4.2 TTL Justification Summary

The 5–60 minute range cited in the backend architecture (Section 9.1) is maintained:

- **5 min** — Search results and subscription status (highest volatility, user-specific)
- **10–15 min** — Trending and homepage (moderate volatility, high traffic)
- **30 min** — Anime details (low volatility, very high traffic)
- **60 min** — Reference data (genres, studios — effectively static)

These TTLs are defined as constants in `packages/cache/src/ttl.ts`:

```typescript
// packages/cache/src/ttl.ts
export const TTL = {
  ANIME_DETAIL: 30 * 60,        // 30 minutes
  TRENDING: 10 * 60,            // 10 minutes
  SEARCH: 5 * 60,               // 5 minutes
  SHELVES: 15 * 60,             // 15 minutes
  GENRES: 60 * 60,              // 60 minutes
  STUDIOS: 60 * 60,             // 60 minutes
  SUBSCRIPTION: 5 * 60,         // 5 minutes
  RATE_LIMIT_WINDOW: 15 * 60,   // 15 minutes
} as const;

export type TtlKey = keyof typeof TTL;
```

---

## 5. Key Naming Conventions

### 5.1 Key Format

All cache keys follow the pattern:

```
v1:{domain}:{identifier}:{qualifier}
```

| Segment | Description | Example |
|---------|-------------|---------|
| `v1` | API version prefix. Mirrors the `/api/v1/` URL prefix. When the API version bumps to `v2`, old `v1` keys are invalidated en masse by flushing the `v1:*` pattern. | `v1` |
| `{domain}` | Cache domain — one of: `anime`, `trending`, `search`, `shelves`, `genres`, `studios`, `subscription`, `rate` | `anime` |
| `{identifier}` | Primary lookup key — slug, user ID, query hash, etc. | `attack-on-titan` |
| `{qualifier}` | Optional disambiguator — cursor token, scope, language, etc. | `cursor_eyJpZCI6InV1aWQifQ` |

### 5.2 Key Builder Functions

All keys are constructed via builder functions in `packages/cache/src/keys.ts` — never by string concatenation in calling code. This prevents key format drift and ensures consistency.

```typescript
// packages/cache/src/keys.ts

export const cacheKeys = {
  animeDetail: (slug: string) => `v1:anime:${slug}`,

  trending: (scope: string, cursor?: string) =>
    cursor ? `v1:trending:${scope}:${cursor}` : `v1:trending:${scope}`,

  search: (queryHash: string, cursor?: string) =>
    cursor ? `v1:search:${queryHash}:${cursor}` : `v1:search:${queryHash}`,

  shelf: (key: string) => `v1:shelves:${key}`,

  genres: () => `v1:genres`,

  studios: () => `v1:studios`,

  subscription: (userId: string) => `v1:subscription:${userId}`,

  rateLimit: (ip: string, window: number) => `v1:rate:${ip}:${window}`,
} as const;
```

### 5.3 Query Hashing for Search Keys

Search queries are high-cardinality. To prevent key explosion, the query string is hashed (SHA-256, truncated to 16 hex characters) rather than used raw:

```typescript
// packages/cache/src/serializers.ts
import { createHash } from "node:crypto";

export function hashQuery(query: string): string {
  const normalized = query.toLowerCase().trim().replace(/\s+/g, " ");
  return createHash("sha256").update(normalized).digest("hex").slice(0, 16);
}
```

### 5.4 Key Versioning & Bulk Invalidation

The `v1:` prefix serves as a **bulk invalidation mechanism**. When the API version bumps to `v2`, a single `scan` + `delete` pass over `v1:*` keys clears the entire cache without requiring per-key logic. This is implemented in the `invalidateVersion()` helper:

```typescript
// packages/cache/src/client.ts (additional method)
export async function invalidateVersion(prefix: string): Promise<number> {
  const redis = getRedis();
  let cursor = 0;
  let deleted = 0;

  do {
    const [nextCursor, keys] = await redis.scan(cursor, {
      match: `${prefix}:*`,
      count: 100,
    });

    if (keys.length > 0) {
      await redis.del(...keys);
      deleted += keys.length;
    }

    cursor = Number(nextCursor);
  } while (cursor !== 0);

  return deleted;
}
```

---

## 6. Read-Through Pattern & Cache Warming

### 6.1 Architectural Constraint: Only Services Call Redis

Per the backend architecture (Section 4.1 — Layer Responsibilities), **only the Service layer may call Redis**. Route Handlers do not call Redis directly. Repositories do not call Redis. This constraint is enforced by ESLint `no-restricted-imports`:

```json
// .eslintrc.js (relevant rule)
{
  "rules": {
    "no-restricted-imports": [
      "error",
      {
        "patterns": [
          {
            "group": ["@nexus/cache"],
            "message": "Only Services may import @nexus/cache. Route Handlers must go through a Service."
          }
        ]
      }
    ]
  }
}
```

### 6.2 Read-Through Implementation

All cache reads use the **read-through pattern**: check Redis first, on miss query PostgreSQL via Drizzle, write to Redis, return result.

```typescript
// packages/cache/src/domains/anime.ts
import { getRedis } from "../client";
import { cacheKeys } from "../keys";
import { TTL } from "../ttl";
import type { TitleDetail } from "@nexus/db";

export async function getAnimeDetail(slug: string): Promise<TitleDetail | null> {
  const redis = getRedis();
  const key = cacheKeys.animeDetail(slug);

  // 1. Check cache
  const cached = await redis.get<TitleDetail>(key);
  if (cached !== null) {
    return cached;
  }

  // 2. Cache miss — caller is responsible for DB fetch
  // This function only handles cache concerns; the service layer
  // calls the repository and then writes back to cache.
  return null;
}

export async function setAnimeDetail(slug: string, data: TitleDetail): Promise<void> {
  const redis = getRedis();
  const key = cacheKeys.animeDetail(slug);
  await redis.set(key, data, { ex: TTL.ANIME_DETAIL });
}
```

### 6.3 Service-Layer Orchestration

The Service layer orchestrates the read-through flow:

```typescript
// apps/web/features/catalog/services/catalog-service.ts
import { getAnimeDetail, setAnimeDetail } from "@nexus/cache/domains/anime";
import { TitleRepository } from "../repositories/title-repository";

export async function getTitleBySlug({ slug }: { slug: string }) {
  // 1. Try cache
  const cached = await getAnimeDetail(slug);
  if (cached) {
    return cached;
  }

  // 2. Cache miss — query database
  const title = await titleRepository.findBySlug({ slug });
  if (!title) {
    return null;
  }

  // 3. Write-through to cache
  await setAnimeDetail(slug, title);

  return title;
}
```

### 6.4 Cache Warming (S11 Beta)

At S11, a cache warming function pre-populates high-traffic keys on deployment or after bulk invalidation:

```typescript
// packages/cache/src/warming.ts
import { getRedis } from "./client";
import { cacheKeys } from "./keys";
import { TTL } from "./ttl";
import { titleRepository } from "@nexus/db";
import { shelfRepository } from "@nexus/db";

export async function warmHomepage(): Promise<void> {
  const redis = getRedis();

  // Warm all active shelves
  const shelves = await shelfRepository.listActive();
  for (const shelf of shelves) {
    const items = await shelfRepository.getItems({ shelfId: shelf.id });
    await redis.set(cacheKeys.shelf(shelf.key), items, { ex: TTL.SHELVES });
  }

  // Warm genre list
  const genres = await genreRepository.listWithCounts();
  await redis.set(cacheKeys.genres(), genres, { ex: TTL.GENRES });
}
```

Cache warming is triggered by:
- Post-deployment hook (Vercel `postbuild` or deployment webhook)
- After bulk invalidation (see Section 7)
- On first request after a cold start (lazy warming via a `Promise` singleton to prevent thundering herd)

---

## 7. Cache Invalidation Strategy

### 7.1 Invalidation Architecture

Cache invalidation extends the existing `revalidatePath` / `revalidateTag` pattern already defined in the backend architecture (Section 9.2). The three invalidation triggers are:

| Trigger | Mechanism | Scope |
|---------|-----------|-------|
| **Time-based** | Redis TTL auto-expiry | All keys (passive) |
| **Event-based** | Server Actions call cache invalidation helpers | Specific keys (active) |
| **Stripe webhooks** | Subscription changes trigger `invalidateTag('subscription')` | User-specific keys (active) |

### 7.2 Event-Based Invalidation Helpers

```typescript
// packages/cache/src/invalidation.ts
import { getRedis } from "./client";
import { cacheKeys } from "./keys";

/**
 * Invalidate a specific anime title's cache entry.
 * Called by: Admin Server Actions (title create/update/delete)
 */
export async function invalidateAnime(slug: string): Promise<void> {
  const redis = getRedis();
  await redis.del(cacheKeys.animeDetail(slug));
}

/**
 * Invalidate all trending caches.
 * Called by: Admin Server Actions (bulk import), trending recalculation
 */
export async function invalidateTrending(): Promise<void> {
  const redis = getRedis();
  // Use scan to find all trending keys and delete in batches
  let cursor = 0;
  do {
    const [nextCursor, keys] = await redis.scan(cursor, {
      match: "v1:trending:*",
      count: 100,
    });
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    cursor = Number(nextCursor);
  } while (cursor !== 0);
}

/**
 * Invalidate a specific shelf.
 * Called by: Admin Server Actions (shelf item add/remove/reorder)
 */
export async function invalidateShelf(key: string): Promise<void> {
  const redis = getRedis();
  await redis.del(cacheKeys.shelf(key));
}

/**
 * Invalidate all shelves (e.g., after shelf reorder).
 * Called by: Admin Server Actions (shelf management)
 */
export async function invalidateAllShelves(): Promise<void> {
  const redis = getRedis();
  let cursor = 0;
  do {
    const [nextCursor, keys] = await redis.scan(cursor, {
      match: "v1:shelves:*",
      count: 100,
    });
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    cursor = Number(nextCursor);
  } while (cursor !== 0);
}

/**
 * Invalidate a user's subscription cache.
 * Called by: Stripe webhook handler (subscription updated)
 */
export async function invalidateSubscription(userId: string): Promise<void> {
  const redis = getRedis();
  await redis.del(cacheKeys.subscription(userId));
}

/**
 * Invalidate search caches (full flush — search queries are high-cardinality).
 * Called by: Admin Server Actions (title create/update/delete)
 */
export async function invalidateSearch(): Promise<void> {
  const redis = getRedis();
  let cursor = 0;
  do {
    const [nextCursor, keys] = await redis.scan(cursor, {
      match: "v1:search:*",
      count: 100,
    });
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    cursor = Number(nextCursor);
  } while (cursor !== 0);
}
```

### 7.3 Integration with Server Actions

Server Actions call both `revalidatePath` / `revalidateTag` (for ISR) **and** the cache invalidation helpers (for Redis). The pattern is:

```typescript
// apps/web/actions/admin/title-actions.ts
"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { invalidateAnime, invalidateSearch, invalidateTrending } from "@nexus/cache/invalidation";
import { requireRole } from "@nexus/auth";
import { titleRepository } from "@/features/catalog/repositories/title-repository";

export async function updateTitle(input: UpdateTitleInput) {
  await requireRole("admin");

  const updated = await titleRepository.update(input.slug, input.data);

  // ISR revalidation
  revalidatePath(`/titles/${input.slug}`);
  revalidateTag("titles");

  // Redis cache invalidation
  await invalidateAnime(input.slug);
  await invalidateSearch(); // Search results may include this title
  await invalidateTrending(); // Trending may be affected

  return { success: true, data: updated };
}
```

### 7.4 Integration with Stripe Webhooks

Per the backend architecture (Section 9.2), Stripe webhooks trigger `revalidateTag('subscription')`. The webhook handler also invalidates the Redis subscription cache:

```typescript
// apps/web/app/api/v1/webhooks/stripe/route.ts
import { revalidateTag } from "next/cache";
import { invalidateSubscription } from "@nexus/cache/invalidation";

// Inside the subscription update handler:
revalidateTag("subscription");
await invalidateSubscription(userId);
```

### 7.5 Invalidation Decision Matrix

| Mutation | ISR Revalidation | Redis Invalidation |
|----------|------------------|--------------------|
| Title created | `revalidatePath('/titles')`, `revalidateTag('titles')` | `invalidateSearch()`, `invalidateTrending()` |
| Title updated | `revalidatePath('/titles/[slug]')`, `revalidateTag('titles')` | `invalidateAnime(slug)`, `invalidateSearch()`, `invalidateTrending()` |
| Title deleted | `revalidatePath('/titles')`, `revalidateTag('titles')` | `invalidateAnime(slug)`, `invalidateSearch()`, `invalidateTrending()` |
| Shelf item added | `revalidatePath('/shelves/[key]')`, `revalidateTag('shelves')` | `invalidateShelf(key)` |
| Shelf item removed | `revalidatePath('/shelves/[key]')`, `revalidateTag('shelves')` | `invalidateShelf(key)` |
| Subscription changed | `revalidateTag('subscription')` | `invalidateSubscription(userId)` |
| Genre created/updated | `revalidateTag('genres')` | `invalidateGenres()` (rare — genres are seeded) |

---

## 8. Middleware Rate Limiting

### 8.1 Rate Limiting Strategy

The middleware rate limiter uses the **Upstash Redis sliding window algorithm** via the `@upstash/ratelimit` library. This is the official Upstash rate limiting SDK and integrates directly with the `@upstash/redis` client from `@nexus/cache`.

### 8.2 Rate Limit Configuration

| Endpoint Pattern | Limit | Window | Tier |
|-----------------|-------|--------|------|
| `/api/v1/*` | 100 requests | 15 minutes | Standard |
| `/api/v1/webhooks/*` | N/A | N/A | Exempt (Stripe signature verified) |
| `/api/v1/nexus/*` | 200 requests | 15 minutes | Authenticated (higher limit) |
| `/api/v1/admin/*` | 30 requests | 15 minutes | Admin (lower limit, sensitive) |

### 8.3 Implementation

```typescript
// packages/cache/src/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { getRedis } from "./client";
import { cacheKeys } from "./keys";

export const rateLimiters = {
  standard: new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(100, "15 m"),
    prefix: "v1:rate:standard",
  }),

  authenticated: new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(200, "15 m"),
    prefix: "v1:rate:auth",
  }),

  admin: new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(30, "15 m"),
    prefix: "v1:rate:admin",
  }),
} as const;

export type RateLimiterKey = keyof typeof rateLimiters;

/**
 * Consume a rate limit token for the given identifier.
 * Returns { success, limit, remaining, reset }.
 */
export async function consumeRateLimit(
  limiterKey: RateLimiterKey,
  identifier: string,
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const limiter = rateLimiters[limiterKey];
  const result = await limiter.limit(identifier);
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}
```

### 8.4 Middleware Integration

```typescript
// apps/web/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { consumeRateLimit } from "@nexus/cache/rate-limit";
import { getSession } from "@nexus/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Session resolution
  const session = await getSession(request);

  // 2. Rate limiting (before route matching for security)
  if (pathname.startsWith("/api/v1/")) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

    let limiterKey: "standard" | "authenticated" | "admin" = "standard";

    if (pathname.startsWith("/api/v1/admin/")) {
      limiterKey = "admin";
    } else if (session?.user) {
      limiterKey = "authenticated";
    }

    const result = await consumeRateLimit(limiterKey, ip);

    if (!result.success) {
      return NextResponse.json(
        {
          error: {
            code: "RATE_LIMITED",
            message: "Too many requests. Please retry later.",
            details: [],
          },
          meta: {
            requestId: crypto.randomUUID(),
            version: "v1",
          },
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(result.limit),
            "X-RateLimit-Remaining": String(result.remaining),
            "X-RateLimit-Reset": String(result.reset),
            "Retry-After": String(Math.ceil((result.reset - Date.now()) / 1000)),
          },
        },
      );
    }
  }

  // 3. Route guards (auth, subscription, admin)
  // ... existing route protection logic ...

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
```

### 8.5 Rate Limit Headers

All API responses include rate limit headers. These are set by the middleware on rate-limited requests and by the route handler on successful requests:

| Header | Source | Description |
|--------|--------|-------------|
| `X-RateLimit-Limit` | Middleware | Maximum requests per window |
| `X-RateLimit-Remaining` | Middleware | Requests remaining in current window |
| `X-RateLimit-Reset` | Middleware | Unix timestamp when the window resets |
| `Retry-After` | Middleware (429 only) | Seconds until the window resets |

---

## 9. Session & Auth Caching

### 9.1 Session Storage

Sessions in Nexus Anime are **JWT-based** (issued by Auth.js v5) and stored in an HTTP-only cookie (`__Host-nexus-session`). Redis is **not used for session storage** in M2. The session JWT is self-contained and validated cryptographically on each request.

### 9.2 Subscription Status Caching

While sessions are JWT-based, **subscription status** is cached in Redis because:

1. Subscription state cannot be embedded in the JWT (it changes independently of the session).
2. The subscription gate (`requireSubscriber()`) runs on every `/nexus/watch/*` request.
3. Checking the `subscriptions` table on every watch request would create unacceptable DB load.

The subscription cache is populated on login and invalidated by Stripe webhooks:

```typescript
// packages/cache/src/domains/subscription.ts
import { getRedis } from "../client";
import { cacheKeys } from "../keys";
import { TTL } from "../ttl";
import type { SubscriptionStatus } from "@nexus/db";

export async function cacheSubscriptionStatus(
  userId: string,
  status: SubscriptionStatus,
): Promise<void> {
  const redis = getRedis();
  await redis.set(cacheKeys.subscription(userId), status, { ex: TTL.SUBSCRIPTION });
}

export async function getCachedSubscriptionStatus(
  userId: string,
): Promise<SubscriptionStatus | null> {
  const redis = getRedis();
  return await redis.get<SubscriptionStatus>(cacheKeys.subscription(userId));
}
```

---

## 10. Environment Variables & `lib/env.ts`

### 10.1 Required Variables

Two new environment variables are added to support Redis:

```bash
# Upstash Redis (S11 Beta, scaffolded in M2)
UPSTASH_REDIS_REST_URL=https://<your-upstash-instance>.upstash.io
UPSTASH_REDIS_REST_TOKEN=<your-upstash-token>
```

For local development, these are set in `.env.local`:

```bash
# Local Redis (Docker)
UPSTASH_REDIS_REST_URL=http://localhost:6379
UPSTASH_REDIS_REST_TOKEN=local-dev-token-not-needed
```

**Note:** The `@upstash/redis` client requires a non-empty token string even for local development. Use any non-empty placeholder value when connecting to the local Docker Redis (which has no auth).

### 10.2 Zod Schema Extension

The `lib/env.ts` Zod schema is extended to validate the Redis variables:

```typescript
// apps/web/lib/env.ts
import "server-only";
import { z } from "zod";

const envSchema = z.object({
  // M1 validated
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),

  // M2 — Redis (S11 Beta, scaffolded in M2)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
});

const parsed = envSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
});

if (!parsed.success) {
  const formatted = parsed.error.flatten().fieldErrors;
  throw new Error(`Invalid environment variables: ${JSON.stringify(formatted)}`);
}

export const env = parsed.data;
```

**Why `.optional()`?** The Redis variables are optional in the env schema because:
- They are not required until S11 Beta activates the caching layer.
- M2 scaffolding and testing should not fail if Redis is not configured.
- The `@nexus/cache` package performs its own runtime check (see Section 3.3) with a clear error message.

**Anti-rule (per Section 4.4 of backend-architecture.md):** No `process.env` access outside `lib/env.ts`. The `@nexus/cache` package reads env vars directly only in the `getRedis()` singleton (Section 3.3) because it is a standalone workspace package that cannot import from `apps/web/lib/env.ts`. This is the **only documented exception** to the env validation rule.

### 10.3 `.env.example` Update

```bash
# ── Redis (S11 Beta — scaffolded in M2) ──────────────────
UPSTASH_REDIS_REST_URL=        # https://<instance>.upstash.io
UPSTASH_REDIS_REST_TOKEN=      # Upstash REST token
```

---

## 11. Scaling Triggers & Alignment with Master Roadmap

### 11.1 Scaling Tier Alignment

The master roadmap (Section 3.10) defines Redis scaling tiers:

| MAU Tier | Redis Plan | Configuration |
|----------|-----------|---------------|
| **< 1K MAU** | None | No active caching. Rate limiting uses in-memory fallback. |
| **1K MAU** | Enable Redis shelf caching | Upstash pay-go. Shelf queries cached at 15 min TTL. |
| **10K MAU** | Full Redis caching + signed URL cache | Upstash pay-go. All cache domains active. |
| **100K MAU** | Upstash Pro 1GB | Dedicated memory. Multi-region read replicas. |
| **1M MAU** | Upstash Enterprise | Dedicated cluster, HA, support SLA. |

### 11.2 Scaling Trigger Implementation

| Trigger | Action | Code Location |
|---------|--------|---------------|
| **1K MAU** | Enable Redis shelf caching | Feature flag `ENABLE_REDIS_SHELVES`. `ShelfService` reads from Redis; falls back to Drizzle if flag is off. |
| **10K MAU** | Enable full Redis caching + signed URL cache | Feature flag `ENABLE_REDIS_FULL`. All cache domains active. Signed stream URLs cached at 5 min TTL to reduce Cloudflare signing overhead. |
| **30K MAU** | Materialized trending view | PostgreSQL materialized view for trending calculation; Redis caches the materialized result. |
| **100K MAU** | Migrate search to Meilisearch | Redis search cache domain is decommissioned; Meilisearch becomes the search layer. |

### 11.3 Feature Flag Pattern

All Redis caching is gated by feature flags to allow gradual rollout and safe rollback:

```typescript
// packages/cache/src/feature-flags.ts
export const cacheFeatures = {
  enabled: () => process.env.ENABLE_REDIS_CACHE === "true",
  animeDetails: () => process.env.ENABLE_REDIS_CACHE === "true",
  trending: () => process.env.ENABLE_REDIS_CACHE === "true",
  search: () => process.env.ENABLE_REDIS_CACHE === "true",
  shelves: () => process.env.ENABLE_REDIS_SHELVES === "true" || process.env.ENABLE_REDIS_CACHE === "true",
  subscription: () => process.env.ENABLE_REDIS_CACHE === "true",
} as const;
```

When `ENABLE_REDIS_CACHE=false`, all cache reads return `null` (cache miss) and cache writes are no-ops. This allows the service layer to call cache helpers unconditionally without checking flags:

```typescript
// packages/cache/src/domains/anime.ts
import { cacheFeatures } from "../feature-flags";

export async function getAnimeDetail(slug: string) {
  if (!cacheFeatures.animeDetails()) {
    return null; // Cache disabled — service will query DB
  }
  const redis = getRedis();
  const cached = await redis.get<TitleDetail>(cacheKeys.animeDetail(slug));
  return cached;
}
```

---

## 12. Observability

### 12.1 Cache Metrics

The following metrics are tracked (S9+, aligned with Section 11.2 of backend-architecture.md):

| Metric | Type | Source | Alert Threshold |
|--------|------|--------|-----------------|
| Cache hit ratio | Gauge (%) | `@nexus/cache` instrumentation | < 70% |
| Cache miss rate | Counter | `@nexus/cache` instrumentation | Spike > 3x baseline |
| Redis request latency | Histogram (P50/P95/P99) | Upstash SDK | P99 > 200ms |
| Redis error rate | Counter | Upstash SDK | > 1% of requests |
| Rate limit hits | Counter | Middleware | Spike (possible abuse) |
| Active cache key count | Gauge | `SCAN` count | Approaching Upstash plan limit |

### 12.2 Instrumentation

```typescript
// packages/cache/src/instrumentation.ts
type CacheEvent = {
  operation: "get" | "set" | "del" | "miss";
  domain: string;
  key: string;
  durationMs: number;
  success: boolean;
};

export function recordCacheEvent(event: CacheEvent): void {
  // In development: console.debug
  // In production: send to Axiom / Sentry
  if (process.env.NODE_ENV === "production") {
    // Structured log for Axiom
    console.log(JSON.stringify({
      type: "cache",
      ...event,
      timestamp: new Date().toISOString(),
    }));
  }
}
```

### 12.3 Cache Key Monitoring

A `/api/v1/admin/cache/stats` endpoint (admin-only) returns current cache statistics:

```typescript
// Response shape
{
  "data": {
    "totalKeys": 1247,
    "keysByDomain": {
      "anime": 892,
      "trending": 12,
      "search": 301,
      "shelves": 5,
      "subscription": 37
    },
    "memoryUsageBytes": 5242880,
    "hitRatio": 0.87
  },
  "meta": { "requestId": "req_abc123", "version": "v1" }
}
```

---

## 13. Testing Strategy

### 13.1 Unit Tests

All cache domain functions are unit-tested with a mock Redis client:

```typescript
// packages/cache/src/__tests__/domains/anime.test.ts
import { describe, it, expect, vi } from "vitest";
import { getAnimeDetail, setAnimeDetail } from "../../domains/anime";
import { setRedis } from "../../client";

const mockRedis = {
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
};

describe("anime cache domain", () => {
  beforeEach(() => {
    setRedis(mockRedis as any);
    vi.clearAllMocks();
  });

  it("returns null on cache miss", async () => {
    mockRedis.get.mockResolvedValue(null);
    const result = await getAnimeDetail("attack-on-titan");
    expect(result).toBeNull();
    expect(mockRedis.get).toHaveBeenCalledWith("v1:anime:attack-on-titan");
  });

  it("returns cached data on hit", async () => {
    const mockData = { slug: "attack-on-titan", title: "Attack on Titan" };
    mockRedis.get.mockResolvedValue(mockData);
    const result = await getAnimeDetail("attack-on-titan");
    expect(result).toEqual(mockData);
  });

  it("writes to cache with correct TTL", async () => {
    const mockData = { slug: "attack-on-titan", title: "Attack on Titan" };
    await setAnimeDetail("attack-on-titan", mockData as any);
    expect(mockRedis.set).toHaveBeenCalledWith(
      "v1:anime:attack-on-titan",
      mockData,
      { ex: 1800 }, // 30 minutes
    );
  });
});
```

### 13.2 Integration Tests

Integration tests use the local Docker Redis container:

```typescript
// packages/cache/src/__tests__/integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getRedis } from "../client";

describe("Redis integration", () => {
  beforeAll(() => {
    process.env.UPSTASH_REDIS_REST_URL = "http://localhost:6379";
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
  });

  it("can write and read a value", async () => {
    const redis = getRedis();
    await redis.set("test:integration", "hello", { ex: 10 });
    const value = await redis.get("test:integration");
    expect(value).toBe("hello");
    await redis.del("test:integration");
  });
});
```

### 13.3 Rate Limiter Tests

```typescript
// packages/cache/src/__tests__/rate-limit.test.ts
import { describe, it, expect, vi } from "vitest";
import { consumeRateLimit } from "../rate-limit";

describe("rate limiter", () => {
  it("allows requests under the limit", async () => {
    const result = await consumeRateLimit("standard", "192.168.1.1");
    expect(result.success).toBe(true);
    expect(result.remaining).toBeLessThan(100);
  });

  it("blocks requests over the limit", async () => {
    // Consume all 100 tokens
    for (let i = 0; i < 100; i++) {
      await consumeRateLimit("standard", "192.168.1.2");
    }
    const result = await consumeRateLimit("standard", "192.168.1.2");
    expect(result.success).toBe(false);
  });
});
```

---

## 14. Sprint Deliverables

### 14.1 M2 Scaffolding (Sprints 2–3)

| Deliverable | Sprint | Status |
|-------------|--------|--------|
| `@nexus/cache` workspace package scaffolded | S2 | ⬜ |
| `client.ts` — Upstash Redis singleton | S2 | ⬜ |
| `keys.ts` — Key builder functions | S2 | ⬜ |
| `ttl.ts` — TTL constants | S2 | ⬜ |
| `serializers.ts` — Query hashing helper | S2 | ⬜ |
| `rate-limit.ts` — Sliding window rate limiter | S2 | ⬜ |
| `invalidation.ts` — Cache invalidation helpers | S2 | ⬜ |
| `feature-flags.ts` — Feature flag gating | S2 | ⬜ |
| `lib/env.ts` extended with Redis variables | S2 | ⬜ |
| Middleware rate limiting integrated | S4 | ⬜ |
| Unit tests for all cache domains | S2 | ⬜ |
| Integration tests against local Redis | S2 | ⬜ |

### 14.2 S11 Beta Activation

| Deliverable | Sprint | Status |
|-------------|--------|--------|
| `domains/anime.ts` — Anime detail cache helpers | S11 | ⬜ |
| `domains/trending.ts` — Trending cache helpers | S11 | ⬜ |
| `domains/search.ts` — Search result cache helpers | S11 | ⬜ |
| `domains/homepage.ts` — Homepage/shelf cache helpers | S11 | ⬜ |
| `domains/subscription.ts` — Subscription cache helpers | S11 | ⬜ |
| `warming.ts` — Cache warming function | S11 | ⬜ |
| `CatalogService` updated to use Redis read-through | S11 | ⬜ |
| `ShelfService` updated to use Redis read-through | S11 | ⬜ |
| `SearchService` updated to use Redis read-through | S11 | ⬜ |
| `ENABLE_REDIS_CACHE` feature flag activated | S11 | ⬜ |
| Cache metrics instrumentation | S9+ | ⬜ |
| `/api/v1/admin/cache/stats` endpoint | S8+ | ⬜ |

---

## 15. References

- [M2.1 — Backend Architecture](architecture/backend-architecture.md) — Section 9 (Caching Strategy), Section 10.2 (Middleware Stack)
- [M2.2 — Database Design](database-design.md) — Section 9 (Future Considerations, Scaling Triggers)
- [Master Roadmap](master-roadmap.md) — Section 3.8 (CDN & Caching), Section 3.10 (Scaling Tiers), Section 7.3 (Scaling Milestones)
- [API Specification](api-specification.md) — Section 1.5 (Rate Limiting), Section 4 (Catalog Endpoints)
- [M1 Spec](../milestone-1-project-foundation.md) — Section 7 (Docker Strategy), Section 6 (Environment Strategy)
- [Upstash Redis Documentation](https://upstash.com/docs/redis)
- [@upstash/redis SDK](https://github.com/upstash/upstash-redis)
- [@upstash/ratelimit SDK](https://github.com/upstash/ratelimit)

---

*This document is the authoritative reference for the Nexus Anime Redis caching strategy. All cache access patterns, key conventions, TTL values, and invalidation logic must conform to this specification.*
