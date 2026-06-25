# Seed Data Strategy

> **Milestone:** M2 — Catalog Browsable
> **Sprint:** S2 — Database Schema & Seed Data
> **Deliverable:** `seed-strategy.md`
> **Status:** Draft
> **Last Updated:** 2026-06-24

---

## 1. Purpose

This document defines the seed data strategy for the Nexus Anime platform. It specifies **what** data must exist for the application to function meaningfully after a fresh database deployment, **how** that data should be loaded, and **which environments** each seed category applies to.

Seed data falls into four categories:

| Category | Purpose | Environments |
|----------|---------|--------------|
| **Roles** | RBAC bootstrap — who can do what | All (local, staging, production) |
| **Genres** | Taxonomy for catalog browsing and filtering | All |
| **Admin User** | Initial superadmin for CMS access | Local + Staging only |
| **Sample Anime** | Demo content for UI development and QA | Local + Staging only |

---

## 2. Roles

### 2.1 Definition

The `user_role` PostgreSQL ENUM defines three roles:

| Role | Value | Description |
|------|-------|-------------|
| User | `user` | Default role. Can browse catalog, manage own watchlist, write reviews. |
| Admin | `admin` | Staff access. Can manage anime catalog, shelves, and user accounts via `/admin/*`. |
| Superadmin | `superadmin` | Full system access. Can manage admins, system configuration, and production settings. |

### 2.2 Seeding Strategy

Roles are **not seeded as data**. They are defined as a PostgreSQL ENUM type in migration `001_create_enum_types`. The ENUM values are baked into the schema itself — no `INSERT` is required.

```sql
-- Migration 001_create_enum_types
CREATE TYPE "user_role" AS ENUM ('user', 'admin', 'superadmin');
```

The **default value** for the `users.role` column is `user`, so new registrations automatically receive the correct role. The seed strategy only creates **user rows** with elevated roles (admin/superadmin) for bootstrapping access.

### 2.3 Role Assignment Mechanism

| Method | Use Case |
|--------|----------|
| `role: 'user'` (default) | Self-registration via Auth.js |
| `role: 'admin'` | Promoted by superadmin via CMS, or seeded for dev |
| `role: 'superadmin'` | Manually assigned via `pnpm db:seed` or direct SQL in production |

---

## 3. Genres

### 3.1 Seed Data

17 genre records required for catalog taxonomy:

| Slug | Display Name |
|------|--------------|
| `action` | Action |
| `adventure` | Adventure |
| `comedy` | Comedy |
| `drama` | Drama |
| `fantasy` | Fantasy |
| `horror` | Horror |
| `isekai` | Isekai |
| `mecha` | Mecha |
| `mystery` | Mystery |
| `psychological` | Psychological |
| `romance` | Romance |
| `sci-fi` | Sci-Fi |
| `slice-of-life` | Slice of Life |
| `sports` | Sports |
| `supernatural` | Supernatural |
| `thriller` | Thriller |
| `music` | Music |

### 3.2 Seeding Rules

- **Idempotent**: Use `ON CONFLICT (slug) DO NOTHING` or `skipDuplicates: true`.
- **Append-only in production**: Genres are reference data. Once deployed, new genres should be added via migration, not re-seeding.
- **Required for all environments**: Local, staging, and production all need genres populated.

### 3.3 Drizzle Seed Code

```typescript
// tooling/scripts/seed-catalog.ts
const genres = [
  { slug: 'action', name: 'Action' },
  { slug: 'adventure', name: 'Adventure' },
  { slug: 'comedy', name: 'Comedy' },
  { slug: 'drama', name: 'Drama' },
  { slug: 'fantasy', name: 'Fantasy' },
  { slug: 'horror', name: 'Horror' },
  { slug: 'isekai', name: 'Isekai' },
  { slug: 'mecha', name: 'Mecha' },
  { slug: 'mystery', name: 'Mystery' },
  { slug: 'psychological', name: 'Psychological' },
  { slug: 'romance', name: 'Romance' },
  { slug: 'sci-fi', name: 'Sci-Fi' },
  { slug: 'slice-of-life', name: 'Slice of Life' },
  { slug: 'sports', name: 'Sports' },
  { slug: 'supernatural', name: 'Supernatural' },
  { slug: 'thriller', name: 'Thriller' },
  { slug: 'music', name: 'Music' },
];

await db.insert(genres).values(genres).onConflictDoNothing();
```

---

## 4. Studios

### 4.1 Seed Data

10 studio records for reference table:

| Slug | Name |
|------|------|
| `kyoto-animation` | Kyoto Animation |
| `ufotable` | ufotable |
| `wit-studio` | WIT Studio |
| `mappa` | MAPPA |
| `bones` | Bones |
| `a-1-pictures` | A-1 Pictures |
| `trigger` | Studio Trigger |
| `madhouse` | Madhouse |
| `shaft` | SHAFT |
| `cloverworks` | CloverWorks |

### 4.2 Seeding Rules

- Same idempotency and append-only rules as genres.
- Studios are referenced by anime entries, so they must exist before sample anime can be seeded.

---

## 5. Shelves

