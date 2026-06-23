# Milestone 1 — Project Foundation

**Document Type:** Implementation Specification  
**Milestone ID:** M1  
**Epic:** E-01 — Foundation & Design System  
**Sprint:** S1 (Weeks 1–2)  
**Status:** Approved for Implementation  
**Authority:** `docs/master-roadmap.md` v10.0  
**Scope:** Repository, monorepo, Next.js architecture, packages, environments, Docker, CI/CD, coding standards  
**Excludes:** Application source code, UI component implementations, database schema

---

## Table of Contents

1. [Milestone Overview](#1-milestone-overview)
2. [Repository Structure](#2-repository-structure)
3. [Monorepo Structure](#3-monorepo-structure)
4. [Next.js Architecture](#4-nextjs-architecture)
5. [Package Strategy](#5-package-strategy)
6. [Environment Strategy](#6-environment-strategy)
7. [Docker Strategy](#7-docker-strategy)
8. [CI/CD Strategy](#8-cicd-strategy)
9. [Coding Standards](#9-coding-standards)
10. [Definition of Done](#10-definition-of-done)
11. [Handoff to Sprint 2](#11-handoff-to-sprint-2)

---

## 1. Milestone Overview

### 1.1 Purpose

Milestone 1 establishes the **engineering foundation** for Nexus Anime: a pnpm + Turborepo monorepo hosting a Next.js 16 modular monolith, with shared configuration packages, environment conventions, local Docker services, CI/CD pipelines, and coding standards. All subsequent sprints (S2–S10) depend on this scaffold.

### 1.2 Success Gate (M1)

| Criterion | Threshold |
|-----------|-----------|
| Monorepo builds | `pnpm build` succeeds at root |
| Type safety | `pnpm typecheck` zero errors |
| Lint | `pnpm lint` zero errors |
| Design tokens | Void Base, Resonance, Rift Gold encoded in Tailwind preset |
| UI primitives | Button, Badge, Input, Skeleton defined in `@nexus/ui` |
| Application shell | PageShell + TopNav on `/` |
| Route groups | All MVP route groups scaffolded with placeholder pages |
| Preview deploy | Vercel preview succeeds on a test PR |
| Local dev | `docker compose up` starts Postgres, Redis, Mailpit |
| CI pipeline | Lint → typecheck → test → build green on PR |

### 1.3 In Scope

- Monorepo root configuration (`pnpm-workspace.yaml`, `turbo.json`, root `package.json`)
- `apps/web` Next.js 16 App Router scaffold
- Shared packages: `@nexus/ui`, `@nexus/config-*` (eslint, typescript, tailwind)
- Path aliases and import boundary rules
- Route group directory structure (empty/placeholder pages)
- `.env.example` with documented variables
- Docker Compose for local backing services
- GitHub Actions CI workflow (lint, typecheck, test, build)
- Vercel project linked to GitHub
- ESLint, Prettier, TypeScript strict configuration
- ADR-001: architectural decisions record
- README aligned with approved stack (Next.js, Drizzle — not NestJS/Prisma)

### 1.4 Out of Scope

- Drizzle schema and migrations (S2)
- API route handlers beyond `GET /api/health` (S2)
- Auth.js, Stripe, Cloudflare Stream (S4–S6)
- Framer Motion animations and route transitions (S3)
- E2E Playwright suite (S9 — scaffold config only in M1)
- Production Neon database provisioning (S2)
- Sentry integration (S9)

### 1.5 Issue Mapping

| Issue | Title | Priority |
|-------|-------|----------|
| #001 | Migrate codebase to TypeScript + monorepo scaffold | P0 |
| #002 | Configure Tailwind CSS 4 with Nexus design tokens | P0 |
| #003 | Build Button, Badge, Input, Skeleton primitives | P0 |
| #004 | Implement PageShell + TopNav + route groups | P0 |
| #005 | Set up path aliases | P1 |
| #006 | Configure ESLint + Prettier | P1 |
| #007 | Add Exo 2 / Inter / JetBrains Mono fonts | P2 |

---

## 2. Repository Structure

### 2.1 Top-Level Layout

```
nexus-anime/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   └── e2e.yml                    # Scaffold only; active gate at S9
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── CODEOWNERS
│
├── apps/
│   └── web/                           # Sole deployable application (MVP)
│
├── packages/
│   ├── ui/                            # Design system primitives
│   ├── config-eslint/                 # Shared ESLint flat config
│   ├── config-typescript/             # Shared tsconfig bases
│   └── config-tailwind/               # Nexus token preset
│
├── tooling/
│   ├── docker/
│   │   ├── docker-compose.yml
│   │   └── docker-compose.override.yml.example
│   └── scripts/
│       └── README.md                  # Script inventory (implement in S2+)
│
├── docs/
│   ├── master-roadmap.md
│   ├── milestone-1-project-foundation.md   # This document
│   ├── sprint-plans.md
│   ├── github-issues.md
│   └── architecture/
│       └── adr/
│           └── 001-modular-monolith-nextjs.md
│
├── .env.example
├── .gitignore
├── .nvmrc                             # Node 22 LTS
├── .npmrc                             # pnpm settings
├── LICENSE
├── package.json                       # Root workspace scripts
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── turbo.json
└── README.md
```

### 2.2 Directory Ownership

| Path | Owner (Sprint 1) | Responsibility |
|------|------------------|----------------|
| `apps/web` | Tech Lead + Frontend | Next.js app, routes, features shell |
| `packages/ui` | Frontend | Design tokens, primitives, layout |
| `packages/config-*` | Tech Lead | Shared tooling configuration |
| `tooling/docker` | Tech Lead | Local service definitions |
| `.github/workflows` | Tech Lead | CI/CD pipelines |
| `docs/architecture/adr` | Tech Lead | Decision records |

### 2.3 Files That Must Not Exist at M1 Completion

| Pattern | Reason |
|---------|--------|
| `.env`, `.env.local` | Never committed; use `.env.example` |
| `node_modules/` | Gitignored |
| `.next/`, `dist/`, `coverage/` | Build artifacts; gitignored |
| NestJS, Prisma config files | Superseded by roadmap stack |
| Secrets, API keys, credentials | Vercel encrypted env only |

### 2.4 `.gitignore` Requirements

Must ignore at minimum:

- `node_modules/`
- `.next/`, `out/`, `dist/`, `build/`
- `.env`, `.env.local`, `.env.*.local`
- `.turbo/`
- `coverage/`
- `playwright-report/`, `test-results/`
- `.vercel/`
- OS files (`.DS_Store`, `Thumbs.db`)

---

## 3. Monorepo Structure

### 3.1 Toolchain

| Tool | Version | Role |
|------|---------|------|
| Node.js | 22 LTS (`.nvmrc`) | Runtime |
| pnpm | 9.x | Package manager, workspace linking |
| Turborepo | 2.x | Task orchestration, caching |
| TypeScript | 5.x | Language (strict mode) |

### 3.2 Workspace Definition (`pnpm-workspace.yaml`)

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### 3.3 Root `package.json` Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `turbo dev` | Start all dev servers |
| `build` | `turbo build` | Production build all packages |
| `lint` | `turbo lint` | ESLint across workspace |
| `typecheck` | `turbo typecheck` | `tsc --noEmit` across workspace |
| `test` | `turbo test` | Vitest unit tests |
| `format` | `prettier --write .` | Format all files |
| `format:check` | `prettier --check .` | CI format gate |
| `clean` | `turbo clean && rm -rf node_modules` | Reset build artifacts |

### 3.4 Turborepo Pipeline (`turbo.json`)

| Task | `dependsOn` | `outputs` | `cache` |
|------|-------------|-----------|---------|
| `build` | `["^build"]` | `[".next/**", "dist/**"]` | Yes |
| `dev` | — | — | No (persistent) |
| `lint` | — | — | Yes |
| `typecheck` | `["^build"]` | — | Yes |
| `test` | `["^build"]` | `["coverage/**"]` | Yes |
| `clean` | — | — | No |

**Global env passthrough (Turbo):** `NODE_ENV`, `VERCEL`, `VERCEL_ENV`

### 3.5 Package Dependency Graph

```
apps/web
  ├── @nexus/ui
  ├── @nexus/config-eslint (dev)
  ├── @nexus/config-typescript (dev)
  └── @nexus/config-tailwind (dev)

packages/ui
  ├── @nexus/config-eslint (dev)
  ├── @nexus/config-typescript (dev)
  └── @nexus/config-tailwind (dev)

packages/config-eslint
  └── (no internal deps)

packages/config-typescript
  └── (no internal deps)

packages/config-tailwind
  └── (no internal deps)
```

**S2 additions (not M1):** `@nexus/db`, `@nexus/validation` — do not scaffold until Sprint 2.

### 3.6 Import Boundary Rules

| Rule | Enforcement |
|------|-------------|
| `packages/ui` must not import from `apps/web` | ESLint `import/no-restricted-paths` |
| `packages/ui` must not import database, auth, or Stripe | Code review + ESLint |
| `apps/web` may import all `@nexus/*` packages | Allowed |
| Client components must not import `server-only` modules | `server-only` package marker |
| No circular dependencies between packages | `madge` or ESLint in CI (S9) |

### 3.7 Package Naming Convention

| Scope | Pattern | Example |
|-------|---------|---------|
| Shared libraries | `@nexus/<name>` | `@nexus/ui` |
| Config packages | `@nexus/config-<tool>` | `@nexus/config-eslint` |
| App | Unscoped name in `apps/web/package.json` | `web` |

All shared packages: `"private": true`, `"version": "0.0.0"`.

---

## 4. Next.js Architecture

### 4.1 Application Identity

| Property | Value |
|----------|-------|
| Framework | Next.js 16.x (App Router) |
| React | 19.x |
| Language | TypeScript (strict) |
| Location | `apps/web` |
| Deploy target | Vercel Pro |
| Rendering model | Server-first; client islands at leaf nodes |

### 4.2 `apps/web` Directory Structure

```
apps/web/
├── app/
│   ├── (marketing)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # /
│   │   ├── pricing/
│   │   │   └── page.tsx
│   │   └── about/
│   │       └── page.tsx
│   │
│   ├── (catalog)/
│   │   ├── layout.tsx
│   │   ├── browse/
│   │   │   ├── page.tsx
│   │   │   └── [genre]/
│   │   │       └── page.tsx
│   │   ├── search/
│   │   │   └── page.tsx
│   │   └── title/
│   │       └── [slug]/
│   │           └── page.tsx
│   │
│   ├── (auth)/
│   │   ├── layout.tsx                  # Centered card; no TopNav
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── forgot-password/
│   │       └── page.tsx
│   │
│   ├── (app)/
│   │   ├── layout.tsx
│   │   ├── nexus/
│   │   │   ├── page.tsx
│   │   │   ├── watchlist/
│   │   │   │   └── page.tsx
│   │   │   └── history/
│   │   │       └── page.tsx
│   │   └── settings/
│   │       ├── profile/
│   │       │   └── page.tsx
│   │       ├── password/
│   │       │   └── page.tsx
│   │       └── subscription/
│   │           └── page.tsx
│   │
│   ├── (legal)/
│   │   ├── layout.tsx
│   │   └── legal/
│   │       └── [...slug]/
│   │           └── page.tsx
│   │
│   ├── admin/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── api/
│   │   └── health/
│   │       └── route.ts                # { data: { status: "ok" } }
│   │
│   ├── dev/
│   │   └── components/
│   │       └── page.tsx                # Primitive showcase; remove before launch
│   │
│   ├── globals.css
│   ├── layout.tsx                      # Root: fonts, providers, metadata
│   └── not-found.tsx
│
├── components/
│   ├── ui/                             # Re-exports from @nexus/ui
│   ├── layout/                         # App-specific layout wrappers
│   ├── content/                        # Placeholder dir (S3)
│   └── media/                          # Placeholder dir (S6)
│
├── features/
│   ├── catalog/                        # Placeholder (S2–S3)
│   ├── auth/                           # Placeholder (S4)
│   ├── billing/                        # Placeholder (S5)
│   ├── playback/                       # Placeholder (S6)
│   ├── library/                        # Placeholder (S7)
│   └── admin/                          # Placeholder (S8)
│
├── lib/
│   ├── api/
│   │   └── envelope.ts                 # API response type definitions
│   ├── env.ts                          # Validated env (Zod); server-only
│   └── utils.ts                        # cn() helper, shared utilities
│
├── types/
│   └── index.ts
│
├── middleware.ts                       # Scaffold only; auth logic in S4
├── next.config.ts
├── tailwind.config.ts                  # Extends @nexus/config-tailwind
├── postcss.config.mjs
├── tsconfig.json
├── vitest.config.ts
└── package.json
```

### 4.3 Route Groups

| Group | URL Prefix | Layout Behavior | Auth (S4+) |
|-------|------------|-----------------|------------|
| `(marketing)` | `/`, `/pricing`, `/about` | PageShell + TopNav | Public |
| `(catalog)` | `/browse`, `/search`, `/title/*` | PageShell + TopNav | Public (watch gated S5) |
| `(auth)` | `/login`, `/register`, `/forgot-password` | Centered card, no TopNav | Public |
| `(app)` | `/nexus/*`, `/settings/*` | PageShell + TopNav | Authenticated |
| `(legal)` | `/legal/*` | Minimal prose layout | Public |
| `admin` | `/admin/*` | Admin layout (S8) | Admin RBAC |

Route groups do **not** affect the URL path. Parentheses are omitted from URLs.

### 4.4 Rendering Strategy (M1 Baseline)

| Surface | Rendering | Notes |
|---------|-----------|-------|
| All M1 pages | Server Components (default) | No `'use client'` unless required |
| TopNav mobile menu | Client island (S1 if needed) | Smallest possible client boundary |
| Providers (TanStack Query) | Client wrapper in root layout | Shell only; no queries in M1 |
| `/dev/components` | Server or Client | Primitive showcase for QA |

**M1 rule:** `'use client'` only where browser APIs or interactivity require it. Target ≤ 5 client components in M1.

### 4.5 Path Aliases (`apps/web/tsconfig.json`)

| Alias | Resolves To |
|-------|-------------|
| `@/*` | `apps/web/*` |
| `@/components/*` | `apps/web/components/*` |
| `@/features/*` | `apps/web/features/*` |
| `@/lib/*` | `apps/web/lib/*` |
| `@/types/*` | `apps/web/types/*` |

Workspace packages use Node resolution via `package.json` `exports` field — not path aliases.

### 4.6 Root Layout Responsibilities

| Concern | Implementation |
|---------|----------------|
| Fonts | Exo 2, Inter, JetBrains Mono via `next/font` |
| Metadata | Default title template, description, `metadataBase` |
| Theme | `class="dark"` on `<html>`; dark-only at MVP |
| Providers | TanStack Query `QueryClientProvider` shell |
| Global styles | `globals.css` imports Tailwind + token CSS variables |
| Viewport | `width=device-width, initial-scale=1` |

### 4.7 Middleware (M1 Scaffold)

`middleware.ts` exists with a **pass-through matcher** only. No auth redirects, subscription gates, or rate limiting until S4–S5.

| Matcher (M1) | Behavior |
|--------------|----------|
| All routes except `_next/static`, `_next/image`, `favicon.ico` | `NextResponse.next()` |

Document intended matchers in code comments for S4/S5 implementation.

### 4.8 API Envelope Contract (Established in M1)

All future route handlers must conform:

**Success:**
```json
{
  "data": {}
}
```

**Error:**
```json
{
  "error": {
    "message": "Human-readable message",
    "code": "MACHINE_READABLE_CODE",
    "details": []
  }
}
```

`GET /api/health` is the reference implementation. Type definitions live in `lib/api/envelope.ts`.

### 4.9 `next.config.ts` Requirements

| Setting | Value | Reason |
|---------|-------|--------|
| `transpilePackages` | `["@nexus/ui"]` | Compile workspace package |
| `images.remotePatterns` | Placeholder for R2 CDN (S2) | Image optimization |
| `experimental.typedRoutes` | `true` | Type-safe links |
| `poweredByHeader` | `false` | Security hygiene |
| `reactStrictMode` | `true` | Development checks |

### 4.10 Placeholder Page Contract

Every scaffolded route page must:

1. Render inside its route group layout
2. Display the route path as visible text (dev aid)
3. Use PageShell where the group layout specifies it
4. Contain no business logic, no data fetching, no external API calls

---

## 5. Package Strategy

### 5.1 Package Inventory (M1)

| Package | NPM Name | Published | Purpose |
|---------|----------|-----------|---------|
| Web app | `web` (private) | No | Next.js deployable |
| UI | `@nexus/ui` | No | Design system primitives + layout |
| ESLint config | `@nexus/config-eslint` | No | Shared lint rules |
| TypeScript config | `@nexus/config-typescript` | No | Shared `tsconfig` bases |
| Tailwind config | `@nexus/config-tailwind` | No | Nexus design token preset |

### 5.2 `@nexus/ui` Structure

```
packages/ui/
├── src/
│   ├── tokens/
│   │   ├── colors.css                  # CSS custom properties
│   │   ├── typography.css
│   │   └── index.css
│   ├── primitives/
│   │   ├── button.tsx
│   │   ├── badge.tsx
│   │   ├── input.tsx
│   │   └── skeleton.tsx
│   ├── layout/
│   │   ├── page-shell.tsx
│   │   └── top-nav.tsx
│   ├── lib/
│   │   └── cn.ts                       # clsx + tailwind-merge
│   └── index.ts                        # Public exports
├── package.json
└── tsconfig.json
```

### 5.3 `@nexus/ui` Export Map

| Export Path | Contents |
|-------------|----------|
| `@nexus/ui` | All public components |
| `@nexus/ui/tokens` | CSS token files |
| `@nexus/ui/button` | Tree-shakeable Button |
| `@nexus/ui/badge` | Tree-shakeable Badge |
| `@nexus/ui/input` | Tree-shakeable Input |
| `@nexus/ui/skeleton` | Tree-shakeable Skeleton |
| `@nexus/ui/page-shell` | PageShell |
| `@nexus/ui/top-nav` | TopNav |

### 5.4 `@nexus/config-tailwind` — Design Token Preset

Tokens must match roadmap §3.7:

| Token Name | Value | Tailwind Key |
|------------|-------|--------------|
| Void Base | `#0C0E12` | `void-base` |
| Void Elevated | `#141820` | `void-elevated` |
| Resonance | `#00E5CC` | `resonance` |
| Rift Gold | `#F5A623` | `rift-gold` |
| Text Primary | `#F0F2F5` | `text-primary` |
| Text Secondary | `#F0F2F5` @ 70% | `text-secondary` |
| Text Muted | `#F0F2F5` @ 45% | `text-muted` |
| Poster Ratio | 2:3 | `aspect-poster` |
| Hero Ratio | 21:9 | `aspect-hero` |
| Nav Height | 64px | `h-nav` |
| Container Max | 1440px | `max-w-container` |
| UI Duration | 400ms | `duration-ui` |

### 5.5 `@nexus/config-typescript` Bases

| Config File | Extends | Used By |
|-------------|---------|---------|
| `base.json` | — | All packages |
| `nextjs.json` | `base.json` | `apps/web` |
| `react-library.json` | `base.json` | `packages/ui` |

**`base.json` requirements:**

- `"strict": true`
- `"noUncheckedIndexedAccess": true`
- `"noImplicitOverride": true`
- `"verbatimModuleSyntax": true`
- `"moduleResolution": "bundler"`
- `"target": "ES2022"`

### 5.6 `@nexus/config-eslint` Rules

| Rule Category | Policy |
|---------------|--------|
| TypeScript | `@typescript-eslint/recommended-type-checked` |
| Imports | `import/order` with alphabetize; no default exports in `lib/` |
| React | `eslint-plugin-react-hooks` |
| Tailwind | `eslint-plugin-tailwindcss` (class order) |
| Unused vars | Error; prefix `_` to ignore |
| `any` | Error (warn with justification comment only in migrations) |

### 5.7 Dependency Version Policy

| Policy | Rule |
|--------|------|
| Pinning | Caret (`^`) for runtime deps; exact for CI action versions |
| Upgrades | Renovate or manual weekly review post-M1 |
| Peer deps | React 19 peer in `@nexus/ui` |
| Duplication | pnpm dedupes; no duplicate React in bundle |

### 5.8 Future Packages (S2+, Document Only)

| Package | Sprint | Purpose |
|---------|--------|---------|
| `@nexus/db` | S2 | Drizzle schema, migrations, client |
| `@nexus/validation` | S2 | Shared Zod schemas |
| `@nexus/search` | 100K MAU | Meilisearch client |

Do not create these directories in M1.

---

## 6. Environment Strategy

### 6.1 Environment Tiers

| Tier | Host | Database | Purpose |
|------|------|----------|---------|
| **Local** | Developer machine | Docker Postgres | Day-to-day development |
| **Preview** | Vercel Preview | Neon branch (S2+) | PR review deployments |
| **Staging** | Vercel (`staging` branch or env) | Neon staging | Pre-production QA |
| **Production** | Vercel (`main`) | Neon production | Live users |

M1 configures **Local** and **Preview** only. Neon provisioning begins S2.

### 6.2 Environment Variable Naming

| Convention | Example |
|------------|---------|
| Server-only secrets | `DATABASE_URL`, `AUTH_SECRET` |
| Public (client-safe) | `NEXT_PUBLIC_APP_URL` |
| Provider-prefixed | `STRIPE_SECRET_KEY`, `RESEND_API_KEY` |
| Feature flags (future) | `FEATURE_*` |

**Rule:** Only `NEXT_PUBLIC_*` variables are exposed to the browser bundle. All others are server-only.

### 6.3 `.env.example` (M1 Variables)

```bash
# ── Application ──────────────────────────────────────────
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ── Database (S2 — include placeholder in M1) ────────────
DATABASE_URL=postgresql://nexus:nexus@localhost:5432/nexus_anime

# ── Auth (S4 — include placeholder in M1) ────────────────
AUTH_SECRET=                          # openssl rand -base64 32
AUTH_URL=http://localhost:3000

# ── Email (S4) ───────────────────────────────────────────
RESEND_API_KEY=
EMAIL_FROM=noreply@nexusanime.com

# ── Stripe (S5) ──────────────────────────────────────────
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# ── Cloudflare (S6) ────────────────────────────────────────
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_STREAM_API_TOKEN=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=

# ── Redis (S11 Beta) ─────────────────────────────────────
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# ── Monitoring (S9) ────────────────────────────────────────
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
```

### 6.4 Environment Validation (`apps/web/lib/env.ts`)

| Requirement | Detail |
|-------------|--------|
| Library | Zod |
| Scope | Server-only (`import "server-only"`) |
| M1 validation | `NODE_ENV`, `NEXT_PUBLIC_APP_URL` only |
| S2 expansion | Add `DATABASE_URL` |
| S4+ expansion | Add auth, email vars incrementally |
| Failure mode | Throw at startup with clear missing-var message |
| Client access | Never import `env.ts` in client components |

### 6.5 Secret Management

| Environment | Storage |
|-------------|---------|
| Local | `.env.local` (gitignored) |
| Vercel Preview | Vercel encrypted env (Development + Preview scopes) |
| Vercel Production | Vercel encrypted env (Production scope) |
| CI (GitHub Actions) | GitHub Secrets (no secrets in workflow files) |

**Prohibited:** Secrets in source code, commit history, client bundles, or SSR props.

### 6.6 Environment Promotion Flow

```
Local (.env.local)
  → PR Preview (Vercel auto-inherits Preview env)
    → Staging (manual promote or staging branch deploy)
      → Production (merge to main; migrations run pre-deploy in S2+)
```

### 6.7 `NEXT_PUBLIC_APP_URL` per Environment

| Environment | Value |
|-------------|-------|
| Local | `http://localhost:3000` |
| Preview | `https://<branch>-<project>.vercel.app` (Vercel auto) |
| Staging | `https://staging.nexusanime.com` |
| Production | `https://nexusanime.com` |

---

## 7. Docker Strategy

### 7.1 Purpose

Docker provides **local backing services only** in M1. The Next.js app runs natively via `pnpm dev` (not containerized) for fast HMR.

Full Docker Compose stack is required by M7 (S9); M1 delivers the compose file and verified service startup.

### 7.2 Services (`tooling/docker/docker-compose.yml`)

| Service | Image | Host Port | Container Port | Purpose |
|---------|-------|-----------|----------------|---------|
| `postgres` | `postgres:16-alpine` | 5432 | 5432 | Local database (S2+) |
| `redis` | `redis:7-alpine` | 6379 | 6379 | Local cache (S11; present early for parity) |
| `mailpit` | `axllent/mailpit:latest` | 8025 (UI), 1025 (SMTP) | 8025, 1025 | Local email capture (S4+) |

### 7.3 Postgres Configuration

| Setting | Value |
|---------|-------|
| Database | `nexus_anime` |
| User | `nexus` |
| Password | `nexus` (local only) |
| Volume | `nexus_postgres_data` (named, persistent) |
| Healthcheck | `pg_isready -U nexus -d nexus_anime` |

`DATABASE_URL` in `.env.local`:
```
postgresql://nexus:nexus@localhost:5432/nexus_anime
```

### 7.4 Redis Configuration

| Setting | Value |
|---------|-------|
| Volume | `nexus_redis_data` |
| Healthcheck | `redis-cli ping` |
| Persistence | AOF disabled (local dev) |

Not consumed by application until S11. Present in M1 for developer environment parity.

### 7.5 Mailpit Configuration

| Setting | Value |
|---------|-------|
| Web UI | `http://localhost:8025` |
| SMTP | `localhost:1025` |
| Auth | None (local only) |

### 7.6 Developer Commands

| Command | Action |
|---------|--------|
| `pnpm docker:up` | `docker compose -f tooling/docker/docker-compose.yml up -d` |
| `pnpm docker:down` | `docker compose -f tooling/docker/docker-compose.yml down` |
| `pnpm docker:reset` | `down -v` (wipe volumes) + `up -d` |
| `pnpm docker:logs` | Tail all service logs |

Root `package.json` delegates to `tooling/docker/docker-compose.yml`.

### 7.7 What Is Not Dockerized (M1)

| Component | Runs As |
|-----------|---------|
| Next.js dev server | `pnpm dev` (native Node) |
| Turborepo | Native |
| Vitest | Native |
| Playwright (S9) | Native against `localhost:3000` |

### 7.8 Production vs Local

| Concern | Local (Docker) | Production |
|---------|----------------|------------|
| Database | Postgres 16 container | Neon PostgreSQL 16 (Scale) |
| Cache | Redis container | Upstash Redis (S11) |
| Email | Mailpit | Resend |
| App hosting | localhost:3000 | Vercel |

---

## 8. CI/CD Strategy

### 8.1 Pipeline Overview

```
PR opened/updated
  → GitHub Actions: ci.yml
      → Install (pnpm, Node 22)
      → Lint
      → Typecheck
      → Test (Vitest)
      → Build
  → Vercel: Preview deployment (parallel)

Merge to main
  → GitHub Actions: ci.yml (same gates)
  → Vercel: Production deployment
  → (S2+) Migration workflow before prod deploy
```

### 8.2 GitHub Actions — `ci.yml`

| Job | Steps | Failure Blocks Merge |
|-----|-------|---------------------|
| `ci` | Checkout → Setup Node 22 → Setup pnpm → `pnpm install --frozen-lockfile` → `pnpm lint` → `pnpm typecheck` → `pnpm test` → `pnpm build` | Yes |

**Triggers:**

- `pull_request` → `main`
- `push` → `main`

**Concurrency:** Cancel in-progress runs for same PR branch.

### 8.3 GitHub Actions — `e2e.yml` (Scaffold in M1)

| Setting | M1 | S9 |
|---------|-----|-----|
| Status | Scaffold file present; workflow disabled or `if: false` | Enabled |
| Trigger | — | `pull_request` with label `e2e` + nightly on `main` |
| Tool | Playwright | Playwright |
| Gate | — | Mandatory pre-launch |

### 8.4 Vercel Configuration

| Setting | Value |
|---------|-------|
| Root directory | `apps/web` |
| Framework | Next.js |
| Build command | `cd ../.. && pnpm build --filter=web` |
| Install command | `pnpm install --frozen-lockfile` |
| Node version | 22.x |
| Preview deploys | All PRs |
| Production branch | `main` |

### 8.5 Branching Strategy

| Branch | Purpose | Deploy Target |
|--------|---------|---------------|
| `main` | Production-ready code | Vercel Production |
| `feature/*` | Sprint work | Vercel Preview |
| `fix/*` | Bug fixes | Vercel Preview |

**No `develop` branch** until team exceeds 3 engineers (roadmap §12).

### 8.6 PR Requirements (M1 Onward)

| Requirement | Enforced By |
|-------------|-------------|
| CI green | GitHub branch protection |
| 1 approval | Branch protection (when team > 1) |
| No direct push to `main` | Branch protection |
| PR template completed | `.github/PULL_REQUEST_TEMPLATE.md` |
| Conventional commit title (recommended) | Review convention |

### 8.7 PR Template Sections

1. **Summary** — What changed and why
2. **Milestone / Issue** — e.g., `M1 / #003`
3. **Test plan** — Checklist of manual/automated verification
4. **Screenshots** — Required for UI changes
5. **Breaking changes** — If any

### 8.8 Deployment Rollback

| Scenario | Action | SLA |
|----------|--------|-----|
| Bad deploy | Vercel promote previous deployment | < 15 min |
| Bad migration (S2+) | Forward-fix preferred; Neon PITR last resort | 30 min |

Documented in runbook (S9); referenced here for architectural completeness.

### 8.9 CI Caching

| Cache | Key |
|-------|-----|
| pnpm store | `pnpm-lock.yaml` hash |
| Turborepo | Remote cache optional (Vercel or self-hosted) |
| Next.js build | `.next/cache` via Turbo outputs |

### 8.10 Migration Pipeline (S2+ Placeholder)

`migrate-production.yml` will run `pnpm db:migrate` against Neon production **before** Vercel production deploy. Not active in M1; directory slot reserved in `.github/workflows/`.

---

## 9. Coding Standards

### 9.1 Language & TypeScript

| Rule | Standard |
|------|----------|
| Language | TypeScript only (no `.js` application files) |
| Strict mode | Enabled |
| `any` | Prohibited without `// eslint-disable` + justification |
| Non-null assertion (`!`) | Avoid; prefer narrowing |
| Enums | Prefer `as const` objects over TypeScript enums |
| Type exports | Use `export type` for type-only exports |

### 9.2 File & Directory Naming

| Item | Convention | Example |
|------|------------|---------|
| React components | PascalCase file | `Button.tsx` in `packages/ui` |
| Utilities | kebab-case file | `envelope.ts` |
| Route segments | kebab-case | `forgot-password/page.tsx` |
| Route groups | parentheses, lowercase | `(marketing)` |
| Dynamic segments | brackets | `[slug]`, `[...slug]` |
| Test files | `*.test.ts` / `*.test.tsx` | Colocated with source |
| Constants | `SCREAMING_SNAKE` in `.ts` files | `API_TIMEOUT_MS` |

### 9.3 Component Conventions

| Rule | Detail |
|------|--------|
| Default export | Pages (`page.tsx`, `layout.tsx`) only |
| Named exports | All components, utilities, types |
| Props interface | `<ComponentName>Props` |
| `'use client'` | First line; only when necessary |
| Children | Explicit `children: React.ReactNode` in layout props |
| className merging | `cn()` from `@nexus/ui/lib` |

### 9.4 Import Order

1. React / Next.js
2. External packages
3. `@nexus/*` workspace packages
4. `@/lib`, `@/components`, `@/features`
5. Relative imports
6. Type-only imports (`import type`)

Blank line between groups. Enforced by ESLint.

### 9.5 Server vs Client Boundary

| Layer | Server | Client |
|-------|--------|--------|
| `page.tsx` (default) | ✅ | Only if interactive |
| `layout.tsx` | ✅ | Provider wrapper only |
| Route handlers | ✅ Server only | — |
| Server Actions | ✅ Server only | — |
| `lib/services/*` | ✅ | Never |
| `lib/repositories/*` | ✅ | Never |
| `lib/stores/*` (Zustand) | — | ✅ Client only |
| `components/ui/*` | Either | Prefer server; client if stateful |

Mark server-only modules with `import "server-only"`.

### 9.6 API & Data Layer (Established Patterns for S2+)

| Layer | Responsibility | May Import |
|-------|----------------|------------|
| Route handler | HTTP, validation, auth guard, envelope | Services, validation |
| Server Action | Form mutation, revalidation | Services |
| Service | Business logic | Repositories, external SDKs |
| Repository | Drizzle queries only | `@nexus/db` |
| Component | Presentation | Services (server components only via direct call) |

**Prohibited:** Business logic in route handlers or repositories. Database access in components.

### 9.7 Error Handling

| Context | Pattern |
|---------|---------|
| API routes | Return envelope `{ error: { message, code, details } }` with HTTP status |
| Server Actions | Return `{ success: false, error: string }` or throw `ActionError` |
| Services | Throw typed domain errors; catch at handler boundary |
| Client | TanStack Query `onError`; toast for user-facing errors (S3+) |
| Unexpected | Log to console (M1); Sentry (S9) |

### 9.8 Styling

| Rule | Standard |
|------|----------|
| Framework | Tailwind CSS 4 |
| Token source | `@nexus/config-tailwind` preset only |
| Arbitrary values | Avoid; add token if recurring |
| Dark mode | Default and only mode at MVP |
| Responsive | Mobile-first (`sm:`, `md:`, `lg:`, `xl:`) |
| Motion | `duration-ui` (400ms max); respect `prefers-reduced-motion` |

### 9.9 Accessibility (M1 Minimum)

| Requirement | Standard |
|-------------|----------|
| Focus visible | Resonance ring on all interactive elements |
| Color contrast | WCAG AA minimum on text tokens |
| Form labels | Associated `<label>` or `aria-label` |
| Buttons | `<button>` element; not `<div onClick>` |
| Images (S3+) | Meaningful `alt` text required |
| Skip link | Add to PageShell (S1) |

### 9.10 Testing Standards

| Type | Tool | Location | M1 Coverage |
|------|------|----------|-------------|
| Unit | Vitest + Testing Library | Colocated `*.test.tsx` | UI primitives |
| Integration | Vitest | `apps/web/__tests__/` | `/api/health` only |
| E2E | Playwright | `apps/web/e2e/` | Scaffold config only |
| Coverage target | — | — | Primitives: 80%+ (M1) |

**Test naming:** `describe('<Component>')` → `it('should <behavior> when <condition>')`

### 9.11 Git Commit Convention

Recommended [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]
```

| Type | Usage |
|------|-------|
| `feat` | New feature |
| `fix` | Bug fix |
| `chore` | Tooling, deps |
| `docs` | Documentation only |
| `refactor` | Code change without feature/fix |
| `test` | Tests only |
| `ci` | CI/CD changes |

**Scopes:** `web`, `ui`, `config`, `docker`, `ci`

### 9.12 Code Review Checklist

- [ ] No secrets or env values committed
- [ ] No `any` without justification
- [ ] `'use client'` justified and minimal
- [ ] Server-only code not imported in client bundles
- [ ] Tailwind classes use design tokens
- [ ] Accessible focus and label patterns
- [ ] Tests added/updated for changed behavior
- [ ] `pnpm lint && pnpm typecheck && pnpm test` pass locally

### 9.13 Architecture Decision Records

All significant decisions recorded in `docs/architecture/adr/`.

**ADR-001 (M1):** Modular monolith in Next.js 16 App Router; pnpm monorepo; Drizzle ORM (S2); JWT sessions (S4); single `main` branch.

Format: Context → Decision → Consequences → Status.

---

## 10. Definition of Done

### 10.1 M1 Gate Checklist

**Monorepo & Build**
- [ ] `pnpm install` succeeds from clean clone
- [ ] `pnpm build` succeeds
- [ ] `pnpm lint` zero errors
- [ ] `pnpm typecheck` zero errors
- [ ] `pnpm test` passes (primitive unit tests)

**Design System**
- [ ] Tailwind preset includes all tokens from §5.4
- [ ] Button, Badge, Input, Skeleton exported from `@nexus/ui`
- [ ] PageShell and TopNav exported from `@nexus/ui`
- [ ] Fonts load via `next/font` without layout shift

**Application Shell**
- [ ] `/` renders PageShell + TopNav
- [ ] All route groups from §4.3 have placeholder pages
- [ ] `/dev/components` showcases all primitives
- [ ] `GET /api/health` returns `{ "data": { "status": "ok" } }`

**Infrastructure**
- [ ] `pnpm docker:up` starts Postgres, Redis, Mailpit
- [ ] Vercel preview deploy succeeds on test PR
- [ ] GitHub Actions `ci.yml` green on PR
- [ ] `.env.example` documents all known variables

**Documentation**
- [ ] README reflects Next.js + Drizzle stack (NestJS/Prisma removed)
- [ ] ADR-001 committed
- [ ] This specification referenced from README

**Hygiene**
- [ ] No committed secrets
- [ ] No NestJS/Prisma artifacts
- [ ] `.gitignore` complete

### 10.2 Quality Metrics

| Metric | Target |
|--------|--------|
| TypeScript errors | 0 |
| ESLint errors | 0 |
| Primitive test coverage | ≥ 80% |
| Lighthouse accessibility (/) | ≥ 90 |
| First PR preview deploy time | < 5 min |

---

## 11. Handoff to Sprint 2

### 11.1 M1 Deliverables Consuming Teams Need

| Artifact | Location | Consumer |
|----------|----------|----------|
| API envelope types | `apps/web/lib/api/envelope.ts` | S2 route handlers |
| Health route pattern | `apps/web/app/api/health/route.ts` | S2 catalog API |
| Env validation shell | `apps/web/lib/env.ts` | S2 `DATABASE_URL` |
| Docker Postgres | `tooling/docker/docker-compose.yml` | S2 Drizzle migrations |
| UI primitives | `@nexus/ui` | S3 catalog components |
| Route scaffold | `apps/web/app/(catalog)/` | S3 pages |

### 11.2 S2 First Tasks (Ordered)

1. Create `packages/db` with Drizzle schema
2. Add `DATABASE_URL` to `env.ts` validation
3. Run initial migration against Docker Postgres
4. Implement `GET /api/titles`, `GET /api/genres`, `GET /api/shelves`
5. Seed genres and shelf reference data

### 11.3 Contracts to Honor

| Contract | Defined In |
|----------|------------|
| API envelope shape | §4.8 |
| Path aliases | §4.5 |
| Design tokens | §5.4 |
| Import boundaries | §3.6 |
| Env naming | §6.2 |

---

**Nexus Anime — Milestone 1: Project Foundation**  
*Implementation specification. No application code included. Execute in Sprint 1 (S1).*
