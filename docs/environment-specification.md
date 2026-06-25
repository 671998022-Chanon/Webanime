# M2.6 — Environment Strategy

> **Scope:** This document is the **authoritative registry of all environment variables** for Nexus Anime, covering Sprints 2–11 (M2–M6). It supersedes the M1 Environment Strategy section in `milestone-1-project-foundation.md` for variable inventory and validation design. M1's tier model and naming conventions are preserved and extended here.
>
> **Status:** Draft — Pending Review
> **Date:** 2026-06-23
> **Author:** Tech Lead
> **Milestone:** M2 (Sprints 2–11)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Environment Tiers](#2-environment-tiers)
3. [Variable Naming Conventions](#3-variable-naming-conventions)
4. [Variable Registry](#4-variable-registry)
   - [4.1 Database](#41-database)
   - [4.2 Authentication](#42-authentication)
   - [4.3 Redis](#43-redis)
   - [4.4 Storage](#44-storage)
   - [4.5 API](#45-api)
   - [4.6 Monitoring](#46-monitoring)
5. [Environment Tier Matrix](#5-environment-tier-matrix)
6. [Validation Strategy](#6-validation-strategy)
7. [Secret Management](#7-secret-management)
8. [Complete `.env.example`](#8-complete-envexample)
9. [Migration from M1](#9-migration-from-m1)

---

## 1. Overview

Nexus Anime's environment configuration spans six service groups across four deployment tiers. This document provides:

- A **complete variable registry** — every environment variable the application consumes, organized by group.
- A **tier matrix** — which variables are required, optional, or absent per environment.
- A **validation strategy** — how `lib/env.ts` enforces correctness at startup.
- A **secret management policy** — how secrets are stored, promoted, and protected.

**Relationship to M1:** The M1 milestone established the `.env.example` scaffold and the `lib/env.ts` Zod validation pattern. This document extends that foundation with the full variable inventory required by M2–M6.

---

## 2. Environment Tiers

| Tier | Host | Database | Purpose |
|------|------|----------|---------|
| **Local** | Developer machine | Docker Postgres (`localhost:5432`) | Day-to-day development |
| **Preview** | Vercel Preview | Neon branch (S2+) | PR review deployments |
| **Staging** | Vercel (`staging` branch) | Neon staging | Pre-production QA |
| **Production** | Vercel (`main`) | Neon production | Live users |

M1 configured **Local** and **Preview**. M2 adds **Staging** and **Production** Neon databases. All four tiers are active by M2 completion.

---

## 3. Variable Naming Conventions

| Convention | Example | Rule |
|------------|---------|------|
| Server-only secrets | `DATABASE_URL`, `AUTH_SECRET` | Never exposed to browser; server-side code only |
| Public (client-safe) | `NEXT_PUBLIC_APP_URL` | Prefixed `NEXT_PUBLIC_`; inlined into browser bundle at build time |
| Provider-prefixed | `STRIPE_SECRET_KEY`, `RESEND_API_KEY` | Identifies the service provider for quick triage |
| Feature flags (future) | `FEATURE_SEARCH_FTS` | Prefixed `FEATURE_*`; boolean (`"true"` / `"false"`) |

**Anti-rules:**
- No secrets in client components, SSR props, or API response bodies.
- No `NEXT_PUBLIC_` prefix on sensitive variables — the prefix is a build-time contract that exposes the value to the browser bundle.
- No provider variable without the provider prefix (e.g., use `RESEND_API_KEY`, not `EMAIL_API_KEY`).

---

## 4. Variable Registry

### 4.1 Database

| Variable | Sprint | Type | Required | Default | Description |
|----------|--------|------|----------|---------|-------------|
| `DATABASE_URL` | S2 | `server-only` | Yes (S2+) | — | PostgreSQL connection string. Format: `postgresql://user:pass@host:5432/db`. Points to Docker `localhost:5432` in Local; Neon branch in Preview; Neon staging/production in higher tiers. |
| `DATABASE_POOL_SIZE` | S2 | `server-only` | No | `10` | Maximum connection pool size for Drizzle ORM. Increase for production workloads; decrease for Neon serverless to avoid connection exhaustion. |

**Usage:** Consumed by `packages/db/src/client.ts` (Drizzle connection singleton). Validated in `lib/env.ts` from S2 onward.

---

### 4.2 Authentication

| Variable | Sprint | Type | Required | Default | Description |
|----------|--------|------|----------|---------|-------------|
| `AUTH_SECRET` | S4 | `server-only` | Yes (S4+) | — | Secret key used by Auth.js v5 for JWT signing. Generate via `openssl rand -base64 32`. Must be ≥ 32 bytes. |
| `AUTH_URL` | S4 | `server-only` | Yes (S4+) | `http://localhost:3000` | Canonical URL of the application. Used by Auth.js for callback URLs and cookie domain resolution. |
| `AUTH_GITHUB_ID` | S4 | `server-only` | No | — | GitHub OAuth client ID. Required only if GitHub login is enabled. |
| `AUTH_GITHUB_SECRET` | S4 | `server-only` | No | — | GitHub OAuth client secret. Required only if GitHub login is enabled. |
| `AUTH_GOOGLE_ID` | S4 | `server-only` | No | — | Google OAuth client ID. Required only if Google login is enabled. |
| `AUTH_GOOGLE_SECRET` | S4 | `server-only` | No | — | Google OAuth client secret. Required only if Google login is enabled. |

**Usage:** Consumed by `apps/web/lib/auth.ts` (Auth.js v5 configuration). `AUTH_SECRET` is validated in `lib/env.ts` from S4. OAuth variables are validated conditionally — if one of a pair is set, the other must also be set.

---

### 4.3 Redis

| Variable | Sprint | Type | Required | Default | Description |
|----------|--------|------|----------|---------|-------------|
| `REDIS_URL` | S2 | `server-only` | Yes (Local only) | `redis://localhost:6379` | Redis connection URL for local development. Points to the Docker `redis:7-alpine` container. **Not used in Vercel deployment** — production uses Upstash REST endpoints below. |
| `UPSTASH_REDIS_REST_URL` | S11 Beta | `server-only` | No | — | Upstash Redis REST endpoint URL. Format: `https://<region>.upstash.io`. Required for production Redis access from Vercel Edge and serverless functions. |
| `UPSTASH_REDIS_REST_TOKEN` | S11 Beta | `server-only` | No | — | Upstash Redis REST authentication token. Paired with `UPSTASH_REDIS_REST_URL`. |

**Usage:** `packages/cache/src/client.ts` selects the Redis provider based on environment:
- **Local:** Uses `REDIS_URL` with `@upstash/redis` (the REST client works with any Redis URL).
- **Preview/Staging/Production:** Uses `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`.

**Note:** `REDIS_URL` is present from S2 for local development parity. `UPSTASH_REDIS_REST_*` variables are introduced at S11 Beta but scaffolded in M2 for early testing.

---

### 4.4 Storage

| Variable | Sprint | Type | Required | Default | Description |
|----------|--------|------|----------|---------|-------------|
| `CLOUDFLARE_ACCOUNT_ID` | S6 | `server-only` | No | — | Cloudflare account ID for R2 and Stream API calls. |
| `CLOUDFLARE_STREAM_API_TOKEN` | S6 | `server-only` | No | — | Cloudflare Stream API token with read/write permissions. Used for video upload, playback URL generation, and stream management. |
| `R2_ACCESS_KEY_ID` | S6 | `server-only` | No | — | Cloudflare R2 access key ID. Used for object storage (cover images, banners, thumbnails). |
| `R2_SECRET_ACCESS_KEY` | S6 | `server-only` | No | — | Cloudflare R2 secret access key. Paired with `R2_ACCESS_KEY_ID`. |
| `R2_BUCKET_NAME` | S6 | `server-only` | No | `"nexus-anime-media"` | R2 bucket name for media assets. Must match the bucket provisioned in the Cloudflare dashboard. |
| `R2_PUBLIC_URL` | S6 | `public` | No | — | Publicly accessible URL prefix for R2 assets (e.g., `https://cdn.nexusanime.com`). Used in `<img>` and `<video>` `src` attributes. Required if R2 is the media origin. |

**Usage:** Consumed by `packages/storage/src/client.ts` (Cloudflare SDK wrapper). All Cloudflare variables are optional until S6 — the application runs without video/image storage until that sprint.

---

### 4.5 API

| Variable | Sprint | Type | Required | Default | Description |
|----------|--------|------|----------|---------|-------------|
| `NEXT_PUBLIC_APP_URL` | M1 | `public` | Yes | `http://localhost:3000` | Canonical application URL. Used for generating absolute URLs in metadata, OpenGraph, and API responses. |
| `NODE_ENV` | M1 | `server-only` | Yes | `development` | Node.js environment. Valid values: `development`, `test`, `production`. Controls Next.js build optimizations, logging verbosity, and error detail exposure. |
| `RESEND_API_KEY` | S4 | `server-only` | No | — | Resend email API key. Used for transactional emails (welcome, password reset, subscription confirmation). |
| `EMAIL_FROM` | S4 | `server-only` | No | `"noreply@nexusanime.com"` | Default sender address for all outbound email. Must be a verified domain in Resend. |
| `STRIPE_SECRET_KEY` | S5 | `server-only` | No | — | Stripe secret API key (starts with `sk_live_` or `sk_test_`). Used for subscription creation, customer management, and payment intent operations. |
| `STRIPE_WEBHOOK_SECRET` | S5 | `server-only` | No | — | Stripe webhook endpoint secret. Used to verify webhook signatures on `POST /api/v1/webhooks/stripe`. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | S5 | `public` | No | — | Stripe publishable key (starts with `pk_live_` or `pk_test_`). Exposed to the browser for Stripe Elements / Stripe.js. |
| `STRIPE_NEXUS_PRICE_ID` | S5 | `server-only` | No | — | Stripe Price ID for the Nexus Prime monthly subscription (e.g., `price_1AbCdEf`). Created in Stripe test mode at $7.99/mo USD. |

**Usage:**
- `NEXT_PUBLIC_APP_URL` — Referenced in `next.config.ts`, layout metadata, and API envelope `meta` fields.
- `RESEND_API_KEY` / `EMAIL_FROM` — Consumed by `packages/email/src/client.ts`.
- `STRIPE_*` — Consumed by `features/billing/services/billing-service.ts` and the Stripe webhook route handler.

---

### 4.6 Monitoring

| Variable | Sprint | Type | Required | Default | Description |
|----------|--------|------|----------|---------|-------------|
| `SENTRY_DSN` | S9 | `server-only` | No | — | Sentry Data Source Name for server-side error reporting. Format: `https://<key>@sentry.io/<project>`. |
| `NEXT_PUBLIC_SENTRY_DSN` | S9 | `public` | No | — | Sentry DSN for client-side error reporting. Must match `SENTRY_DSN` value. Exposed to the browser for Sentry browser SDK initialization. |
| `SENTRY_ENVIRONMENT` | S9 | `server-only` | No | — (falls back to `NODE_ENV`) | Environment tag for Sentry events. Override to distinguish preview deployments (e.g., `"preview"`, `"staging"`). |
| `SENTRY_TRACES_SAMPLE_RATE` | S9 | `server-only` | No | `"0.1"` | Performance tracing sample rate (0.0–1.0). Set to `0` in development; `0.1` in production; `1.0` in staging for full trace capture. |

**Usage:** Consumed by `apps/web/lib/sentry.ts` (Sentry SDK initialization) and `sentry.config.ts` (Next.js Sentry plugin). All monitoring variables are optional — the application degrades gracefully without Sentry.

---

## 5. Environment Tier Matrix

This matrix shows the **minimum required variables** per tier. Optional variables may be set in any tier but are not required for the application to start.

| Variable | Local | Preview | Staging | Production |
|----------|:-----:|:-------:|:-------:|:----------:|
| `NODE_ENV` | Yes | Yes | Yes | Yes |
| `NEXT_PUBLIC_APP_URL` | Yes | Yes | Yes | Yes |
| `DATABASE_URL` | Yes | Yes | Yes | Yes |
| `DATABASE_POOL_SIZE` | — | — | — | — |
| `AUTH_SECRET` | — | — | Yes | Yes |
| `AUTH_URL` | — | — | Yes | Yes |
| `AUTH_GITHUB_ID` | — | — | — | — |
| `AUTH_GITHUB_SECRET` | — | — | — | — |
| `AUTH_GOOGLE_ID` | — | — | — | — |
| `AUTH_GOOGLE_SECRET` | — | — | — | — |
| `REDIS_URL` | Yes | — | — | — |
| `UPSTASH_REDIS_REST_URL` | — | — | Yes | Yes |
| `UPSTASH_REDIS_REST_TOKEN` | — | — | Yes | Yes |
| `CLOUDFLARE_ACCOUNT_ID` | — | — | — | — |
| `CLOUDFLARE_STREAM_API_TOKEN` | — | — | — | — |
| `R2_ACCESS_KEY_ID` | — | — | — | — |
| `R2_SECRET_ACCESS_KEY` | — | — | — | — |
| `R2_BUCKET_NAME` | — | — | — | — |
| `R2_PUBLIC_URL` | — | — | — | — |
| `RESEND_API_KEY` | — | — | — | — |
| `EMAIL_FROM` | — | — | — | — |
| `STRIPE_SECRET_KEY` | — | — | — | — |
| `STRIPE_WEBHOOK_SECRET` | — | — | — | — |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | — | — | — | — |
| `STRIPE_NEXUS_PRICE_ID` | — | — | — | — |
| `SENTRY_DSN` | — | — | — | — |
| `NEXT_PUBLIC_SENTRY_DSN` | — | — | — | — |
| `SENTRY_ENVIRONMENT` | — | — | — | — |
| `SENTRY_TRACES_SAMPLE_RATE` | — | — | — | — |

**Key observations:**
- **Local** requires only 3 variables: `NODE_ENV`, `NEXT_PUBLIC_APP_URL`, `DATABASE_URL`.
- **Preview** adds no mandatory variables beyond Local — it inherits Preview-scoped secrets from Vercel.
- **Staging** requires auth and Redis (Upstash) for realistic QA.
- **Production** mirrors Staging; billing and storage variables are optional until their respective sprints go live.

---

## 6. Validation Strategy

### 6.1 Validation Library

| Concern | Decision |
|---------|----------|
| Library | Zod |
| Location | `apps/web/lib/env.ts` |
| Scope | Server-only (`import "server-only"`) |
| Failure mode | Throw at startup with clear missing-variable message |
| Client access | Never import `env.ts` in client components |

### 6.2 Validation Tiers

The Zod schema is **tier-aware** — validation strictness increases as sprints progress. Variables are validated in phases:

| Phase | Sprint | Variables Validated | Behavior |
|-------|--------|---------------------|----------|
| M1 | M1 | `NODE_ENV`, `NEXT_PUBLIC_APP_URL` | Basic application bootstrap |
| M2 | S2 | + `DATABASE_URL`, `DATABASE_POOL_SIZE` | Database connectivity |
| M2 | S4 | + `AUTH_SECRET`, `AUTH_URL`, OAuth pairs | Authentication readiness |
| M2 | S5 | + `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Billing readiness |
| M2 | S6 | + `CLOUDFLARE_*`, `R2_*` | Storage readiness |
| M2 | S9 | + `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN` | Monitoring readiness |
| M2 | S11 | + `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Cache readiness |

### 6.3 Validation Pattern

```typescript
// apps/web/lib/env.ts (illustrative — actual implementation in S2)
import "server-only";
import { z } from "zod";

const envSchema = z.object({
  // ── M1 (always required) ──────────────────────────────
  NODE_ENV: z.enum(["development", "test", "production"]),
  NEXT_PUBLIC_APP_URL: z.string().url(),

  // ── S2 (Database) ──────────────────────────────────────
  DATABASE_URL: z.string().url(),
  DATABASE_POOL_SIZE: z.coerce.number().int().positive().default(10),

  // ── S4 (Auth) ──────────────────────────────────────────
  AUTH_SECRET: z.string().min(32),
  AUTH_URL: z.string().url(),
  AUTH_GITHUB_ID: z.string().optional(),
  AUTH_GITHUB_SECRET: z.string().optional(),
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),

  // ── S2 (Local Redis) ───────────────────────────────────
  REDIS_URL: z.string().url().default("redis://localhost:6379"),

  // ── S11 (Upstash Redis) ────────────────────────────────
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // ── S6 (Cloudflare) ────────────────────────────────────
  CLOUDFLARE_ACCOUNT_ID: z.string().optional(),
  CLOUDFLARE_STREAM_API_TOKEN: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().default("nexus-anime-media"),
  R2_PUBLIC_URL: z.string().url().optional(),

  // ── S4 (Email) ─────────────────────────────────────────
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().default("noreply@nexusanime.com"),

  // ── S5 (Stripe) ────────────────────────────────────────
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_NEXUS_PRICE_ID: z.string().optional(),

  // ── S9 (Monitoring) ────────────────────────────────────
  SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  SENTRY_ENVIRONMENT: z.string().optional(),
  SENTRY_TRACES_SAMPLE_RATE: z.coerce.number().min(0).max(1).default(0.1),
});

// Conditional validation: if one OAuth var is set, its pair must also be set
// (implemented via .refine() in the actual schema)

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function getEnv(): Env {
  if (cached) return cached;

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("Invalid environment variables:");
    console.error(result.error.format());
    throw new Error(
      `Environment validation failed: ${result.error.issues.map(i => i.message).join(", ")}`
    );
  }

  cached = result.data;
  return cached;
}
```

### 6.4 Client-Safe Environment

Client components never import `getEnv()`. Public variables (`NEXT_PUBLIC_*`) are inlined by Next.js at build time via the standard `process.env.NEXT_PUBLIC_*` mechanism. For typed access in client code, a separate `lib/public-env.ts` re-exports only the public subset:

```typescript
// apps/web/lib/public-env.ts (client-safe)
export const PUBLIC_ENV = {
  APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
  SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN ?? "",
} as const;
```

---

## 7. Secret Management

### 7.1 Storage by Environment

| Environment | Storage | Access |
|-------------|---------|--------|
| **Local** | `.env.local` (gitignored) | Developer machine only |
| **Vercel Preview** | Vercel encrypted env (Development + Preview scopes) | Auto-inherited on PR deploy |
| **Vercel Staging** | Vercel encrypted env (Preview scope on `staging` branch) | Deployed on `staging` branch push |
| **Vercel Production** | Vercel encrypted env (Production scope) | Deployed on `main` branch merge |
| **CI (GitHub Actions)** | GitHub Secrets | Injected into workflow via `${{ secrets.* }}` |

### 7.2 Promotion Flow

```
Local (.env.local)
  → PR Preview (Vercel auto-inherits Preview env)
    → Staging (staging branch deploy; staging-scoped secrets)
      → Production (merge to main; production-scoped secrets)
```

### 7.3 Prohibited Practices

| Prohibited | Reason |
|-----------|--------|
| Secrets in source code | Visible to anyone with repo access |
| Secrets in commit history | Persists even after removal from working tree |
| Secrets in client bundles | `NEXT_PUBLIC_` prefix is the only sanctioned client exposure path |
| Secrets in SSR props | Serialized to HTML and visible in page source |
| Secrets in CI workflow files | Workflow files are often public in open-source repos |
| `.env` committed to git | Use `.env.local` (already in `.gitignore`) |

### 7.4 Secret Rotation

| Variable | Rotation Method | Downtime |
|----------|----------------|----------|
| `AUTH_SECRET` | Generate new value → deploy → all existing sessions invalidated | Zero (new sessions use new key) |
| `DATABASE_URL` | Neon dashboard → update Vercel env → redeploy | < 1 min (connection drain) |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash dashboard → update Vercel env → redeploy | Zero (token overlap window) |
| `STRIPE_*_KEY` | Stripe dashboard (test → live) → update Vercel env → redeploy | Zero |
| `R2_*_KEY` | Cloudflare dashboard → update Vercel env → redeploy | Zero |
| `SENTRY_DSN` | Sentry project settings → update Vercel env → redeploy | Zero |
| `RESEND_API_KEY` | Resend dashboard → update Vercel env → redeploy | Zero |

---

## 8. Complete `.env.example`

```bash
# ═══════════════════════════════════════════════════════════════════
# Nexus Anime — Environment Variables
# ═══════════════════════════════════════════════════════════════════
# This file documents ALL environment variables used by the application.
# Copy to .env.local and fill in values.
#   cp .env.example .env.local
#
# Variables are grouped by service and tagged with the sprint that
# introduces them. Variables without a sprint tag are from M1.
#
# ─── Legend ────────────────────────────────────────────────────────
# [M1]  = Always required
# [S2]  = Database & Backend Foundation
# [S4]  = Authentication
# [S5]  = Billing & Subscriptions
# [S6]  = Video & Media Storage
# [S9]  = Monitoring & Observability
# [S11] = Redis Caching (Beta)
# ═══════════════════════════════════════════════════════════════════


# ── Application ────────────────────────────────────────────────────
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ── Database [S2] ─────────────────────────────────────────────────
DATABASE_URL=postgresql://nexus:nexus@localhost:5432/nexus_anime
DATABASE_POOL_SIZE=10

# ── Authentication [S4] ───────────────────────────────────────────
AUTH_SECRET=                          # openssl rand -base64 32
AUTH_URL=http://localhost:3000

# OAuth — GitHub (optional)
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=

# OAuth — Google (optional)
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

# ── Redis ─────────────────────────────────────────────────────────
# Local [S2] — Docker redis:7-alpine
REDIS_URL=redis://localhost:6379

# Upstash [S11] — Production (Vercel / serverless)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# ── Email [S4] ────────────────────────────────────────────────────
RESEND_API_KEY=
EMAIL_FROM=noreply@nexusanime.com

# ── Stripe [S5] ───────────────────────────────────────────────────
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_NEXUS_PRICE_ID=

# ── Cloudflare [S6] ───────────────────────────────────────────────
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_STREAM_API_TOKEN=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=nexus-anime-media
R2_PUBLIC_URL=

# ── Monitoring [S9] ───────────────────────────────────────────────
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_ENVIRONMENT=development
SENTRY_TRACES_SAMPLE_RATE=0
```

---

## 9. Migration from M1

The M1 milestone established a basic `.env.example` with 15 variables. This specification expands the registry to 28 variables across 6 service groups.

### 9.1 What Changed

| Aspect | M1 | M2.6 |
|--------|----|------|
| Variable count | 15 | 28 |
| Service groups | 5 (implicit) | 6 (explicit: Database, Auth, Redis, Storage, API, Monitoring) |
| Tier matrix | 4 tiers defined | 4 tiers + per-variable requirement matrix |
| Validation | Zod, 2 variables | Zod, 28 variables with phased schema |
| Secret management | Storage table only | Storage + rotation procedures + prohibited practices |
| `.env.example` | Flat list | Grouped, annotated with sprint tags |

### 9.2 Developer Action Items

1. **No immediate action** — the existing `.env.example` and `.env.local` remain functional for M1 development.
2. **At S2** — `DATABASE_URL` is already in `.env.example`. No change needed unless switching from Docker Postgres to Neon.
3. **At S4** — add `AUTH_SECRET` (generate via `openssl rand -base64 32`) and `AUTH_URL` to `.env.local`.
4. **At S5+** — add billing, storage, and monitoring variables as each sprint goes live.
5. **After M2.6 approval** — replace the M1 `.env.example` with the annotated version from Section 8.

### 9.3 Backward Compatibility

All M1 variables retain their names and semantics. No breaking changes to existing `.env.local` files.