### 5.1 Seed Data

5 curated shelf records powering the homepage:

| Key | Display Name | Sort Order |
|-----|--------------|------------|
| `hero` | Featured Hero | 0 |
| `trending` | Trending Now | 1 |
| `new_releases` | New Releases | 2 |
| `top_rated` | Top Rated | 3 |
| `staff_picks` | Staff Picks | 4 |

### 5.2 Seeding Rules

- Shelves are **always seeded** in all environments (including production) — they define homepage layout.
- `shelf_items` (the anime assigned to each shelf) are only seeded in local/staging.

---

## 6. Admin User

### 6.1 Seed Data

One superadmin user for initial CMS access:

| Field | Value |
|-------|-------|
| `email` | `dev@nexus-anime.local` |
| `name` | `Dev Admin` |
| `role` | `superadmin` |
| `email_verified` | `true` |
| `hashed_password` | bcrypt hash of `password123` (dev only) |

### 6.2 Seeding Rules

| Environment | Seed? | Notes |
|-------------|-------|-------|
| **Local** | Yes | Hardcoded credentials for fast iteration. |
| **Staging** | Yes | Credentials set via `SEED_ADMIN_PASSWORD` env var. |
| **Production** | **No** | Superadmin must be created manually or via a secure CI job. |

### 6.3 Security Considerations

- The seed script **must check** if the admin email already exists before inserting.
- In staging, the password **must** be provided via environment variable — never hardcode.
- In production, the seed script **must refuse** to create admin users. Use an explicit guard:

```typescript
if (process.env.NODE_ENV === 'production') {
  console.warn('Skipping admin user seed in production');
  return;
}
```

### 6.4 Drizzle Seed Code

```typescript
// tooling/scripts/seed-admin.ts
import { hash } from 'bcrypt';

async function seedAdmin() {
  if (process.env.NODE_ENV === 'production') {
    console.warn('Skipping admin user seed in production');
    return;
  }

  const email = 'dev@nexus-anime.local';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'password123';

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existing) {
    console.log('Admin user already exists, skipping.');
    return;
  }

  const hashedPassword = await hash(password, 12);

  await db.insert(users).values({
    email,
    name: 'Dev Admin',
    hashedPassword,
    role: 'superadmin',
    emailVerified: true,
  });

  console.log(`Admin user seeded: ${email}`);
}
```

---

## 7. Sample Anime

### 7.1 Seed Data

Minimum 5 anime entries with full metadata, assigned to genres and at least one shelf. These are **fictional or public-domain-inspired** titles to avoid licensing issues during development.

| # | Title | Type | Status | Year | Genres | Studio |
|---|-------|------|--------|------|--------|--------|
| 1 | *Starfall Chronicles* | TV | airing | 2025 | action, fantasy, mecha | bones |
| 2 | *Midnight Diner: Tokyo* | TV | finished | 2024 | slice-of-life, drama | kyoto-animation |
| 3 | *Velocity Rush* | TV | finished | 2024 | sports, action | mappa |
| 4 | *Whispers in the Dark* | Movie | upcoming | 2026 | horror, mystery, psychological | shaft |
| 5 | *Love in the Spring* | TV | finished | 2024 | romance, comedy | a-1-pictures |

### 7.2 Per-Anime Requirements

Each anime entry must include:

- **1 anime row** — full metadata (title, synopsis, type, status, year, episode count)
- **1+ season rows** — at least one season per anime
- **1+ episode rows** — at least 1-3 episodes per season (for playback testing)
- **1+ anime_genres rows** — linked to at least 2 genres each
- **1 studio reference** — linked to a seeded studio
- **1+ shelf_item rows** — at least 3 of the 5 anime appear on shelves

### 7.3 Seeding Rules

| Environment | Seed? | Notes |
|-------------|-------|-------|
| **Local** | Yes | Full dataset for UI development. |
| **Staging** | Yes | Full dataset for QA and demo. |
| **Production** | **No** | Real content ingested via CMS or content pipeline. |

### 7.4 Drizzle Seed Code (Sketch)

```typescript
// tooling/scripts/seed-catalog.ts (continued)
async function seedSampleAnime() {
  if (process.env.NODE_ENV === 'production') return;

  const sampleAnime = [
    {
      slug: 'starfall-chronicles',
      title: 'Starfall Chronicles',
      type: 'TV',
      status: 'airing',
      year: 2025,
      synopsis: 'In a dying galaxy, young pilots discover ancient mechs that hold the key to humanity\'s survival.',
      episodeCount: 12,
      genres: ['action', 'fantasy', 'mecha'],
      studioSlug: 'bones',
      shelves: ['hero', 'new_releases'],
    },
    // ... 4 more entries
  ];

  for (const anime of sampleAnime) {
    const [studio] = await db.query.studios.findFirst({
      where: eq(studios.slug, anime.studioSlug),
    });

    const [inserted] = await db.insert(anime).values({
      slug: anime.slug,
      title: anime.title,
      type: anime.type,
      status: anime.status,
      year: anime.year,
      synopsis: anime.synopsis,
      episodeCount: anime.episodeCount,
      studioId: studio.id,
    }).returning();

    // Link genres
    const genreRecords = await db.query.genres.findMany({
      where: inArray(genres.slug, anime.genres),
    });
    await db.insert(animeGenres).values(
      genreRecords.map(g => ({ animeId: inserted.id, genreId: g.id }))
    );

    // Link shelves
    const shelfRecords = await db.query.shelves.findMany({
      where: inArray(shelves.key, anime.shelves),
    });
    await db.insert(shelfItems).values(
      shelfRecords.map(s => ({
        shelfId: s.id,
        animeId: inserted.id,
        sortOrder: 0,
      }))
    );

    // Create season + episodes
    const [season] = await db.insert(seasons).values({
      animeId: inserted.id,
      number: 1,
      title: 'Season 1',
      episodeCount: 3,
    }).returning();

    await db.insert(episodes).values(
      [1, 2, 3].map(n => ({
        seasonId: season.id,
        number: n,
        title: `Episode ${n}`,
        durationMinutes: 24,
      }))
    );
  }
}
```

