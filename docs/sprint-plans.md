# Nexus Anime — Sprint Plans (Sprints 1–5)

**Document Type:** Sprint Execution Plan  
**Version:** 1.0  
**Sprint Length:** 2 weeks  
**Team:** 1 Full-Stack Lead + 1 Frontend Engineer + 0.5 Product/Content/QA  

---

## Sprint 1 — Foundation (Weeks 1–2)

### Goals
- Establish the engineering foundation: migrate from JavaScript to TypeScript, implement the design token system, build core UI primitives, and scaffold the application shell with navigation.

### Tasks

| ID | Task | Owner | Est. Effort |
|----|------|-------|-------------|
| T1.1 | Migrate Next.js scaffold from JavaScript to TypeScript (`tsconfig.json`, rename files, fix type errors) | Tech Lead | 3d |
| T1.2 | Configure Tailwind CSS 4 with Nexus design tokens (colors, typography, spacing, breakpoints) | Frontend | 2d |
| T1.3 | Set up font loading: Exo 2 (display), Inter (body), JetBrains Mono (mono) via `next/font` | Frontend | 0.5d |
| T1.4 | Build UI primitive: `Button` (variants: primary, secondary, ghost, destructive) | Frontend | 1d |
| T1.5 | Build UI primitive: `Badge` (variants: default, resonance, gold, outline) | Frontend | 0.5d |
| T1.6 | Build UI primitive: `Input` (with label, error state, icon slot) | Frontend | 1d |
| T1.7 | Build UI primitive: `Skeleton` (shimmer placeholder for cards, text, hero) | Frontend | 0.5d |
| T1.8 | Build `PageShell` layout component (dark void background, responsive grid) | Frontend | 1.5d |
| T1.9 | Build `TopNav` component (logo, nav links, auth CTA, mobile hamburger) | Frontend | 1.5d |
| T1.10 | Set up path aliases (`@/components`, `@/features`, `@/lib`, `@/types`) and folder structure | Tech Lead | 0.5d |
| T1.11 | Configure ESLint + Prettier with Tailwind plugin | Tech Lead | 0.5d |
| T1.12 | Set up Vercel + GitHub integration; verify preview deployments | Tech Lead | 0.5d |
| T1.13 | Create `README.md` with project overview, setup instructions, and architecture diagram | Tech Lead | 0.5d |

### Deliverables
- [ ] TypeScript build passes with zero errors
- [ ] Design tokens live in Tailwind config (Void Base `#0C0E12`, Resonance `#00E5CC`, Rift Gold `#F5A623`)
- [ ] 4 UI primitives (Button, Badge, Input, Skeleton) in `@/components/ui/`
- [ ] PageShell + TopNav rendering on `/`
- [ ] Vercel preview deployments working on PRs
- [ ] Milestone M1 achieved: Design system in code

### Dependencies
| Dependency | Required For | Status |
|------------|-------------|--------|
| Vercel + GitHub integration (T1.12) | All subsequent CI/CD | Must complete first |
| TypeScript migration (T1.1) | All coding tasks | Must complete first |
| Design tokens (T1.2) | All UI component work | Must complete before T1.4–T1.9 |

### Risks
- **R3 (AAA UI scope creep):** Keep animations static in Sprint 1; motion budget deferred to Sprint 3
- **R5 (Small team bottleneck):** Frontend owns all UI primitives; Tech Lead owns infra — no overlap

---

## Sprint 2 — Database & Catalog API (Weeks 3–4)

### Goals
- Stand up the database layer: define the Drizzle ORM schema, run migrations, build the catalog API (titles, genres, shelves), and seed initial reference data.

### Tasks

| ID | Task | Owner | Est. Effort |
|----|------|-------|-------------|
| T2.1 | Set up Neon PostgreSQL project (staging environment) | Tech Lead | 0.5d |
| T2.2 | Configure Drizzle ORM (`drizzle.config.ts`, connection, migration scripts) | Tech Lead | 1d |
| T2.3 | Define Drizzle schema: `users`, `titles`, `seasons`, `episodes`, `genres`, `titleGenres`, `shelves`, `shelfItems` | Tech Lead | 2d |
| T2.4 | Define Drizzle schema: `subscriptions`, `watchlistItems`, `watchProgress`, `userPreferences` | Tech Lead | 1d |
| T2.5 | Generate and run initial migration; verify schema in Neon | Tech Lead | 0.5d |
| T2.6 | Build `TitleRepository` (CRUD, list with pagination, genre filter) | Tech Lead | 1.5d |
| T2.7 | Build `GenreRepository` (list all, seed reference data) | Tech Lead | 0.5d |
| T2.8 | Build `ShelfRepository` (get shelf with ordered items) | Tech Lead | 0.5d |
| T2.9 | Build `CatalogService` (business logic: browse, search by title, shelf assembly) | Tech Lead | 1.5d |
| T2.10 | Create catalog route handlers: `GET /api/titles`, `GET /api/titles/:slug`, `GET /api/genres`, `GET /api/shelves` | Tech Lead | 1.5d |
| T2.11 | Add Zod validation schemas for all catalog API inputs | Tech Lead | 1d |
| T2.12 | Seed database with reference genres (Action, Romance, Sci-Fi, Fantasy, Slice of Life, etc.) and 3 shelves | Tech Lead + Content | 1d |
| T2.13 | Write integration tests for catalog API endpoints (Vitest + test DB) | QA | 1.5d |

