# ADR-001: Modular Monolith in Next.js 16

**Status:** Accepted  
**Date:** 2026-06-23  
**Milestone:** M1

## Context

Nexus Anime requires a premium anime streaming platform with fast iteration by a small team (~3.75 FTE). The master roadmap consolidates Phases 1–9 into a single delivery plan targeting MVP in 10 sprints.

Competing approaches considered:

1. **Separate NestJS API + Next.js frontend** — higher operational overhead for a small team
2. **Microservices** — premature at MVP scale
3. **Next.js modular monolith** — server-first App Router with domain modules

The repository README previously referenced NestJS and Prisma; the approved roadmap specifies Next.js 16 route handlers, Drizzle ORM, and Auth.js.

## Decision

Adopt a **pnpm + Turborepo monorepo** with:

- **Single deployable:** `apps/web` (Next.js 16 App Router, React 19, TypeScript strict)
- **Shared packages:** `@nexus/ui` (design system), `@nexus/config-*` (tooling)
- **Data layer (S2+):** Drizzle ORM on Neon PostgreSQL — not Prisma
- **Auth (S4+):** Auth.js v5 with JWT in HTTP-only Secure cookies
- **Branching:** Single `main` branch until team exceeds 3 engineers
- **Hosting:** Vercel Pro with Cloudflare at the edge

Architecture layers inside `apps/web`:

```
Route handlers / Server Actions → Services → Repositories → Drizzle
```

## Consequences

### Positive

- One runtime boundary simplifies auth, billing gates, and stream signing
- Server Components reduce client bundle size for catalog SEO pages
- Shared UI package enforces design system consistency
- Turborepo enables fast CI with task caching

### Negative

- `@nexus/ui` TopNav depends on `next/link` (peer dependency on Next.js)
- Monolith scaling limits require deliberate extraction at 100K+ MAU (Meilisearch, read replicas)
- All engineers must understand full-stack Next.js patterns

### Follow-up

| Sprint | Action |
|--------|--------|
| S2 | Add `@nexus/db` package with Drizzle schema |
| S4 | Auth.js + middleware guards |
| S9 | Enable E2E CI gate, Sentry, Docker Compose verification |

## References

- `docs/master-roadmap.md` v10.0
- `docs/milestone-1-project-foundation.md`