---

## 8. Seed Script Architecture

### 8.1 File Layout

```
tooling/scripts/
├── seed.ts              # Main entry — orchestrates all seeders
├── seed-catalog.ts      # Genres, studios, shelves (all envs)
├── seed-admin.ts        # Admin user (local + staging only)
├── seed-anime.ts        # Sample anime (local + staging only)
└── README.md
```

### 8.2 Execution Order

```
1. seed-catalog.ts    → genres, studios, shelves  (reference data)
2. seed-admin.ts      → admin user               (depends on: none, but needs schema)
3. seed-anime.ts      → sample anime              (depends on: genres, studios, shelves)
```

Order matters because anime references genres, studios, and shelves via foreign keys.

### 8.3 Package Scripts

```json
// package.json (root)
{
  "scripts": {
    "db:seed": "tsx tooling/scripts/seed.ts",
    "db:seed:catalog": "tsx tooling/scripts/seed-catalog.ts",
    "db:seed:admin": "tsx tooling/scripts/seed-admin.ts",
    "db:seed:anime": "tsx tooling/scripts/seed-anime.ts",
    "db:reset": "drizzle-kit drop && drizzle-kit generate && drizzle-kit migrate && pnpm db:seed"
  }
}
```

### 8.4 Idempotency Contract

Every seed function **must** be safe to run multiple times without creating duplicates:

| Strategy | Used For |
|----------|----------|
| `onConflictDoNothing()` | Genres, studios, shelves (have unique slugs/keys) |
| `SELECT → INSERT if not found` | Admin user (check by email) |
| `SELECT → INSERT if not found` | Anime (check by slug) |
| Truncate + re-insert | Shelf items (order-sensitive, small dataset) |

---

## 9. Environment Matrix

| Data | Local | Staging | Production |
|------|:-----:|:-------:|:----------:|
| ENUM types (roles) | Migration | Migration | Migration |
| Genres (17) | Seed | Seed | Seed |
| Studios (10) | Seed | Seed | Seed |
| Shelves (5) | Seed | Seed | Seed |
| Shelf items | Seed | Seed | **No** |
| Admin user | Seed | Seed (env var password) | **No** |
| Sample anime (5) | Seed | Seed | **No** |

---

## 10. Verification Checklist

After running `pnpm db:seed`, verify:

- [ ] `SELECT count(*) FROM genres = 17`
- [ ] `SELECT count(*) FROM studios = 10`
- [ ] `SELECT count(*) FROM shelves = 5`
- [ ] `SELECT count(*) FROM users WHERE role = 'superadmin' = 1`
- [ ] `SELECT count(*) FROM anime >= 5`
- [ ] `SELECT count(*) FROM anime_genres >= 10` (each anime has 2+ genres)
- [ ] `SELECT count(*) FROM shelf_items >= 3`
- [ ] `SELECT count(*) FROM seasons >= 5`
- [ ] `SELECT count(*) FROM episodes >= 5`
- [ ] Admin user can log in at `/admin` with seeded credentials
- [ ] Homepage renders all 5 shelves with content
- [ ] Genre filter on catalog page returns results

---

## 11. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Seed script fails mid-transaction | Partial data, FK violations | Wrap each seeder in a transaction; use `db.transaction()` |
| Admin credentials leaked in production | Unauthorized CMS access | Guard with `NODE_ENV` check; never seed admin in production |
| Re-seeding creates duplicates | Data inconsistency, UI glitches | All seeders use `onConflictDoNothing` or pre-check |
| Sample anime references missing genres | FK constraint failure | Seed order enforced; genres must exist before anime |
| Password stored in source control | Credential exposure | Staging reads from `SEED_ADMIN_PASSWORD` env var; local uses known dev value |

---

## 12. Future Considerations

- **Content ingestion pipeline** (S3+) will replace sample anime in production.
- **Genre i18n** — display names may need translation tables in M3+.
- **Studio metadata** — logo URLs, descriptions may be added when CMS is built.
- **Bulk seeding** — for load testing, a separate `tooling/scripts/seed-load-test.ts` may generate 10K+ anime entries.
