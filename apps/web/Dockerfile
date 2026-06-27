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
COPY --from=builder /app/apps/web/scripts/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# pnpm store + Turbo cache mount points (under node user's home so the
# non-root runner can write to them; mounted as named volumes in compose)
RUN mkdir -p /home/node/.local/share/pnpm/store /home/node/.cache/turbo \
    && chown -R node:node /home/node/.local /home/node/.cache
VOLUME /home/node/.local/share/pnpm/store
VOLUME /home/node/.cache/turbo

# Switch to non-root user
USER node

EXPOSE 3000

# Health check — the /api/health route is created separately
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# tini as PID 1, then entrypoint validates env, then starts Next.js
ENTRYPOINT ["tini", "--", "./entrypoint.sh"]
CMD ["pnpm", "--filter", "@nexus/web", "start"]