### Deliverables
- [ ] Neon PostgreSQL staging database running with all tables
- [ ] Drizzle migrations reproducible (`pnpm db:generate`, `pnpm db:migrate`, `pnpm db:studio`)
- [ ] Catalog API endpoints returning correct data with Zod validation
- [ ] Standard API envelope (`{ data }` / `{ error }`) on all routes
- [ ] Seed data: 12+ genres, 3 shelves
- [ ] Integration tests passing for catalog endpoints
- [ ] Milestone M2 partially achieved (catalog API ready; UI in Sprint 3)

### Dependencies
| Dependency | Required For | Status |
|------------|-------------|--------|
| Sprint 1 completion (TS migration, folder structure) | All Sprint 2 work | Hard dependency |
| Neon project setup (T2.1) | Schema, migrations, seeding | Must complete first |
| Drizzle schema (T2.3, T2.4) | Repository and service layers | Must complete before T2.6–T2.10 |
| Content coordination for seed data (T2.12) | Genre list, shelf definitions | Content owner needed |

### Risks
- **R1 (Content licensing delays):** Use placeholder/seed content for development; real content ingest in Sprint 10
- **R5 (Small team bottleneck):** Tech Lead owns all backend work; Frontend can begin catalog UI against mock API contracts in parallel

---

## Sprint 3 — Catalog UI (Weeks 5–6)

### Goals
- Build the user-facing catalog experience: home page with hero banner and shelves, browse-by-genre, search, and title detail pages. This is the first major visual milestone.

### Tasks

| ID | Task | Owner | Est. Effort |
|----|------|-------|-------------|
| T3.1 | Build `AnimeCard` component (poster, title, badge, hover state, skeleton) | Frontend | 1.5d |
| T3.2 | Build `HeroBanner` component (full-bleed background, title overlay, CTA, parallax-ready) | Frontend | 2d |
| T3.3 | Build `ContentShelf` component (horizontal scroll row, shelf title, "See all" link) | Frontend | 1.5d |
| T3.4 | Build Home page (`/`) — HeroBanner + 3 ContentShelves (featured, trending, new) | Frontend | 1.5d |
| T3.5 | Build Browse page (`/browse`) — genre filter sidebar, grid of AnimeCards, pagination | Frontend | 2d |
| T3.6 | Build Genre browse page (`/browse/[genre]`) — filtered grid, genre header | Frontend | 1d |
| T3.7 | Build Search page (`/search?q=`) — input, results grid, empty state | Frontend | 1.5d |
| T3.8 | Build Title Detail page (`/title/[slug]`) — hero, synopsis, metadata, episode list | Frontend | 2d |
| T3.9 | Implement Framer Motion entrance animations (card fade-in, shelf stagger) | Frontend | 1d |
| T3.10 | Add responsive breakpoints (mobile: 2-col grid, tablet: 3-col, desktop: 5-col) | Frontend | 1d |
| T3.11 | Wire all pages to real catalog API (replace any mock data) | Frontend + Tech Lead | 1d |
| T3.12 | Add loading states (Skeleton components) for all data-fetching pages | Frontend | 0.5d |
| T3.13 | QA: Cross-browser visual check (Chrome, Firefox, Safari) | QA | 1d |

### Deliverables
- [ ] Home page live with hero + 3 shelves
- [ ] Browse and genre filter pages functional
- [ ] Search returning results from catalog API
- [ ] Title detail page with episode list
- [ ] Responsive on desktop, tablet, mobile
- [ ] Loading skeletons on all async pages
- [ ] Framer Motion animations active (≤ 400ms UI transitions)
- [ ] Milestone M2 fully achieved: Catalog browsable end-to-end

### Dependencies
| Dependency | Required For | Status |
|------------|-------------|--------|
| Sprint 2 catalog API (T2.10) | T3.11 wiring to real data | Hard dependency |
| Sprint 1 UI primitives (Button, Badge, Skeleton) | All Sprint 3 components | Hard dependency |
| Design tokens (Sprint 1) | All styling | Hard dependency |
| Content: 3+ hero titles configured | T3.4 Home page | Content owner needed |

