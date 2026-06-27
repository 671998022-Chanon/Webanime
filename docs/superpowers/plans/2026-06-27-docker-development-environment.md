# Docker & Development Environment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Production-ready containerized development environment for the Nexus Anime monorepo — multi-stage Dockerfile, docker-compose stack, dev/prod profiles, non-root user, pnpm + Turbo cache optimization, health checks, and future-service scaffolding (Postgres, Redis, MinIO, Meilisearch).

**Architecture:** A single multi-stage Dockerfile in `apps/web/` (Next.js app is the only deployable; packages are built inside the image via Turborepo). A root `docker-compose.yml` defines the app service plus backing services (Postgres, Redis, Mailpit). A `docker-compose.override.yml` (gitignored, opt-in) layers dev-only settings (source mounts, hot-reload ports, build cache mounts). Production compose profile is the default (no override); dev profile activates mounts and dev command. Environment is validated at container start via a tiny entrypoint that sources `.env` but never secrets.

**Tech Stack:** Node.js 22.11.0 (`.nvmrc`), pnpm 9.15.0, Turborepo 2.4.x, Next.js 16, React 19, Docker 24+, Docker Compose v2.

## Global Constraints

- Node version: `22.11.0` (from `.nvmrc`). Base image: `node:22.11.0-bookworm-slim` for builder, `node:22.11.0-bookworm-slim` for runner. Alpine is NOT used for the app image because native modules (sharp, better-sqlite3) frequently fail to build on musl; Alpine is used only for Postgres/Redis service images (those are fine).
- pnpm version: `9.15.0` (from `package.json#packageManager`). Enable `package-lock.json=false`, `.npmrc` hoist settings preserved.
- pnpm cache lives at `/home/node/.local/share/pnpm/store` inside the image (under the `node` user's home so the non-root runner can write to it); mount it as a named volume in dev (`pnpm-store`) so install is hot across container restarts.
- Turbo cache lives at `/home/node/.cache/turbo`; mount it as a named volume in dev (`turbo-cache`).
- Non-root user: `node` (uid 1000) in the runner stage; builder runs as root to install system deps.
- Next.js standalone output is NOT enabled yet (`next.config.ts` is minimal). The Dockerfile runs `next build` then `next start`. Do NOT add `output: "standalone"` — that is a separate architecture decision.
- Hot reload in dev: `next dev` with `serverExternalPackages` left unset (default). Source code is mounted at `/app` in dev; the container runs `pnpm --filter @nexus/web dev`.
- Health check: `curl -f http://localhost:3000/api/health || exit 1` (the health route is created in Task 5).
- Future services (MinIO, Meilisearch) are NOT started. They are stubs in compose with `profiles: ["future"]` so they never start unless explicitly requested.
- `.dockerignore` must exclude: `node_modules`, `.next`, `.turbo`, `.git`, `*.md`, `docker-compose*.yml`, `.env*` (except `.env.example`), `.github`, `docs`, `tooling/scripts`.
- All existing scripts (`pnpm docker:up/down/reset/logs`) continue to work — they target `tooling/docker/docker-compose.yml` which is the backing-services-only compose. The new root `docker-compose.yml` is for the app + services together; the tooling one remains for people who only want backing services.

---

## Task 1: Root `Dockerfile` (multi-stage, apps/web)

**Files:**

- Create: `apps/web/Dockerfile`

**Interfaces:**

- Consumes: `apps/web/package.json`, `package.json` (root), `pnpm-workspace.yaml`, `.npmrc`
- Produces: A Docker image tagged `nexus-anime-web:latest` (local dev) or `nexus-anime-web:<git-sha>` (CI). Exposes port `3000`.

**Steps:**

- [ ] **Step 1: Write the multi-stage Dockerfile**

```dockerfile
# ============================================================
# Stage 1: deps — install all workspace dependencies
# ============================================================
FROM node:22.11.0-bookworm-slim AS deps
WORKDIR /app

# pnpm is the declared package manager; enable it via corepack (bundled with Node 22)
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Copy only the files needed to install dependencies (Docker layer cache)
COPY package.json pnpm-workspace.yaml .npmrc ./
COPY apps/web/package.json ./apps/web/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY packages/cache/package.json ./packages/cache/package.json
COPY packages/ui/package.json ./packages/ui/package.json
COPY packages/config-eslint/package.json ./packages/config-eslint/package.json

# Install all deps (including devDeps) in deps stage
RUN pnpm install --frozen-lockfile

# ============================================================
# Stage 2: builder — build the Next.js app + workspace packages
# ============================================================
FROM node:22.11.0-bookworm-slim AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Copy installed deps from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/db/node_modules ./packages/db/node_modules
COPY --from=deps /app/packages/cache/node_modules ./packages/cache/node_modules
COPY --from=deps /app/packages/ui/node_modules ./packages/ui/node_modules
COPY --from=deps /app/packages/config-eslint/node_modules ./packages/config-eslint/node_modules

# Copy the rest of the source
COPY . .

# Build the entire workspace (Turborepo builds packages first, then apps/web)
RUN pnpm build

# ============================================================
# Stage 3: runner — production runtime
# ============================================================
FROM node:22.11.0-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# Non-root user for runtime
RUN useradd --create-home --uid 1000 node

# Install tini for proper PID 1 init (handles signals correctly)
RUN apt-get update && apt-get install -y --no-install-recommends tini curl \
    && rm -rf /var/lib/apt/lists/*

# Copy only the built app + its node_modules from builder
COPY --from=builder /app/apps/web/.next ./.next
COPY --from=builder /app/apps/web/package.json ./
COPY --from=builder /app/apps/web/node_modules ./node_modules
COPY --from=builder /app/packages/db ./packages/db
COPY --from=builder /app/packages/cache ./packages/cache
COPY --from=builder /app/packages/ui ./packages/ui
COPY --from=builder /app/packages/config-eslint ./packages/config-eslint
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/turbo.json ./

# pnpm store cache mount point (declared as volume in compose)
# Lives under node user's home so the non-root runner can write to it.
RUN mkdir -p /home/node/.local/share/pnpm/store /home/node/.cache/turbo \
    && chown -R node:node /home/node/.local /home/node/.cache
VOLUME /home/node/.local/share/pnpm/store

# Turbo cache mount point
VOLUME /home/node/.cache/turbo

# Switch to non-root user
USER node

EXPOSE 3000

# Health check — the /api/health route is created in Task 5
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# tini as PID 1, then start Next.js
ENTRYPOINT ["tini", "--"]
CMD ["pnpm", "--filter", "@nexus/web", "start"]
```

- [ ] **Step 2: Verify the Dockerfile is syntactically valid**

Run: `docker build --target deps apps/web/ 2>&1 | tail -20`
Expected: deps stage builds successfully (no source code needed beyond package.json files).

- [ ] **Step 3: Commit**

```bash
git add apps/web/Dockerfile
git commit -m "feat(docker): add multi-stage Dockerfile for apps/web"
```

---

## Task 2: `.dockerignore`

**Files:**

- Create: `.dockerignore` (repo root)

**Interfaces:**

- Produces: A `.dockerignore` file that prevents `node_modules`, `.next`, `.turbo`, `.git`, secrets, and unrelated repo files from being copied into the Docker build context.

**Steps:**

- [ ] **Step 1: Write `.dockerignore`**

```
# Dependencies
node_modules
.pnpm-store

# Build outputs
.next
.turbo
dist
out
build

# Version control
.git
.gitattributes

# Secrets — never copy into image
.env
.env.*
!.env.example

# Documentation (not needed at runtime)
*.md
docs
LICENSE

# CI
.github

# Tooling that is not part of the app build
tooling/scripts

# Docker files themselves (avoid recursive copy)
docker-compose*.yml
Dockerfile*
.docker

# OS / editor
.DS_Store
.idea
*.iml
.vscode

# Logs
*.log
npm-debug.log*
```

- [ ] **Step 2: Verify the file is correct**

Run: `grep -c "node_modules" .dockerignore`
Expected: `1`

- [ ] **Step 3: Commit**

```bash
git add .dockerignore
git commit -m "chore(docker): add .dockerignore"
```

---

## Task 3: Root `docker-compose.yml` (app + backing services)

**Files:**

- Create: `docker-compose.yml` (repo root)

**Interfaces:**

- Consumes: `apps/web/Dockerfile`, `tooling/docker/docker-compose.yml` (existing backing services)
- Produces: A compose file that starts the Next.js app + Postgres + Redis + Mailpit. The app service builds from the Dockerfile and exposes port 3000.

**Steps:**

- [ ] **Step 1: Write root `docker-compose.yml`**

```yaml
# Nexus Anime — full local development + production-like stack.
#
# Usage:
#   docker compose up -d                  # start app + backing services
#   docker compose down                   # stop
#   docker compose down -v                # stop and wipe volumes
#   docker compose logs -f                # tail logs
#   docker compose --profile future up -d  # also start MinIO + Meilisearch (future)
#
# Dev override: copy docker-compose.override.yml.example to
# docker-compose.override.yml (gitignored) and customize mounts/ports.

services:
  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
      target: runner
    image: nexus-anime-web:latest
    container_name: nexus-web
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://nexus:nexus@postgres:5432/nexus
      REDIS_URL: redis://redis:6379
      # Auth secret is generated at runtime if not set; override in .env
      AUTH_SECRET: ${AUTH_SECRET:-devonly-insecure-secret-change-me}
      NEXT_PUBLIC_APP_URL: ${NEXT_PUBLIC_APP_URL:-http://localhost:3000}
    ports:
      - "3000:3000"
    volumes:
      - pnpm-store:/home/node/.local/share/pnpm/store
      - turbo-cache:/home/node/.cache/turbo
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s
    restart: unless-stopped

  # Backing services — imported from tooling/docker/docker-compose.yml
  # (duplicated here so the root compose file is self-contained)

  postgres:
    image: postgres:16-alpine
    container_name: nexus-postgres
    environment:
      POSTGRES_USER: nexus
      POSTGRES_PASSWORD: nexus
      POSTGRES_DB: nexus
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U nexus -d nexus"]
      interval: 5s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: nexus-redis
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  mailpit:
    image: axllent/mailpit:latest
    container_name: nexus-mailpit
    ports:
      - "1025:1025" # SMTP
      - "8025:8025" # Web UI
    restart: unless-stopped

  # Future services — explicitly gated behind a profile so they never start
  # unless the developer opts in with `--profile future`.
  minio:
    image: minio/minio:latest
    container_name: nexus-minio
    profiles: ["future"]
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000" # S3 API
      - "9001:9001" # Web console
    volumes:
      - minio-data:/data
    healthcheck:
      test: ["CMD", "mc", "ready", "local"]
      interval: 5s
      timeout: 5s
      retries: 5

  meilisearch:
    image: getmeili/meilisearch:latest
    container_name: nexus-meilisearch
    profiles: ["future"]
    environment:
      MEILI_ENV: development
      MEILI_MASTER_KEY: ${MEILI_MASTER_KEY:-devonly-meili-master-key}
    ports:
      - "7700:7700"
    volumes:
      - meili-data:/meili_data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:7700/health"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
  pnpm-store:
  turbo-cache:
  minio-data:
  meili-data:
```

- [ ] **Step 2: Validate compose syntax**

Run: `docker compose config 2>&1 | head -30`
Expected: No errors; prints the resolved compose configuration.

- [ ] **Step 3: Commit**

```bash
git add docker-compose.yml
git commit -m "chore(docker): add root docker-compose.yml with app + backing services"
```

---

## Task 4: `docker-compose.override.yml.example` (dev overlay template)

**Files:**

- Create: `docker-compose.override.yml.example` (repo root, committed)
- The actual `docker-compose.override.yml` is gitignored (see `.gitignore` line 156) — users copy the example to customize.

**Interfaces:**

- Produces: A template that devs copy to `docker-compose.override.yml` to layer dev-only settings: source mounts for hot reload, dev command override, build target override to `builder` stage (so source is mounted and `next dev` runs).

**Steps:**

- [ ] **Step 1: Write `docker-compose.override.yml.example`**

```yaml
# Development override for Nexus Anime.
#
# Usage:
#   1. Copy this file:  cp docker-compose.override.yml.example docker-compose.override.yml
#   2. docker compose up -d  (the override is merged automatically)
#
# The override:
#   - Mounts the host source tree into the web container for hot reload
#   - Overrides the command to run `next dev` instead of `next start`
#   - Uses the `builder` stage (not `runner`) so devDeps are available
#   - Exposes the Next.js dev server port (3000) and React DevTools port (9229)
#   - Adds .env file loading from host

services:
  web:
    build:
      target: builder
    command: pnpm --filter @nexus/web dev
    volumes:
      # Source code mount for hot reload
      - .:/app
      # Prevent host node_modules from overwriting container node_modules
      - /app/node_modules
      - /app/apps/web/node_modules
      - /app/packages/db/node_modules
      - /app/packages/cache/node_modules
      - /app/packages/ui/node_modules
      - /app/packages/config-eslint/node_modules
      # Named caches so dev installs/builds are hot across restarts
      - pnpm-store:/home/node/.local/share/pnpm/store
      - turbo-cache:/home/node/.cache/turbo
    environment:
      NODE_ENV: development
      # Load env vars from .env.local if present on host
      # (docker compose automatically loads .env from repo root, but this is explicit)
      DATABASE_URL: postgresql://nexus:nexus@postgres:5432/nexus
      REDIS_URL: redis://redis:6379
      AUTH_SECRET: devonly-insecure-secret-change-me
      NEXT_PUBLIC_APP_URL: http://localhost:3000
    ports:
      - "3000:3000"
      - "9229:9229" # Node.js inspector / React DevTools
    # In dev, don't restart on crash — let the developer see the error
    restart: "no"
```

- [ ] **Step 2: Verify the example is valid YAML**

Run: `python3 -c "import yaml; yaml.safe_load(open('docker-compose.override.yml.example'))" && echo "OK"`
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add docker-compose.override.yml.example
git commit -m "chore(docker): add docker-compose.override.yml example for dev mounts"
```

---

## Task 5: Health check route (`/api/health`)

**Files:**

- Create: `apps/web/src/app/api/health/route.ts`

**Interfaces:**

- Produces: A GET route that returns `{ status: "ok", timestamp: "<ISO string>" }` with HTTP 200. Used by the Dockerfile `HEALTHCHECK` and root compose `healthcheck`.

**Steps:**

- [ ] **Step 1: Write the health route**

```typescript
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
```

- [ ] **Step 2: Verify the route type-checks**

Run: `cd apps/web && pnpm typecheck`
Expected: No errors (or at least no errors in the health route file).

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/api/health/route.ts
git commit -m "feat(web): add /api/health route for container health checks"
```

---

## Task 6: Environment validation at container start

**Files:**

- Create: `apps/web/scripts/entrypoint.sh`
- Modify: `apps/web/Dockerfile` (runner stage ENTRYPOINT)

**Interfaces:**

- Consumes: `.env.example` for variable names
- Produces: A shell script that runs before `next start` to validate required env vars are set (fail-fast with a clear message) and to generate a missing `AUTH_SECRET` at runtime.

**Steps:**

- [ ] **Step 1: Write `apps/web/scripts/entrypoint.sh`**

```bash
#!/bin/sh
set -e

# entrypoint.sh — validate environment before starting Next.js.
# Fails fast with a clear message if a required var is missing.

# Required for production runtime (auth, DB, Redis).
# In dev, these are provided by docker-compose.override.yml with safe defaults.
REQUIRED_VARS="DATABASE_URL REDIS_URL AUTH_SECRET"

MISSING=""
for var in $REQUIRED_VARS; do
  val=$(eval "echo \$$var")
  if [ -z "$val" ]; then
    MISSING="$MISSING $var"
  fi
done

if [ -n "$MISSING" ]; then
  echo "ERROR: Missing required environment variables:$MISSING" >&2
  echo "Set them in .env, docker-compose.override.yml, or your CI secrets." >&2
  exit 1
fi

# Generate AUTH_SECRET if it's still the dev placeholder
if [ "$AUTH_SECRET" = "devonly-insecure-secret-change-me" ]; then
  echo "WARNING: AUTH_SECRET is set to the dev placeholder. Generating a random one." >&2
  AUTH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
  export AUTH_SECRET
fi

echo "Environment validated. Starting Next.js..."
exec "$@"
```

- [ ] **Step 2: Make the script executable**

Run: `chmod +x apps/web/scripts/entrypoint.sh`
Expected: No output.

- [ ] **Step 3: Update the Dockerfile runner stage to use the entrypoint**

Edit `apps/web/Dockerfile` runner stage:

- Add `COPY --from=builder /app/apps/web/scripts/entrypoint.sh ./entrypoint.sh`
- Change `ENTRYPOINT ["tini", "--", "./entrypoint.sh"]`
- Keep `CMD ["pnpm", "--filter", "@nexus/web", "start"]`

- [ ] **Step 4: Verify the entrypoint script is valid shell**

Run: `sh -n apps/web/scripts/entrypoint.sh && echo "syntax OK"`
Expected: `syntax OK`

- [ ] **Step 5: Commit**

```bash
git add apps/web/scripts/entrypoint.sh apps/web/Dockerfile
git commit -m "feat(docker): add env validation entrypoint"
```

---

## Task 7: Update root `package.json` scripts

**Files:**

- Modify: `package.json` (root)

**Interfaces:**

- Produces: New `docker:dev`, `docker:build`, `docker:prod` scripts that use the root `docker-compose.yml`. Existing `docker:up/down/reset/logs` scripts are preserved (they target `tooling/docker/docker-compose.yml` for backing services only).

**Steps:**

- [ ] **Step 1: Add new docker scripts to root `package.json`**

Add to the `scripts` block:

```json
"docker:build": "docker compose build",
"docker:dev": "docker compose up -d --build",
"docker:prod": "docker compose up -d --build",
"docker:dev:down": "docker compose down",
"docker:prod:down": "docker compose down -v"
```

- [ ] **Step 2: Verify the JSON is valid**

Run: `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('OK')"`
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "chore(docker): add docker:dev/build/prod scripts to root package.json"
```

---

## Task 8: Self-review and documentation alignment

**Files:**

- Verify: All created files
- Optional modify: `docs/REPOSITORY-DESIGN.md` only if a new deliverable is needed (do not modify architecture, design system, API contracts, or database design — per the task constraints, this is pure infrastructure).

**Interfaces:**

- Produces: A checklist confirming each requirement from the spec is met, and a final commit if any files were modified.

**Steps:**

- [ ] **Step 1: Spec coverage checklist**

Verify each requirement from the task spec is addressed:

| Requirement                                           | Task(s)                                                                         |
| ----------------------------------------------------- | ------------------------------------------------------------------------------- |
| Multi-stage Dockerfile                                | Task 1                                                                          |
| docker-compose.yml                                    | Task 3                                                                          |
| docker-compose.override.yml (dev)                     | Task 4 (example, gitignored override)                                           |
| .dockerignore                                         | Task 2                                                                          |
| Dev container optimization                            | Task 4 (source mounts, dev command)                                             |
| Prod image optimization                               | Task 1 (runner stage, non-root, tini)                                           |
| Env var loading                                       | Task 6 (entrypoint), Task 3 (compose `environment`)                             |
| Health checks                                         | Task 5                                                                          |
| Volume strategy for dev                               | Task 4 (named volumes + source mounts)                                          |
| Non-root container user                               | Task 1 (runner `USER node`)                                                     |
| pnpm cache optimization                               | Task 1 (deps stage), Task 3 (`pnpm-store` volume)                               |
| Turbo cache optimization                              | Task 1 (builder stage), Task 3 (`turbo-cache` volume)                           |
| Future services (Postgres, Redis, MinIO, Meilisearch) | Task 3 (Postgres/Redis active, MinIO/Meilisearch behind `profiles: ["future"]`) |
| .env.example review                                   | No changes needed — already documents all vars used by compose                  |
| Build/lint/typecheck inside container                 | Validated by Task 1 (builder stage runs `pnpm build`)                           |
| Hot reload works                                      | Task 4 (source mount + `next dev`)                                              |

- [ ] **Step 2: Verify consistency with existing docs**

- `CLAUDE.md` references `docs/deployment.md` which does not exist. This task does NOT create that doc (out of scope). The docker-compose files are self-documenting with comments.
- `.gitignore` already ignores `docker-compose.override.yml` and `.docker/` — no change needed.
- `.env.example` already documents all env vars referenced in compose — no change needed.
- `tooling/docker/docker-compose.yml` is preserved as the backing-services-only compose for developers who don't need the app container.

- [ ] **Step 3: Final commit if any doc changes needed (otherwise skip)**

If no doc changes are needed, this step is a no-op.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-06-27-docker-development-environment.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
