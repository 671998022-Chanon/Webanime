# M2.7 — Migration Strategy

> **Scope:** This document defines the **complete migration strategy for Nexus Anime** as delivered under Milestone 2 (Database & Backend Foundation). It covers the development, staging, and production migration workflows, the Expand-Contract pattern used for zero-downtime schema evolution, rollback procedures, data validation, and CI/CD integration.

> **Status:** Draft — Pending Review
> **Date:** 2026-06-23
> **Author:** Tech Lead
> **Milestone:** M2 (Sprints 2–3)

---

## Table of Contents

1. [Overview & Design Principles](#1-overview--design-principles)
2. [Migration Architecture](#2-migration-architecture)
3. [The Expand-Contract Pattern](#3-the-expand-contract-pattern)
4. [Development Flow](#4-development-flow)
5. [Staging Flow](#5-staging-flow)
6. [Production Flow](#6-production-flow)
7. [Rollback Strategy](#7-rollback-strategy)
8. [Data Validation & Reconciliation](#8-data-validation--reconciliation)
9. [CI/CD Integration](#9-cicd-integration)
10. [Risk Assessment](#10-risk-assessment)
11. [Runbooks](#11-runbooks)
12. [Communication Templates](#12-communication-templates)
13. [Success Metrics](#13-success-metrics)
14. [References](#14-references)

---

## 1. Overview & Design Principles

### 1.1 Purpose

Nexus Anime uses **Drizzle ORM** on **Neon PostgreSQL 16** as its data layer. This document governs how schema changes are versioned, applied, validated, and rolled back across all four environment tiers (Local, Preview, Staging, Production) without causing downtime or data loss.

### 1.2 Design Principles

| Principle | Decision |
|-----------|----------|
| **Zero-downtime migrations** | All schema changes use the Expand-Contract pattern — backward-compatible expands first, contracts later |
| **Forward-only in production** | No destructive column drops without an expand-contract cycle; `DROP COLUMN` only after a full sprint of dual-write |
| **Idempotent scripts** | Every migration script can be re-run safely (uses `IF NOT EXISTS`, conditional DDL) |
| **Dependency-ordered execution** | Migrations run in topological order — parents before children, referenced tables before foreign keys |
| **Generated + hand-reviewed SQL** | `drizzle-kit generate` produces SQL; engineers review and annotate before committing |
| **One migration per sprint (max)** | Production migrations are batched per sprint to limit blast radius |
| **Backward-compatible API contracts** | Database changes never break existing API versions; new schema serves new API versions |

### 1.3 Environment Tiers

| Tier | Host | Database | Migration Authority |
|------|------|----------|---------------------|
| **Local** | Developer machine | Docker Postgres (`localhost:5432`) | Developer (full freedom) |
| **Preview** | Vercel Preview | Neon branch (ephemeral) | CI/CD (automated) |
| **Staging** | Vercel (`staging` branch) | Neon staging | CI/CD (automated, gated) |
| **Production** | Vercel (`main`) | Neon production | CI/CD (automated, gated, audited) |

---

## 2. Migration Architecture

### 2.1 Component Map

```
┌─────────────────────────────────────────────────────────────────────────┐
│  packages/db  (@nexus/db)                                               │
│  ├── src/schema/           ← Drizzle schema definitions (TypeScript)    │
│  ├── src/client.ts         ← Drizzle client singleton (Neon HTTP + WS)  │
│  ├── drizzle.config.ts     ← drizzle-kit configuration                 │
│  └── migrations/           ← Generated SQL + journal                    │
│       ├── 001_create_enum_types/                                        │
│       │   ├── migration.sql                                             │
│       │   └── meta/_journal.json                                        │
│       ├── 002_create_reference_tables/                                  │
│       │   ├── migration.sql                                             │
│       │   └── meta/_journal.json                                        │
│       └── ...                                                           │
├─────────────────────────────────────────────────────────────────────────┤
│  Tooling (CLI)                                                          │
│  ├── drizzle-kit generate   ← Diff schema → new migration SQL           │
│  ├── drizzle-kit push       ← Apply schema directly (dev only)         │
│  ├── drizzle-kit migrate    ← Apply migrations (staging/prod)          │
│  └── drizzle-kit studio    ← Visual schema browser (dev only)          │
├─────────────────────────────────────────────────────────────────────────┤
│  Environment                                                            │
│  ├── Local:      docker compose up → postgres:16-alpine                 │
│  ├── Preview:    Neon branch (created per PR, deleted on merge)        │
│  ├── Staging:    Neon staging instance (persistent)                     │
│  └── Production: Neon production instance (persistent, monitored)      │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Migration State Tracking

Drizzle tracks applied migrations in a `__drizzle_migrations` table inside each database. This table is created automatically on first migration and records:

- `id` — sequential identifier
- `hash` — SHA-256 of the migration SQL (tamper detection)
- `created_at` — epoch milliseconds when applied

```sql
-- Created automatically by drizzle-kit migrate
CREATE TABLE __drizzle_migrations (
    id SERIAL PRIMARY KEY,
    hash text NOT NULL,
    created_at BIGINT NOT NULL
);
```

### 2.3 Journal File

Each migration folder includes a `meta/_journal.json` that records all migrations in order with their checksums. This file is the source of truth for migration history and is committed to version control.

```json
{
  "version": "7",
  "drizzle": "0.38.x",
  "entries": [
    {
      "idx": 0,
      "version": "7",
      "when": 1719100800000,
      "tag": "001_create_enum_types",
      "breakpoints": true
    }
  ]
}
```

---

## 3. The Expand-Contract Pattern

All schema changes in Nexus Anime follow the **Expand-Contract** pattern to ensure zero-downtime evolution. This is the single most important pattern in the migration strategy.

### 3.1 Pattern Overview

```
Phase 1: EXPAND          Phase 2: DUAL WRITE         Phase 3: CONTRACT
─────────────────        ──────────────────────        ──────────────────
Add new column/table     App writes to both           Remove old
Keep old column          old and new. Backfill         column/table
historical data          after validation             (next sprint)
```

### 3.2 Expand Phase (Sprint N)

**Goal:** Introduce the new schema without breaking existing code.

```sql
-- Example: Adding `synopsis_localized` to `anime`
-- Migration: 009_add_synopsis_localized

-- Step 1: Add new column (nullable — no default needed on existing rows)
ALTER TABLE anime ADD COLUMN synopsis_localized jsonb;

-- Step 2: Add GIN index for querying (CONCURRENTLY to avoid locks)
CREATE INDEX CONCURRENTLY idx_anime_synopsis_localized
    ON anime USING gin(synopsis_localized);
```

**Application code during Expand:**
```typescript
// repositories/title-repository.ts
// Old code continues to work — new column is nullable
export async function getTitle(slug: string) {
  return db.query.anime.findFirst({
    where: eq(anime.slug, slug),
    // synopsis_localized is available but may be null
  });
}
```

### 3.3 Dual-Write Phase (Sprint N+1)

**Goal:** Begin writing to both old and new columns; backfill historical data.

```sql
-- Backfill historical data in batches (avoid long-running transaction)
-- Migration: 010_backfill_synopsis_localized

-- Batch backfill (run in chunks of 1000)
UPDATE anime
SET synopsis_localized = jsonb_build_object('en', synopsis)
WHERE synopsis_localized IS NULL
  AND synopsis IS NOT NULL
  AND id IN (
    SELECT id FROM anime
    WHERE synopsis_localized IS NULL
    LIMIT 1000
    FOR UPDATE SKIP LOCKED
  );
```

**Application code during Dual-Write:**
```typescript
// services/catalog-service.ts
export async function createTitle(input: CreateTitleInput) {
  // Write to both old and new columns
  await db.insert(anime).values({
    title: input.title,
    synopsis: input.synopsis,           // old column
    synopsis_localized: { en: input.synopsis },  // new column
  });
}

export async function updateTitle(slug: string, input: UpdateTitleInput) {
  await db.update(anime)
    .set({
      synopsis: input.synopsis,          // old column
      synopsis_localized: { en: input.synopsis },  // new column
    })
    .where(eq(anime.slug, slug));
}
```

### 3.4 Contract Phase (Sprint N+2)

**Goal:** Remove the old column once the new column is fully validated and all readers use it.

```sql
-- Migration: 011_contract_synopsis_column

-- Step 1: Verify no remaining reads reference the old column
-- (checked via query log analysis — see Section 8)

-- Step 2: Drop the old column
ALTER TABLE anime DROP COLUMN synopsis;

-- Step 3: Make new column NOT NULL now that all rows have values
ALTER TABLE anime ALTER COLUMN synopsis_localized SET NOT NULL;
```

**Application code after Contract:**
```typescript
// repositories/title-repository.ts
// Now only references the new column
export async function getTitle(slug: string) {
  return db.query.anime.findFirst({
    where: eq(anime.slug, slug),
    columns: {
      // synopsis column no longer exists
      synopsis_localized: true,
    },
  });
}
```

### 3.5 Expand-Contract Rules

| Rule | Rationale |
|------|-----------|
| New columns must be `nullable` or have `DEFAULT` | Existing INSERTs must not break |
| Never rename a column in-place | Requires dual-write cycle |
| Never change a column type in-place | Requires expand + backfill + contract |
| `DROP COLUMN` only after 1 full sprint of dual-write | Ensures no old code references it |
| `CREATE INDEX` always uses `CONCURRENTLY` | Avoids table locks on production |
| Backfill in batches of ≤1000 rows | Avoids long-running transactions and lock contention |

---

## 4. Development Flow

The development flow gives engineers full freedom to iterate quickly on their local database. It is the only environment where destructive operations are permitted.

### 4.1 Initial Setup

```bash
# 1. Start local services
pnpm docker:up

# 2. Install dependencies
pnpm install --frozen-lockfile

# 3. Create @nexus/db package (first time only)
pnpm turbo gen workspace --name @nexus/db --type package

# 4. Initialize Drizzle config
cd packages/db
npx drizzle-kit init
```

### 4.2 Schema Iteration Loop

```
┌──────────────────────────────────────────────────────────────┐
│  Developer Loop (Local Only)                                  │
│                                                              │
│  1. Edit Drizzle schema (src/schema/*.ts)                    │
│  2. Generate migration SQL                                    │
│     cd packages/db && npx drizzle-kit generate                │
│  3. Review generated SQL in migrations/<N>_<name>/migration.sql│
│  4. Apply to local DB                                        │
│     cd packages/db && npx drizzle-kit push                    │
│  5. Verify with Drizzle Studio (optional)                    │
│     npx drizzle-kit studio                                   │
│  6. Run tests                                                │
│     pnpm test                                                │
│  7. If schema change is destructive → reset DB and re-migrate │
│     pnpm docker:reset                                        │
│     cd packages/db && npx drizzle-kit push                    │
│  8. Commit migration SQL + schema changes together            │
└──────────────────────────────────────────────────────────────┘
```

### 4.3 Developer Commands Reference

| Command | Environment | Purpose |
|---------|-------------|---------|
| `drizzle-kit generate` | Local | Diff current schema → generate new migration SQL |
| `drizzle-kit push` | Local | Apply schema changes directly (no migration files) |
| `drizzle-kit migrate` | Local, Staging, Prod | Apply pending migration files |
| `drizzle-kit studio` | Local | Visual schema browser at `localhost:4000` |
| `drizzle-kit check` | CI | Verify migration SQL matches schema |
| `drizzle-kit up` | Local | Re-apply all migrations (reset scenario) |
| `pnpm docker:reset` | Local | Drop + recreate all Docker services |

### 4.4 Local Reset Procedure

When a developer's local schema diverges from the canonical migration path (e.g., after experimenting with `push`):

```bash
# Nuclear option: reset everything
pnpm docker:down
docker volume rm nexus_postgres_data nexus_redis_data
pnpm docker:up

# Re-apply all migrations from scratch
cd packages/db && npx drizzle-kit migrate

# Re-seed data (when seed scripts exist — S2+)
pnpm db:seed
```

### 4.5 Schema Change Classification

| Classification | Examples | Workflow |
|----------------|----------|----------|
| **Additive** | New table, new nullable column, new index | `generate` → review → `push` |
| **Transformative** | Rename column, change type, add NOT NULL | Expand-Contract (3 sprints) |
| **Destructive** | Drop table, drop column | Contract phase only (Sprint N+2) |
| **Data migration** | Backfill, copy between tables | Separate migration file, batched |

---

## 5. Staging Flow

Staging is the **first gate** where migrations run against a production-like environment. It uses a persistent Neon staging database that mirrors production configuration.

### 5.1 Staging Environment Configuration

| Setting | Value |
|---------|-------|
| **Vercel branch** | `staging` |
| **Neon database** | `nexus-anime-staging` (dedicated instance) |
| **Database size** | ~10% of production (cost-optimized) |
| **Redis** | Shared Upstash instance (separate key prefix `staging:`) |
| **Secrets** | Staging-grade (test Stripe keys, test OAuth apps) |

### 5.2 Staging Deployment Pipeline

```
┌────────────────────────────────────────────────────────────────────┐
│  Staging Flow                                                       │
│                                                                     │
│  Developer pushes to `staging` branch                               │
│       │                                                             │
│       ▼                                                             │
│  GitHub Actions: staging-deploy workflow                            │
│       │                                                             │
│       ├─ 1. pnpm install --frozen-lockfile                          │
│       ├─ 2. pnpm lint                                               │
│       ├─ 3. pnpm typecheck                                          │
│       ├─ 4. pnpm test                                               │
│       ├─ 5. pnpm build                                              │
│       ├─ 6. drizzle-kit check (verify migrations match schema)      │
│       ├─ 7. drizzle-kit migrate (apply to Neon staging)             │
│       ├─ 8. Run smoke tests (API health + critical paths)           │
│       └─ 9. Deploy to Vercel (staging branch → staging URL)        │
│       │                                                             │
│       ▼                                                             │
│  Post-deploy validation                                             │
│       │                                                             │
│       ├─ Data consistency check (row counts, checksums)             │
│       ├─ API contract test suite                                    │
│       └─ Manual QA sign-off                                         │
└────────────────────────────────────────────────────────────────────┘
```

### 5.3 Staging Migration Rules

| Rule | Rationale |
|------|-----------|
| Migrations are **applied automatically** by CI on `staging` branch push | Reduces human error |
| `drizzle-kit check` runs **before** migrate | Catches schema drift |
| Staging database is **never reset** without team notification | Preserves QA data for regression testing |
| Failed migrations **block deployment** | Prevents broken schema from reaching staging |
| Staging uses **realistic seed data** (anonymized production subset when available) | Catches performance issues early |

### 5.4 Staging Data Strategy

Since staging runs against a persistent Neon instance, data accumulates over time. The following strategy keeps staging performant and realistic:

1. **Seed on first deploy** — Run seed scripts (17 genres, 5 shelves, 20 studios, sample anime) when the staging database is freshly created.
2. **Preserve across deploys** — Do not reset staging between deploys unless explicitly requested.
3. **Anonymize production data** — When refreshing staging from production, strip PII (emails → `user+<id>@staging.nexusanime.com`, hashed passwords → `STAGING_RESET`).
4. **Quarterly reset** — Every quarter (aligned with sprint boundaries), reset staging from a fresh production backup to prevent schema drift.

### 5.5 Staging Rollback

If a staging migration fails or causes issues:

```bash
# Option 1: Revert the branch (preferred)
git revert HEAD  # Revert the migration commit
git push origin staging  # CI re-applies previous state

# Option 2: Manual rollback (if migration partially applied)
cd packages/db
npx drizzle-kit migrate --rollback  # Reverts last migration

# Option 3: Reset staging database (nuclear)
# Via Neon dashboard: restore to point-in-time backup
# Then re-apply all migrations:
npx drizzle-kit migrate
```

---

## 6. Production Flow

Production is the **final gate**. Migrations here affect real users and real data. The production flow adds additional safeguards: maintenance windows, monitoring, and automated rollback triggers.

### 6.1 Production Environment Configuration

| Setting | Value |
|---------|-------|
| **Vercel branch** | `main` |
| **Neon database** | `nexus-anime` (production instance) |
| **Database tier** | Dedicated compute (2+ vCPU, 4GB+ RAM) |
| **Redis** | Upstash production instance (99.9% SLA) |
| **Secrets** | Production-grade (live Stripe, live OAuth, real provider keys) |
| **Monitoring** | Sentry + Vercel Analytics + Neon metrics |

### 6.2 Production Deployment Pipeline

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Production Flow                                                         │
│                                                                          │
│  PR merged to `main` (after staging QA sign-off)                        │
│       │                                                                  │
│       ▼                                                                  │
│  GitHub Actions: production-deploy workflow                              │
│       │                                                                  │
│       ├─ 1. pnpm install --frozen-lockfile                               │
│       ├─ 2. pnpm lint                                                    │
│       ├─ 3. pnpm typecheck                                               │
│       ├─ 4. pnpm test                                                    │
│       ├─ 5. pnpm build                                                   │
│       ├─ 6. drizzle-kit check                                            │
│       ├─ 7. Create pre-migration backup (Neon point-in-time)             │
│       ├─ 8. drizzle-kit migrate (with statement timeout: 30s)           │
│       ├─ 9. Run smoke tests against production URL                       │
│       └─ 10. Deploy to Vercel (main → production URL)                    │
│       │                                                                  │
│       ▼                                                                  │
│  Post-deploy monitoring (72 hours)                                       │
│       │                                                                  │
│       ├─ Sentry error rate < baseline + 0.1%                             │
│       ├─ API p95 latency < baseline + 20%                                │
│       ├─ Database CPU < 80%                                              │
│       ├─ No new critical alerts                                          │
│       └─ Data consistency spot-checks pass                               │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.3 Production Migration Rules

| Rule | Rationale |
|------|-----------|
| Migrations run **only on `main` branch** merge | Prevents accidental application |
| Pre-migration backup is **mandatory** | Enables point-in-time recovery |
| Migrations run **before** Vercel deploy | Ensures schema is ready when new code starts |
| Statement timeout set to **30 seconds** | Prevents long-running locks |
| `CREATE INDEX CONCURRENTLY` is **required** | Non-blocking index creation |
| No `DROP COLUMN` migrations during peak hours (08:00-22:00 UTC) | Reduces risk window |
| All production migrations require **tech lead approval** | Human gate for destructive changes |
| Post-deploy monitoring for **72 hours** | Catches delayed issues (trigger failures, slow queries) |

### 6.4 Production Migration Window

| Window | Time (UTC) | Rationale |
|--------|------------|-----------|
| **Preferred** | 14:00–18:00 | Lowest traffic (APAC evening, EU afternoon, US morning) |
| **Acceptable** | 06:00–08:00 | US night, APAC afternoon |
| **Avoid** | 08:00–12:00, 20:00–00:00 | Peak EU and US traffic respectively |
| **Emergency** | Any (with approval) | Critical security fix or data corruption |

### 6.5 Pre-Migration Backup

Before every production migration, a point-in-time backup is created via Neon's API:

```bash
# Neon CLI backup (automated in CI)
neon backups create --name "pre-migration-$(date +%Y%m%d-%H%M%S)"

# Or via Neon dashboard: Project → Backups → Create Backup
```

Neon retains 7 days of point-in-time recovery. Combined with daily backups, this provides a 30-day recovery window.

### 6.6 Production Rollback

If a production migration causes issues, the rollback procedure depends on severity:

**Scenario A: Migration fails mid-execution (transaction rollback)**
```sql
-- Drizzle runs each migration in a transaction by default
-- If it fails, the entire migration rolls back automatically
-- No manual intervention needed
```

**Scenario B: Migration succeeds but application errors occur**
```bash
# Step 1: Rollback Vercel deployment (instant)
vercel rollback

# Step 2: If migration was non-destructive (ADD COLUMN, CREATE INDEX):
-- The old columns/tables are still there; no data loss
-- Simply redeploying the old code resolves the issue

# Step 3: If migration was destructive (DROP COLUMN):
-- Restore from point-in-time backup
neon backups restore --name "pre-migration-<timestamp>"
-- Then re-apply all subsequent migrations
```

**Scenario C: Data corruption detected post-migration**
```bash
# Step 1: Enable maintenance mode (if available)
# Step 2: Restore to pre-migration backup
neon backups restore --name "pre-migration-<timestamp>"
# Step 3: Re-apply migrations up to (but not including) the faulty one
cd packages/db
npx drizzle-kit migrate --tag <last-known-good>
# Step 4: Verify data integrity
pnpm test:integration
# Step 5: Resume traffic
```

### 6.7 Circuit Breaker for Dual-Write Phases

During the dual-write phase of an Expand-Contract migration, a circuit breaker pattern protects against writes to the new column failing:

```typescript
// lib/migration-circuit-breaker.ts
class MigrationCircuitBreaker {
  private failureCount = 0;
  private readonly threshold: number;
  private readonly fallback: 'legacy' | 'fail';

  constructor(opts: { threshold?: number; fallback?: 'legacy' | 'fail' } = {}) {
    this.threshold = opts.threshold ?? 5;
    this.fallback = opts.fallback ?? 'legacy';
  }

  async writeNewColumn<T>(fn: () => Promise<T>): Promise<T | null> {
    try {
      const result = await fn();
      this.failureCount = 0; // Reset on success
      return result;
    } catch (error) {
      this.failureCount++;
      console.error(`Migration write failed (${this.failureCount}/${this.threshold}):`, error);

      if (this.failureCount >= this.threshold) {
        // Alert on-call engineer
        // Sentry.captureMessage('Migration circuit breaker tripped', 'warning');
        return this.fallback === 'legacy' ? null : Promise.reject(error);
      }
      return null;
    }
  }
}
```

---

## 7. Rollback Strategy

### 7.1 Rollback Classification

| Type | Speed | Data Loss | Use Case |
|------|-------|-----------|----------|
| **Instant rollback** | Seconds | None | Vercel deploy revert (code only) |
| **Migration rollback** | Minutes | None | Revert last migration file |
| **Point-in-time restore** | 10–30 min | Seconds-to-minutes | Restore from Neon PITR |
| **Full rebuild** | 1–4 hours | Hours | Rebuild from backup + replay migrations |

### 7.2 Rollback Decision Matrix

```
Error detected post-migration?
       │
       ├─ Is it a CODE issue (not schema)?
       │      └─ YES → Instant rollback (vercel rollback)
       │
       ├─ Is the migration STILL RUNNING?
       │      └─ YES → Wait for timeout (30s), transaction auto-rolls back
       │
       ├─ Was the migration NON-DESTRUCTIVE? (ADD, CREATE, ALTER ADD)
       │      └─ YES → Instant rollback + revert migration file
       │
       ├─ Was the migration DESTRUCTIVE? (DROP, ALTER DROP, TYPE CHANGE)
       │      └─ YES → Point-in-time restore + re-apply good migrations
       │
       └─ Is there DATA CORRUPTION?
              └─ YES → Point-in-time restore + manual data repair
```

### 7.3 Rollback Procedures by Migration Type

#### Additive Migration (new table, new nullable column)

```bash
# Simplest case: just revert the code
git revert HEAD
git push origin main  # CI redeploys without the migration

# The added column/table remains but is unused — no harm
# Clean up in a follow-up migration next sprint
```

#### Index Creation

```bash
# If CREATE INDEX CONCURRENTLY fails:
# PostgreSQL automatically rolls back the concurrent index creation
# The database remains in its pre-index state

# If the index causes query plan regression:
DROP INDEX CONCURRENTLY idx_name;
```

#### Data Migration (backfill, copy)

```bash
# If backfill produces incorrect data:
# 1. Identify affected rows (check migration log)
# 2. Run corrective UPDATE in batches
UPDATE table_name
SET column = corrected_value
WHERE migration_id = '<bad-migration-tag>'
  AND condition_to_identify_bad_rows;
```

#### Destructive Migration (DROP COLUMN, type change)

```bash
# Requires point-in-time restore
# 1. Neon dashboard → select pre-migration backup
# 2. Restore to new branch/database
# 3. Verify data integrity
# 4. Swap connection string in Vercel env
# 5. Redeploy
```

### 7.4 Rollback Testing

Every migration must include a **rollback test** in staging before production deployment:

```bash
# In staging environment:
cd packages/db

# 1. Apply migration
npx drizzle-kit migrate

# 2. Verify it applied correctly
npx drizzle-kit check

# 3. Test rollback (if applicable)
# For additive migrations: verify old code still works
git checkout HEAD~1  # Previous code
pnpm test:integration  # Run integration tests against new schema
git checkout -  # Return to current

# 4. If rollback test fails → fix code before production deploy
```

---

## 8. Data Validation & Reconciliation

### 8.1 Validation Layers

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: Schema Validation (drizzle-kit check)             │
│  ─ Compares generated SQL against Drizzle schema definition │
│  ─ Runs in CI before any migration                          │
├─────────────────────────────────────────────────────────────┤
│  Layer 2: Row Count Validation                              │
│  ─ Compare record counts between old and new tables         │
│  ─ Threshold: ±5% tolerance for in-flight writes             │
├─────────────────────────────────────────────────────────────┤
│  Layer 3: Checksum Validation                               │
│  ─ Hash critical columns to detect data drift               │
│  ─ Run on-demand for large tables                           │
├─────────────────────────────────────────────────────────────┤
│  Layer 4: Business Logic Validation                         │
│  ─ Run aggregate queries on both old and new schemas        │
│  ─ Compare sums, counts, averages                          │
├─────────────────────────────────────────────────────────────┤
│  Layer 5: Application-Level Validation                      │
│  ─ Integration tests exercise both read and write paths     │
│  ─ Smoke tests verify critical user journeys                │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 Row Count Validation Script

```sql
-- Run after each migration to verify no unexpected data loss
-- Tolerance: ±5% to account for in-flight writes during migration

WITH counts AS (
    SELECT 'anime' as table_name, count(*) as row_count FROM anime
    UNION ALL
    SELECT 'episodes', count(*) FROM episodes
    UNION ALL
    SELECT 'seasons', count(*) FROM seasons
    UNION ALL
    SELECT 'users', count(*) FROM users
    -- Add all tables...
)
SELECT
    table_name,
    row_count,
    LAG(row_count) OVER (PARTITION BY table_name ORDER BY checked_at) as previous_count,
    CASE
        WHEN LAG(row_count) OVER (PARTITION BY table_name ORDER BY checked_at) IS NULL THEN 'NEW_TABLE'
        WHEN ABS(row_count - LAG(row_count) OVER (PARTITION BY table_name ORDER BY checked_at))
             <= 0.05 * LAG(row_count) OVER (PARTITION BY table_name ORDER BY checked_at) THEN 'OK'
        ELSE 'ALERT'
    END as status
FROM counts;
```

### 8.3 Checksum Validation

```sql
-- For critical tables, compute a checksum over key columns
-- Run before and after migration; compare

SELECT
    count(*) as row_count,
    md5(string_agg(id::text, ',' ORDER BY content_hash)) as checksum
FROM (
    SELECT
        id,
        md5(concat_ws('|', title, slug, synopsis, score)) as content_hash
    FROM anime
    WHERE deleted_at IS NULL
) sub;
```

### 8.4 Business Logic Validation

```sql
-- Verify aggregates match expected values after migration

-- Anime score distribution (should not change)
SELECT
    CASE
        WHEN score >= 8 THEN 'high'
        WHEN score >= 6 THEN 'medium'
        ELSE 'low'
    END as score_bucket,
    count(*) as count
FROM anime
WHERE deleted_at IS NULL
GROUP BY 1
ORDER BY 1;

-- User engagement metrics (should not regress)
SELECT
    count(*) as total_watch_history,
    count(DISTINCT user_id) as unique_users,
    avg(completion_pct) as avg_completion
FROM watch_history;
```

### 8.5 Post-Migration Validation Checklist

- [ ] `drizzle-kit check` passes (schema matches migrations)
- [ ] All migration files applied (journal matches database)
- [ ] Row counts within ±5% of pre-migration baseline
- [ ] Checksums match for critical tables
- [ ] Business aggregate queries return expected results
- [ ] Integration tests pass (read + write paths)
- [ ] Smoke tests pass (critical user journeys)
- [ ] No new slow queries (check `pg_stat_statements`)
- [ ] No lock contention during migration (check `pg_locks` log)
- [ ] No trigger errors (check database error log)

---

## 9. CI/CD Integration

### 9.1 GitHub Actions Workflows

#### CI Workflow (PR to `main`)

```yaml
# .github/workflows/ci.yml — existing, extended with migration check
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm }

      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build

      # Migration-specific checks
      - name: Verify migration SQL matches schema
        run: cd packages/db && npx drizzle-kit check

      - name: Verify migration files are complete
        run: cd packages/db && npx drizzle-kit verify
```

#### Staging Deploy Workflow

```yaml
# .github/workflows/staging-deploy.yml
name: Staging Deploy
on:
  push:
    branches: [staging]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm }

      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build

      - name: Check migrations
        run: cd packages/db && npx drizzle-kit check

      - name: Apply migrations to Neon staging
        run: cd packages/db && npx drizzle-kit migrate
        env:
          DATABASE_URL: ${{ secrets.STAGING_DATABASE_URL }}

      - name: Run smoke tests
        run: pnpm test:smoke
        env:
          API_BASE_URL: ${{ secrets.STAGING_API_URL }}

      - name: Deploy to Vercel (staging)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--scope staging'
```

#### Production Deploy Workflow

```yaml
# .github/workflows/production-deploy.yml
name: Production Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production  # Requires manual approval in GitHub settings
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm }

      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build

      - name: Check migrations
        run: cd packages/db && npx drizzle-kit check

      - name: Create pre-migration backup
        run: |
          curl -X POST "https://api.neon.tech/v2/projects/${{ secrets.NEON_PROJECT_ID }}/branches/${{ secrets.NEON_BRANCH_ID }}/backups" \
            -H "Authorization: Bearer ${{ secrets.NEON_API_KEY }}" \
            -H "Content-Type: application/json" \
            -d "{\"backup\":{\"name\":\"pre-migration-$(date +%Y%m%d-%H%M%S)\"}}"

      - name: Apply migrations to Neon production
        run: cd packages/db && npx drizzle-kit migrate
        env:
          DATABASE_URL: ${{ secrets.PROD_DATABASE_URL }}
          # Statement timeout: 30 seconds
          PGOPTIONS: "-c statement_timeout=30000"

      - name: Run smoke tests
        run: pnpm test:smoke
        env:
          API_BASE_URL: ${{ secrets.PROD_API_URL }}

      - name: Deploy to Vercel (production)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

      - name: Post-deploy health check
        run: |
          curl -sf "${{ secrets.PROD_API_URL }}/api/health" || exit 1
          echo "Health check passed"
```

### 9.2 Environment Variables Required

| Variable | Used In | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | All | PostgreSQL connection string |
| `STAGING_DATABASE_URL` | CI (staging) | Neon staging connection string |
| `PROD_DATABASE_URL` | CI (prod) | Neon production connection string |
| `NEON_API_KEY` | CI (prod) | Neon API for backup creation |
| `NEON_PROJECT_ID` | CI (prod) | Neon project identifier |
| `NEON_BRANCH_ID` | CI (prod) | Neon branch identifier |
| `VERCEL_TOKEN` | CI | Vercel deployment token |
| `VERCEL_ORG_ID` | CI | Vercel organization ID |
| `VERCEL_PROJECT_ID` | CI | Vercel project ID |
| `STAGING_API_URL` | CI | Staging URL for smoke tests |
| `PROD_API_URL` | CI | Production URL for smoke tests |

### 9.3 Deployment Order

```
1. Code builds and passes CI checks
2. Migration SQL is verified against schema (drizzle-kit check)
3. Pre-migration backup is created (production only)
4. Migrations are applied to database
5. Smoke tests verify database connectivity
6. Vercel deployment is triggered
7. Post-deploy health check validates the running application
8. 72-hour monitoring window begins
```

**Critical:** Migrations run **before** the Vercel deploy. This ensures the database schema is ready when the new application code starts. If the migration fails, the Vercel deploy is blocked and the old code continues running against the unchanged schema.

---

## 10. Risk Assessment

### 10.1 Risk Categories

| Category | Risk | Likelihood | Impact | Mitigation |
|----------|------|------------|--------|------------|
| **Data Loss** | Migration drops data during column type change | Low | Critical | Expand-Contract pattern; pre-migration backup |
| **Downtime** | Long-running migration locks production table | Low | High | `CONCURRENTLY` for indexes; statement timeout; off-peak windows |
| **Schema Drift** | Local schema diverges from committed migrations | Medium | Medium | `drizzle-kit check` in CI; developer discipline |
| **Failed Migration** | Migration fails mid-execution on production | Low | High | Transactional DDL; automatic rollback; point-in-time recovery |
| **Performance Regression** | New index or trigger slows queries | Medium | Medium | Staging load testing; `EXPLAIN ANALYZE` review |
| **Data Corruption** | Backfill produces incorrect values | Low | High | Batched backfill; checksum validation; business logic tests |
| **Rollback Complexity** | Destructive migration rollback requires full restore | Low | High | Only allow destructive migrations in contract phase (after 1 sprint) |
| **Human Error** | Wrong migration applied to wrong environment | Low | Medium | Environment-specific CI jobs; separate credentials per tier |

### 10.2 Risk Mitigation Summary

| Mitigation | Applies To |
|------------|------------|
| Expand-Contract pattern | All schema changes |
| Pre-migration backup (Neon PITR) | Production migrations |
| `drizzle-kit check` in CI | All environments |
| Transactional DDL | All environments |
| `CREATE INDEX CONCURRENTLY` | All index creation |
| Statement timeout (30s) | Production migrations |
| Circuit breaker for dual-write | Expand-Contract dual-write phase |
| 72-hour post-deploy monitoring | Production migrations |
| Staging validation before production | All production migrations |
| Tech lead approval for destructive changes | Production migrations |

---

## 11. Runbooks

### 11.1 Pre-Migration Checklist

- [ ] Migration plan reviewed and approved by tech lead
- [ ] Rollback procedure tested in staging
- [ ] Monitoring and alerting configured (Sentry, Neon metrics)
- [ ] Team roles and responsibilities defined (who applies, who monitors)
- [ ] Stakeholder communication sent (if user-visible impact)
- [ ] Backup and recovery procedures verified (Neon PITR test)
- [ ] Test environment validation complete (staging smoke tests pass)
- [ ] Performance benchmarks established (baseline p95 latency, row counts)
- [ ] Security review completed (no sensitive data in migration logs)
- [ ] Compliance requirements verified (GDPR, data retention)

### 11.2 During Migration

- [ ] Execute migration phases in planned order
- [ ] Monitor key performance indicators continuously (CPU, locks, latency)
- [ ] Validate data consistency at each checkpoint (row counts, checksums)
- [ ] Communicate progress to stakeholders (Slack #deployments channel)
- [ ] Document any deviations from plan (with justification)
- [ ] Execute rollback if success criteria not met
- [ ] Coordinate with dependent teams (frontend, mobile, marketing)
- [ ] Maintain detailed execution logs (timestamps, row counts, durations)

### 11.3 Post-Migration

- [ ] Validate all success criteria met (Section 13)
- [ ] Perform comprehensive system health checks
- [ ] Execute data reconciliation procedures (Section 8)
- [ ] Monitor system performance over 72 hours
- [ ] Update documentation and runbooks
- [ ] Decommission legacy columns/tables (in Contract phase, not before)
- [ ] Conduct post-migration retrospective (what went well, what to improve)
- [ ] Archive migration artifacts (logs, backups, validation reports)
- [ ] Update disaster recovery procedures

### 11.4 Emergency Rollback Runbook

```bash
# EMERGENCY ROLLBACK — Production Migration Failure
# Authorized by: Tech Lead or On-Call Engineer

# Step 1: Assess severity (30 seconds)
# - Is the application returning errors? → YES → Continue
# - Is data corruption detected? → YES → Continue
# - Is it a minor performance regression? → NO → Monitor, defer

# Step 2: Instant code rollback (10 seconds)
vercel rollback
# This reverts the application code to the previous deployment.
# The database schema remains at the new version (backward-compatible).

# Step 3: Verify rollback succeeded (30 seconds)
curl -sf https://nexus-anime.com/api/health
# If health check passes → Issue resolved. Investigate root cause.
# If health check fails → Database may be incompatible → Continue to Step 4.

# Step 4: Database rollback (if code rollback insufficient)
# For additive migrations: no action needed (old code ignores new columns)
# For destructive migrations: point-in-time restore required
neon backups restore --name "pre-migration-<timestamp>"
# Update DATABASE_URL in Vercel to point to restored database
vercel env set DATABASE_URL <restored-connection-string>
# Redeploy
vercel deploy --prod

# Step 5: Verify recovery (2 minutes)
curl -sf https://nexus-anime.com/api/health
pnpm test:smoke

# Step 6: Communicate resolution
# - Update #deployments Slack channel
# - Notify stakeholders
# - Create incident report
```

---

## 12. Communication Templates

### 12.1 Pre-Migration Notification

```
📋 MIGRATION SCHEDULED
━━━━━━━━━━━━━━━━━━━━━
Date: 2026-06-23 14:00 UTC
Duration: ~15 minutes expected
Impact: No downtime expected (zero-downtime migration)

Migration: 009_add_synopsis_localized
Type: Additive (new nullable column)
Tables affected: anime
Rollback: Instant (vercel rollback)

Monitoring: #deployments Slack channel
On-call: @tech-lead
```

### 12.2 Migration Status Update

```
🔄 MIGRATION IN PROGRESS
━━━━━━━━━━━━━━━━━━━━━━━
Phase: Apply migration (2 of 4)
Started: 14:03 UTC
Elapsed: 2 minutes

Progress:
  ✅ Pre-migration backup created
  ✅ Migration SQL verified (drizzle-kit check)
  🔄 Applying migration to Neon production...
  ⏳ Smoke tests
  ⏳ Vercel deploy

Database metrics:
  CPU: 12% (baseline: 10%)
  Active connections: 5 (baseline: 3)
  Lock contention: None
```

### 12.3 Migration Complete

```
✅ MIGRATION COMPLETE
━━━━━━━━━━━━━━━━━━━━
Completed: 2026-06-23 14:12 UTC
Duration: 9 minutes
Status: SUCCESS

Validation:
  ✅ Row counts: 100% match
  ✅ Checksums: verified
  ✅ Smoke tests: 12/12 passed
  ✅ Health check: healthy
  ✅ API p95 latency: 45ms (baseline: 42ms, +7%)

Next steps:
  - 72-hour monitoring window active
  - Dual-write phase begins (Sprint 3)
  - Contract phase scheduled for Sprint 4
```

### 12.4 Rollback Notification

```
⚠️ MIGRATION ROLLBACK EXECUTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Original migration: 009_add_synopsis_localized
Reason: [Brief description]
Time: 2026-06-23 14:18 UTC

Actions taken:
  ✅ Vercel rollback executed (14:19 UTC)
  ✅ Health check passed (14:19 UTC)
  ✅ Application running on previous version

Database state:
  - Migration was additive → no data loss
  - New column remains but is unused
  - Will be cleaned up in follow-up migration

Next steps:
  - Root cause analysis scheduled
  - Fix will be applied in next sprint
```

---

## 13. Success Metrics

### 13.1 Technical Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Migration success rate** | 100% | Migrations applied without error / total migrations |
| **Downtime** | 0 seconds | Time during which API returns 5xx |
| **Data consistency** | 100% | Row count match + checksum verification |
| **Performance delta** | < +20% | p95 latency change vs. baseline |
| **Rollback time** | < 5 minutes | Time from rollback trigger to recovery |
| **Migration duration** | < 30 minutes | Time from first DDL to final validation |

### 13.2 Operational Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Plan adherence** | > 90% | Steps executed as planned / total steps |
| **Issue resolution time** | < 30 minutes | Time from issue detection to resolution |
| **Staging parity** | 100% | Migrations that pass staging also pass production |
| **Rollback test coverage** | 100% | Migrations with tested rollback / total migrations |

### 13.3 Business Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Customer impact** | 0 | Users reporting issues during migration window |
| **Revenue protection** | 100% | No lost transactions during migration |
| **Incident count** | 0 | P0/P1 incidents caused by migration |

---

## 14. References

| Document | Relationship |
|----------|--------------|
| `docs/database-design.md` | Authoritative SQL schema (20 tables, 7 ENUMs, ~50 indexes) |
| `docs/architecture/backend-architecture.md` | Layered monolith architecture, module structure, dependency rules |
| `docs/environment-specification.md` | 28 environment variables across 4 tiers, validation strategy |
| `docs/redis-strategy.md` | Three-tier caching architecture, cache invalidation patterns |
| `docs/prisma-specification.md` | Alternative ORM reference (not used in production) |
| `docs/milestone-1-project-foundation.md` | M1 foundation: monorepo, Docker, CI/CD, Vercel setup |
| `tooling/docker/docker-compose.yml` | Local Postgres 16, Redis 7, Mailpit services |
| `.github/workflows/ci.yml` | Existing CI pipeline (lint, typecheck, test, build) |
| `apps/web/vercel.json` | Vercel build configuration for the monorepo |
