# ADR-001 — Modular monolith with Next.js App Router

- **Status:** accepted
- **Context:** The platform needs a UI that can evolve from a single product (`web`) to multiple surfaces (admin, mobile) without premature microservice overhead. The team is small-to-mid sized and values fast iteration, shared types, and a single deploy pipeline. We already have a Turborepo + pnpm workspace in place, and the stack (Next.js App Router, Drizzle, Upstash Redis) is designed for a single-application deployment on Vercel.
- **Decision:** Adopt a **modular monolith** inside the Turborepo: a single Next.js App Router application (`apps/web`) consuming shared packages (`@nexus/ui`, `@nexus/db`, `@nexus/cache`). Modules are bounded by directory and package boundaries, not by network calls. We extract a separate service or app only when a clear scaling or team-boundary need emerges (e.g. a dedicated admin app, or a video-transcoding worker).
- **Consequences:**
  - Easier local development (one app, one dev server).
  - Single deploy pipeline (Vercel).
  - Shared types across the whole product via `@nexus/*` packages.
  - **Risk:** tight coupling between modules. Mitigated by strict package boundaries, the `@nexus/*` scope convention, and ADR-governed extraction criteria — if a module needs independent deploy, scaling, or ownership, we extract it and write a new ADR.