### Risks
- **R3 (AAA UI scope creep):** Parallax and advanced motion deferred; keep to entrance animations only
- **R10 (Low-end mobile performance):** Implement lazy loading for shelf images; WebP format
- **R8 (SEO competition):** Ensure title pages have proper `<title>`, `<meta description>`, JSON-LD structured data

---

## Sprint 4 — Auth (Weeks 7–8)

### Goals
- Implement the complete authentication system: email/password and Google OAuth via Auth.js v5, session management, middleware guards, and onboarding flow.

### Tasks

| ID | Task | Owner | Est. Effort |
|----|------|-------|-------------|
| T4.1 | Install and configure Auth.js v5 (NextAuth) with Drizzle adapter | Tech Lead | 1.5d |
| T4.2 | Implement credentials provider (email + password with bcrypt hashing) | Tech Lead | 1d |
| T4.3 | Implement Google OAuth provider | Tech Lead | 0.5d |
| T4.4 | Create `users` table migration (id, email, name, image, hashedPassword, role, emailVerified) | Tech Lead | 0.5d |
| T4.5 | Build session strategy: JWT in HTTP-only Secure cookie (30-day rolling) | Tech Lead | 0.5d |
| T4.6 | Create `auth.ts` config, `lib/auth.ts` helpers (`getSession`, `requireAuth`) | Tech Lead | 0.5d |
| T4.7 | Build middleware: session injection, auth redirect, protected route guards | Tech Lead | 1d |
| T4.8 | Build Login page (`/login`) — email/password form, Google sign-in button, error states | Frontend | 1.5d |
| T4.9 | Build Register page (`/register`) — email/password form, terms link, validation | Frontend | 1d |
| T4.10 | Build Forgot Password page (`/forgot-password`) — email input, Resend integration | Frontend + Tech Lead | 1d |
| T4.11 | Build Onboarding page (`/onboarding`) — profile setup (name, avatar), genre preferences | Frontend | 1.5d |
| T4.12 | Add auth callback route handler (`/api/auth/[...nextauth]`) | Tech Lead | 0.5d |
| T4.13 | Configure Resend for transactional emails (welcome, password reset) | Tech Lead | 0.5d |
| T4.14 | Add Google OAuth credentials to environment config | Tech Lead | 0.25d |
| T4.15 | Write E2E tests: register → login → access protected route → logout (Playwright) | QA | 1.5d |
| T4.16 | Security review: session fixation, CSRF, brute force protection | Tech Lead | 0.5d |

### Deliverables
- [ ] Auth.js v5 configured with credentials + Google providers
- [ ] Login, Register, Forgot Password, and Onboarding pages live
- [ ] JWT session in HTTP-only Secure cookie working
- [ ] Middleware protecting `/nexus/*`, `/title/*/watch/*`, `/admin/*` routes
- [ ] Resend sending welcome and password reset emails
- [ ] E2E auth journey passing (register → login → protected → logout)
- [ ] Milestone M3 achieved: Auth complete

### Dependencies
| Dependency | Required For | Status |
|------------|-------------|--------|
| Sprint 2 database schema (users table) | Auth.js adapter | Hard dependency |
| Sprint 1 UI primitives (Input, Button) | Auth forms | Hard dependency |
| Google OAuth credentials (T4.14) | Google sign-in | Must obtain from Google Cloud Console |
| Resend API key (T4.13) | Transactional emails | Must obtain from Resend |
| Sprint 3 catalog UI | Onboarding genre preferences | Soft dependency (can use seed data) |

### Risks
- **R11 (Security breach):** Security review (T4.16) must pass before any auth goes to staging
- **R7 (Stripe/billing edge cases):** Auth must be rock-solid before billing integration in Sprint 5
- **Google OAuth delay:** Email/password credentials provider is the primary path; Google OAuth is additive — can ship email-only if credentials delayed

---

## Sprint 5 — Billing (Weeks 9–10)

### Goals
- Integrate Stripe for subscription billing: checkout flow, webhook handling, subscription status management, pricing page, and subscription gate middleware.

### Tasks

| ID | Task | Owner | Est. Effort |
|----|------|-------|-------------|
| T5.1 | Create Stripe account (test mode); configure products and prices (Nexus Prime $7.99/mo) | Tech Lead | 0.5d |
| T5.2 | Install Stripe SDK; set up server-side Stripe client | Tech Lead | 0.25d |
| T5.3 | Create `subscriptions` table migration (id, userId, stripeCustomerId, stripeSubscriptionId, status, currentPeriodEnd, cancelAtPeriodEnd) | Tech Lead | 0.5d |
| T5.4 | Build `SubscriptionRepository` (create, update, cancel, getByUserId) | Tech Lead | 1d |
| T5.5 | Build `BillingService` (create checkout session, handle subscription lifecycle) | Tech Lead | 1.5d |
| T5.6 | Create checkout route handler (`POST /api/billing/checkout`) — Stripe Checkout Session | Tech Lead | 1d |
| T5.7 | Create customer portal route handler (`POST /api/billing/portal`) — Stripe Billing Portal | Tech Lead | 0.5d |
| T5.8 | Create webhook handler (`POST /api/billing/webhook`) — handle `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed` | Tech Lead | 2d |
| T5.9 | Add webhook idempotency (deduplicate events by Stripe event ID) | Tech Lead | 0.5d |
| T5.10 | Build `requireSubscriber()` guard — checks active subscription before stream access | Tech Lead | 0.5d |
| T5.11 | Build Pricing page (`/pricing`) — Nexus Prime card, feature list, CTA | Frontend | 1.5d |
| T5.12 | Build Subscription Settings page (`/settings/subscription`) — current plan, billing portal link, cancel/resume | Frontend | 1.5d |
| T5.13 | Update middleware: subscription gate on `/title/*/watch/*` routes | Tech Lead | 0.5d |
| T5.14 | Add Stripe webhook signature verification | Tech Lead | 0.25d |
| T5.15 | Write E2E tests: subscribe → access stream → cancel → lose access (Playwright + Stripe test mode) | QA | 1.5d |
| T5.16 | Add subscription status to session/JWT claims (so `requireSubscriber()` is fast) | Tech Lead | 0.5d |

### Deliverables
- [ ] Stripe checkout flow working in test mode
- [ ] Webhook handler processing all subscription lifecycle events
- [ ] Pricing page live with Nexus Prime offering
- [ ] Subscription settings page with billing portal access
- [ ] `requireSubscriber()` gate blocking non-subscribers from watch routes
- [ ] Webhook idempotency preventing duplicate processing
- [ ] E2E billing journey passing
- [ ] Milestone M4 achieved: Revenue enabled

### Dependencies
| Dependency | Required For | Status |
|------------|-------------|--------|
| Sprint 4 auth (user accounts, sessions) | Subscription ownership | Hard dependency |
| Sprint 2 database schema (subscriptions table) | Billing repository | Hard dependency |
| Stripe account + API keys (T5.1) | All Stripe integration | Must complete first |
| Sprint 3 title detail page | "Subscribe to watch" CTA | Soft dependency |
| Webhook endpoint publicly accessible | Stripe webhook delivery | Requires Vercel preview or tunnel for local dev |

### Risks
- **R7 (Stripe/billing edge cases):** Idempotency (T5.9) and reconciliation are critical — test all edge cases (double webhook, expired session, failed payment)
- **R2 (Stream CDN costs):** Subscription gate ensures only paying users can access streams — monitor cost per title
- **Webhook delivery in dev:** Use Stripe CLI for local webhook forwarding; verify on Vercel preview deployments

---

## Cross-Sprint Dependency Graph (Sprints 1–5)

```
Sprint 1 (Foundation)
  ├──► Sprint 2 (DB + Catalog API)
  │         └──► Sprint 3 (Catalog UI)
  │
  ├──► Sprint 4 (Auth)
  │         └──► Sprint 5 (Billing)
  │
  └──► Sprint 3 (uses UI primitives from S1)
```

## Cumulative Milestone Progress

| Milestone | Target Sprint | Status After S5 |
|-----------|--------------|-----------------|
| M0 — Repository scaffold | Pre-Sprint | ✅ Done |
| M1 — Design system in code | Sprint 1 | ✅ Complete |
| M2 — Catalog browsable | Sprint 3 | ✅ Complete |
| M3 — Auth complete | Sprint 4 | ✅ Complete |
| M4 — Revenue enabled | Sprint 5 | ✅ Complete |
| M5 — Playback loop | Sprint 6 | ❌ Not started |
| M6 — Feature complete | Sprint 8 | ❌ Not started |
| M7 — Test & infra ready | Sprint 9 | ❌ Not started |
| M8 — Launch ready | Sprint 10 | ❌ Not started |

## Key Risks Across Sprints 1–5

| Risk | Sprints Affected | Mitigation |
|------|-----------------|------------|
| R1: Content licensing delays | All | Use seed/demo content through Sprint 10 |
| R3: AAA UI scope creep | S1, S3 | Static shell first; motion budget capped |
| R5: Small team bottleneck | All | Vertical slices; clear ownership (TL=backend, FE=frontend) |
| R11: Security breach | S4, S5 | Security review at S4; pen test at S9 |
| R13: Key person dependency | All | Document all architecture decisions; ADRs in repo |

---

*Next: Sprints 6–10 will cover Playback, Library, Admin CMS, QA & DevOps, and Launch Prep.*
