# M2.3 — Prisma Schema Specification

> **Scope:** This document defines the **complete Prisma schema for Nexus Anime** as the ORM-layer representation of the database design delivered under M2.2. All models, enums, relationships, indexes, and constraints are expressed in Prisma Schema Language (PSL) and map 1:1 to the SQL schema defined in `database-design.md`.

> **Status:** Draft — Pending Review
> **Date:** 2026-06-23
> **Author:** Tech Lead
> **Milestone:** M2 (Sprints 2–3)
> **Prisma Version:** 6.x
> **Database Provider:** PostgreSQL 16

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [Prisma Schema (Full PSL)](#2-prisma-schema-full-psl)
3. [Enum Definitions](#3-enum-definitions)
4. [Model Definitions & Property Mapping](#4-model-definitions--property-mapping)
5. [Relationships](#5-relationships)
6. [Indexes](#6-indexes)
7. [Constraints](#7-constraints)
8. [Differences from Drizzle Implementation](#8-differences-from-drizzle-implementation)
9. [Migration Strategy](#9-migration-strategy)
10. [TypeScript Type Generation](#10-typescript-type-generation)
11. [Seed Mapping](#11-seed-mapping)

---

## 1. Design Principles

| Principle | Prisma Equivalent |
|-----------|-------------------|
| UUID primary keys | `id String @id @default(uuid())` |
| Timestamps | `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt` |
| Soft deletes | `deletedAt DateTime?` (nullable) |
| Snake_case DB columns | `@map("column_name")` on each field |
| Singular table names | Prisma model names use PascalCase; `@map("table_name")` sets the DB name |
| Cascading deletes | `onDelete: Cascade` on relation scalars |
| Full-text search | Unsupported natively in Prisma Unsupported("tsvector") with raw SQL index |
| EN Prisma enums | Native `enum` where PostgreSQL ENUM is used; `@map` not needed |

### 1.1 Naming Convention

| Layer | Convention | Example |
|-------|-----------|---------|
| Prisma model | PascalCase | `model UserProfile` |
| DB table | snake_case | `@map("user_profiles")` |
| Prisma field | camelCase | `avatarUrl` |
| DB column | snake_case | `@map("avatar_url")` |
| Enum name | PascalCase | `enum UserRole` |
| Enum value | UPPER_SNAKE (DB) / camelCase (Prisma) | `User` @map("user") |

---

## 2. Prisma Schema (Full PSL)

```prisma
// Prisma Schema for Nexus Anime
// Generated from M2.2 Database Design specification
// Provider: PostgreSQL 16

generator client {
  provider = "prisma-client-js"
  output   = "../packages/db/src/generated/client"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Enums ──────────────────────────────────────────────────────────────────

enum UserRole {
  user
  admin
  superadmin
}

enum AnimeType {
  TV
  OVA
  ONA
  Movie
  Special
}

enum AnimeStatus {
  airing
  finished
  upcoming
}

enum WatchlistStatus {
  plan_to_watch
  watching
  completed
  dropped
  on_hold
}

enum ReviewStatus {
  published
  draft
  hidden
}

enum SubscriptionStatus {
  active
  past_due
  canceled
  unpaid
  trialing
}

enum NotificationType {
  system
  episode
  social
  promo
}

// ─── Core Identity ─────────────────────────────────────────────────────────

model User {
  id             String    @id @default(uuid()) @map("id")
  email          String    @unique @map("email")
  name           String    @default("") @map("name")
  image          String?   @map("image")
  hashedPassword String?   @map("hashed_password")
  role           UserRole  @default(user) @map("role")
  emailVerified  DateTime? @map("email_verified")
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  // Relations
  profile       UserProfile?
  preferences   UserPreferences?
  subscription  Subscription?
  watchHistory  WatchHistory[]
  watchlists    Watchlist[]
  favorites     Favorite[]
  reviews       Review[]
  ratings       Rating[]
  comments      Comment[]
  notifications Notification[]

  @@map("users")
}

model UserProfile {
  id          String   @id @default(uuid()) @map("id")
  userId      String   @unique @map("user_id")
  bio         String?  @map("bio")
  avatarUrl   String?  @map("avatar_url")
  website     String?  @map("website")
  location    String?  @map("location")
  dateOfBirth DateTime? @map("date_of_birth")
  socialLinks Json?    @map("social_links")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_profiles")
}

model UserPreferences {
  id                String   @id @default(uuid()) @map("id")
  userId            String   @unique @map("user_id")
  playbackQuality   String   @default("auto") @map("playback_quality")
  subtitleLanguage  String?  @default("en") @map("subtitle_language")
  autoplay          Boolean  @default(true) @map("autoplay")
  skipIntro         Boolean  @default(false) @map("skip_intro")
  theme             String   @default("dark") @map("theme")
  language          String   @default("en") @map("language")
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_preferences")
}

// ─── Content Hierarchy ─────────────────────────────────────────────────────

model Anime {
  id               String      @id @default(uuid()) @map("id")
  slug             String      @unique @map("slug")
  title            String      @map("title")
  titleJp          String?     @map("title_jp")
  synopsis         String?     @map("synopsis")
  coverImageUrl    String?     @map("cover_image_url")
  bannerImageUrl   String?     @map("banner_image_url")
  type             AnimeType?  @map("type")
  status           AnimeStatus? @map("status")
  totalEpisodes    Int?        @map("total_episodes")
  durationMinutes  Int?        @map("duration_minutes")
  startDate        DateTime?   @map("start_date")
  endDate          DateTime?   @map("end_date")
  score            Decimal?    @map("score")
  popularityRank   Int?        @map("popularity_rank")
  studioId         String?     @map("studio_id")
  searchVector     Unsupported("tsvector")? @map("search_vector")
  createdAt        DateTime    @default(now()) @map("created_at")
  updatedAt        DateTime    @updatedAt @map("updated_at")
  deletedAt        DateTime?   @map("deleted_at")

  // Relations
  studio       Studio?       @relation(fields: [studioId], references: [id], onDelete: SetNull)
  seasons      Season[]
  animeGenres  AnimeGenre[]
  watchlists   Watchlist[]
  favorites    Favorite[]
  reviews      Review[]
  ratings      Rating[]
  shelfItems   ShelfItem[]

  @@index([slug])
  @@index([studioId])
  @@index([status])
  @@index([type])
  @@index([score(sort: Desc)])
  @@index([popularityRank])
  @@index([deletedAt])
  @@map("anime")
}

model Season {
  id           String    @id @default(uuid()) @map("id")
  animeId      String    @map("anime_id")
  seasonNumber Int       @map("season_number")
  title        String?   @map("title")
  synopsis     String?   @map("synopsis")
  startDate    DateTime? @map("start_date")
  endDate      DateTime? @map("end_date")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")
  deletedAt    DateTime? @map("deleted_at")

  // Relations
  anime   Anime     @relation(fields: [animeId], references: [id], onDelete: Cascade)
  episodes Episode[]

  @@unique([animeId, seasonNumber])
  @@index([animeId])
  @@map("seasons")
}

model Episode {
  id              String    @id @default(uuid()) @map("id")
  seasonId        String    @map("season_id")
  episodeNumber    Int       @map("episode_number")
  title           String?   @map("title")
  synopsis        String?   @map("synopsis")
  durationSeconds Int?      @map("duration_seconds")
  airDate         DateTime? @map("air_date")
  isFiller        Boolean   @default(false) @map("is_filler")
  thumbnailUrl    String?   @map("thumbnail_url")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")
  deletedAt       DateTime? @map("deleted_at")

  // Relations
  season       Season        @relation(fields: [seasonId], references: [id], onDelete: Cascade)
  streamAssets StreamAsset[]
  watchHistory WatchHistory[]

  @@unique([seasonId, episodeNumber])
  @@index([seasonId])
  @@index([airDate])
  @@map("episodes")
}

model StreamAsset {
  id             String   @id @default(uuid()) @map("id")
  episodeId      String   @map("episode_id")
  manifestUrl    String   @map("manifest_url")
  subtitleUrl    String?  @map("subtitle_url")
  bitrate        Int?     @map("bitrate")
  resolution     String?  @map("resolution")
  codec          String?  @map("codec")
  fileSizeBytes  Int?     @map("file_size_bytes")
  expiresAt      DateTime @map("expires_at")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  // Relations
  episode Episode @relation(fields: [episodeId], references: [id], onDelete: Cascade)

  @@index([episodeId])
  @@index([expiresAt])
  @@map("stream_assets")
}

// ─── Taxonomy ──────────────────────────────────────────────────────────────

model Genre {
  id          String   @id @default(uuid()) @map("id")
  slug        String   @unique @map("slug")
  name        String   @map("name")
  description String?  @map("description")
  iconUrl     String?  @map("icon_url")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  // Relations
  animeGenres AnimeGenre[]

  @@index([slug])
  @@map("genres")
}

model Studio {
  id           String    @id @default(uuid()) @map("id")
  slug         String    @unique @map("slug")
  name         String    @map("name")
  description  String?   @map("description")
  logoUrl      String?   @map("logo_url")
  website      String?   @map("website")
  foundedDate  DateTime? @map("founded_date")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  // Relations
  anime Anime[]

  @@index([slug])
  @@map("studios")
}

/// Junction table for many-to-many relationship between Anime and Genre.
model AnimeGenre {
  animeId String @map("anime_id")
  genreId String @map("genre_id")

  // Relations
  anime Anime @relation(fields: [animeId], references: [id], onDelete: Cascade)
  genre Genre @relation(fields: [genreId], references: [id], onDelete: Cascade)

  @@id([animeId, genreId])
  @@index([genreId])
  @@map("anime_genres")
}

// ─── Engagement ────────────────────────────────────────────────────────────

model WatchHistory {
  id              String   @id @default(uuid()) @map("id")
  userId          String   @map("user_id")
  episodeId       String   @map("episode_id")
  positionSeconds Int      @default(0) @map("position_seconds")
  durationSeconds Int?     @map("duration_seconds")
  completionPct   Decimal? @map("completion_pct")
  watchedAt       DateTime @default(now()) @map("watched_at")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  // Relations
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  episode Episode @relation(fields: [episodeId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([episodeId])
  @@index([watchedAt(sort: Desc)])
  @@index([userId, episodeId])
  @@map("watch_history")
}

model Watchlist {
  id              String          @id @default(uuid()) @map("id")
  userId          String          @map("user_id")
  animeId         String          @map("anime_id")
  status          WatchlistStatus @default(plan_to_watch) @map("status")
  episodesWatched Int             @default(0) @map("episodes_watched")
  priority        Int             @default(0) @map("priority")
  notes           String?         @map("notes")
  createdAt       DateTime        @default(now()) @map("created_at")
  updatedAt       DateTime        @updatedAt @map("updated_at")

  // Relations
  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  anime Anime @relation(fields: [animeId], references: [id], onDelete: Cascade)

  @@unique([userId, animeId])
  @@index([userId])
  @@index([animeId])
  @@index([status])
  @@index([userId, status])
  @@map("watchlists")
}

model Favorite {
  id        String   @id @default(uuid()) @map("id")
  userId    String   @map("user_id")
  animeId   String   @map("anime_id")
  createdAt DateTime @default(now()) @map("created_at")

  // Relations
  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  anime Anime @relation(fields: [animeId], references: [id], onDelete: Cascade)

  @@unique([userId, animeId])
  @@index([userId])
  @@index([animeId])
  @@map("favorites")
}

// ─── Social ────────────────────────────────────────────────────────────────

model Review {
  id           String        @id @default(uuid()) @map("id")
  userId       String        @map("user_id")
  animeId      String        @map("anime_id")
  title        String?       @map("title")
  body         String        @map("body")
  isSpoiler    Boolean       @default(false) @map("is_spoiler")
  helpfulCount Int           @default(0) @map("helpful_count")
  status       ReviewStatus  @default(published) @map("status")
  createdAt    DateTime      @default(now()) @map("created_at")
  updatedAt    DateTime      @updatedAt @map("updated_at")
  deletedAt    DateTime?     @map("deleted_at")

  // Relations
  user    User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  anime   Anime    @relation(fields: [animeId], references: [id], onDelete: Cascade)
  comments Comment[]

  @@unique([userId, animeId])
  @@index([userId])
  @@index([animeId])
  @@index([status])
  @@index([createdAt(sort: Desc)])
  @@map("reviews")
}

model Rating {
  id        String   @id @default(uuid()) @map("id")
  userId    String   @map("user_id")
  animeId   String   @map("anime_id")
  score     Int      @map("score")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relations
  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  anime Anime @relation(fields: [animeId], references: [id], onDelete: Cascade)

  @@unique([userId, animeId])
  @@index([userId])
  @@index([animeId])
  @@map("ratings")
}

model Comment {
  id              String    @id @default(uuid()) @map("id")
  userId          String    @map("user_id")
  reviewId        String    @map("review_id")
  parentCommentId String?   @map("parent_comment_id")
  body            String    @map("body")
  likesCount      Int       @default(0) @map("likes_count")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")
  deletedAt       DateTime? @map("deleted_at")

  // Relations
  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  review       Review    @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  parentComment Comment?  @relation("CommentReplies", fields: [parentCommentId], references: [id], onDelete: Cascade)
  replies      Comment[] @relation("CommentReplies")

  @@index([reviewId])
  @@index([parentCommentId])
  @@index([userId])
  @@map("comments")
}

// ─── System ────────────────────────────────────────────────────────────────

model Subscription {
  id                    String             @id @default(uuid()) @map("id")
  userId                String             @map("user_id")
  stripeCustomerId      String             @unique @map("stripe_customer_id")
  stripeSubscriptionId  String?            @unique @map("stripe_subscription_id")
  status                SubscriptionStatus @default(trialing) @map("status")
  currentPeriodStart    DateTime?          @map("current_period_start")
  currentPeriodEnd      DateTime?          @map("current_period_end")
  cancelAtPeriodEnd   Boolean            @default(false) @map("cancel_at_period_end")
  createdAt            DateTime           @default(now()) @map("created_at")
  updatedAt            DateTime           @updatedAt @map("updated_at")

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([stripeCustomerId])
  @@index([stripeSubscriptionId])
  @@index([status])
  @@map("subscriptions")
}

model Notification {
  id         String           @id @default(uuid()) @map("id")
  userId     String           @map("user_id")
  title      String           @map("title")
  body       String?          @map("body")
  type       NotificationType @default(system) @map("type")
  isRead     Boolean          @default(false) @map("is_read")
  actionUrl  String?          @map("action_url")
  createdAt  DateTime         @default(now()) @map("created_at")
  updatedAt  DateTime         @updatedAt @map("updated_at")

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userId, isRead])
  @@index([createdAt(sort: Desc)])
  @@map("notifications")
}

// ─── Curation ──────────────────────────────────────────────────────────────

model Shelf {
  id          String   @id @default(uuid()) @map("id")
  key         String   @unique @map("key")
  name        String   @map("name")
  description String?  @map("description")
  iconUrl     String?  @map("icon_url")
  sortOrder   Int      @default(0) @map("sort_order")
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  // Relations
  items ShelfItem[]

  @@index([key])
  @@index([isActive])
  @@map("shelves")
}

model ShelfItem {
  id        String   @id @default(uuid()) @map("id")
  shelfId   String   @map("shelf_id")
  animeId   String   @map("anime_id")
  position  Int      @default(0) @map("position")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relations
  shelf Shelf @relation(fields: [shelfId], references: [id], onDelete: Cascade)
  anime Anime @relation(fields: [animeId], references: [id], onDelete: Cascade)

  @@unique([shelfId, animeId])
  @@index([shelfId])
  @@index([animeId])
  @@index([shelfId, position])
  @@map("shelf_items")
}
```

---

## 3. Enum Definitions

All PostgreSQL ENUM types are mapped to Prisma's native `enum` construct. Prisma creates the PostgreSQL ENUM type automatically during migration.

| Prisma Enum | DB Type | Values |
|-------------|---------|--------|
| `UserRole` | `user_role` | `user`, `admin`, `superadmin` |
| `AnimeType` | `anime_type` | `TV`, `OVA`, `ONA`, `Movie`, `Special` |
| `AnimeStatus` | `anime_status` | `airing`, `finished`, `upcoming` |
| `WatchlistStatus` | `watchlist_status` | `plan_to_watch`, `watching`, `completed`, `dropped`, `on_hold` |
| `ReviewStatus` | `review_status` | `published`, `draft`, `hidden` |
| `SubscriptionStatus` | `subscription_status` | `active`, `past_due`, `canceled`, `unpaid`, `trialing` |
| `NotificationType` | `notification_type` | `system`, `episode`, `social`, `promo` |

> **Note:** Enum values in Prisma default to the identifier as-is. If the DB values differ from the Prisma identifiers, use `@map("value")` on each member. In this schema, Prisma's default camelCase matches the snake_case DB values only where specified — verify alignment with your migration tooling.

---

## 4. Model Definitions & Property Mapping

### 4.1 Users & Profiles

| Model | DB Table | Prisma Model | Fields |
|-------|----------|-------------|--------|
| `User` | `users` | `User` | 8 |
| `UserProfile` | `user_profiles` | `UserProfile` | 9 |
| `UserPreferences` | `user_preferences` | `UserPreferences` | 9 |

**Type Mappings (Prisma → PostgreSQL):**

| Prisma Type | PostgreSQL Type | Notes |
|-------------|----------------|-------|
| `String` | `varchar(255)` | Length constraints lost in Prisma; enforce via application logic |
| `String?` | `varchar(255) NULL` | Nullable string |
| `String` (unique) | `varchar(255) UNIQUE` | `@@unique` or `@unique` |
| `Int` | `integer` | 32-bit integer |
| `Int?` | `integer NULL` | Nullable integer |
| `Boolean` | `boolean` | Native boolean |
| `DateTime` | `timestamptz` | With timezone |
| `DateTime?` | `timestamptz NULL` | Nullable timestamp |
| `Decimal` | `decimal(4,2)` | Precision/scale not expressed in Prisma |
| `Decimal?` | `decimal(4,2) NULL` | Nullable decimal |
| `Json` | `jsonb` | Native JSONB |
| `Unsupported("tsvector")` | `tsvector` | Prisma limitation — see §8 |

### 4.2 Content Hierarchy

| Model | DB Table | Prisma Model | Fields |
|-------|----------|-------------|--------|
| `Anime` | `anime` | `Anime` | 17 |
| `Season` | `seasons` | `Season` | 10 |
| `Episode` | `episodes` | `Episode` | 12 |
| `StreamAsset` | `stream_assets` | `StreamAsset` | 10 |

### 4.3 Taxonomy

| Model | DB Table | Prisma Model | Fields |
|-------|----------|-------------|--------|
| `Genre` | `genres` | `Genre` | 6 |
| `Studio` | `studios` | `Studio` | 8 |
| `AnimeGenre` | `anime_genres` | `AnimeGenre` | 2 (composite PK) |

### 4.4 Engagement

| Model | DB Table | Prisma Model | Fields |
|-------|----------|-------------|--------|
| `WatchHistory` | `watch_history` | `WatchHistory` | 9 |
| `Watchlist` | `watchlists` | `Watchlist` | 9 |
| `Favorite` | `favorites` | `Favorite` | 4 |

### 4.5 Social

| Model | DB Table | Prisma Model | Fields |
|-------|----------|-------------|--------|
| `Review` | `reviews` | `Review` | 10 |
| `Rating` | `ratings` | `Rating` | 5 |
| `Comment` | `comments` | `Comment` | 9 |

### 4.6 System

| Model | DB Table | Prisma Model | Fields |
|-------|----------|-------------|--------|
| `Subscription` | `subscriptions` | `Subscription` | 10 |
| `Notification` | `notifications` | `Notification` | 8 |

### 4.7 Curation

| Model | DB Table | Prisma Model | Fields |
|-------|----------|-------------|--------|
| `Shelf` | `shelves` | `Shelf` | 8 |
| `ShelfItem` | `shelf_items` | `ShelfItem` | 6 |

---

## 5. Relationships

### 5.1 Relationship Matrix

| Parent Model | Child Model | Cardinality | FK Field | On Delete | Relation Type |
|-------------|-------------|-------------|----------|-----------|---------------|
| `User` | `UserProfile` | 1:1 | `UserProfile.userId` | Cascade | Required scalar |
| `User` | `UserPreferences` | 1:1 | `UserPreferences.userId` | Cascade | Required scalar |
| `User` | `Subscription` | 1:1 | `Subscription.userId` | Cascade | Required scalar |
| `User` | `WatchHistory` | 1:N | `WatchHistory.userId` | Cascade | Scalar list |
| `User` | `Watchlist` | 1:N | `Watchlist.userId` | Cascade | Scalar list |
| `User` | `Favorite` | 1:N | `Favorite.userId` | Cascade | Scalar list |
| `User` | `Review` | 1:N | `Review.userId` | Cascade | Scalar list |
| `User` | `Rating` | 1:N | `Rating.userId` | Cascade | Scalar list |
| `User` | `Comment` | 1:N | `Comment.userId` | Cascade | Scalar list |
| `User` | `Notification` | 1:N | `Notification.userId` | Cascade | Scalar list |
| `Anime` | `Season` | 1:N | `Season.animeId` | Cascade | Scalar list |
| `Anime` | `AnimeGenre` | M:N | `AnimeGenre.animeId` | Cascade | Implicit junction |
| `Anime` | `Watchlist` | 1:N | `Watchlist.animeId` | Cascade | Scalar list |
| `Anime` | `Favorite` | 1:N | `Favorite.animeId` | Cascade | Scalar list |
| `Anime` | `Review` | 1:N | `Review.animeId` | Cascade | Scalar list |
| `Anime` | `Rating` | 1:N | `Rating.animeId` | Cascade | Scalar list |
| `Anime` | `ShelfItem` | 1:N | `ShelfItem.animeId` | Cascade | Scalar list |
| `Anime` | `Studio` | N:1 | `Anime.studioId` | SetNull | Optional scalar |
| `Season` | `Episode` | 1:N | `Episode.seasonId` | Cascade | Scalar list |
| `Episode` | `StreamAsset` | 1:N | `StreamAsset.episodeId` | Cascade | Scalar list |
| `Episode` | `WatchHistory` | 1:N | `WatchHistory.episodeId` | Cascade | Scalar list |
| `Genre` | `AnimeGenre` | M:N | `AnimeGenre.genreId` | Cascade | Implicit junction |
| `Review` | `Comment` | 1:N | `Comment.reviewId` | Cascade | Scalar list |
| `Comment` | `Comment` | 1:N (self) | `Comment.parentCommentId` | Cascade | Self-relation |
| `Shelf` | `ShelfItem` | 1:N | `ShelfItem.shelfId` | Cascade | Scalar list |

### 5.2 Self-Referencing Relation (Comment Replies)

Prisma requires explicit relation naming for self-references:

```prisma
model Comment {
  parentCommentId String?
  parentComment Comment?  @relation("CommentReplies", fields: [parentCommentId], references: [id], onDelete: Cascade)
  replies      Comment[] @relation("CommentReplies")
}
```

The relation is named `"CommentReplies"` to disambiguate the two sides.

### 5.3 Many-to-Many (Anime ↔ Genre)

Prisma supports implicit M:N via a junction model when both sides have scalar lists pointing to the junction. The `AnimeGenre` model uses `@@id([animeId, genreId])` as its composite primary key.

---

## 6. Indexes

### 6.1 Inline Indexes (defined in model blocks)

| Model | Index | Columns | Type | Notes |
|-------|-------|---------|------|-------|
| `Anime` | `@@index([slug])` | `slug` | B-tree | Unique lookup |
| `Anime` | `@@index([studioId])` | `studio_id` | B-tree | FK index |
| `Anime` | `@@index([status])` | `status` | B-tree | Filter |
| `Anime` | `@@index([type])` | `type` | B-tree | Filter |
| `Anime` | `@@index([score(sort: Desc)])` | `score DESC` | B-tree | Sort |
| `Anime` | `@@index([popularityRank])` | `popularity_rank` | B-tree | Sort |
| `Anime` | `@@index([deletedAt])` | `deleted_at` | B-tree | Partial (see raw SQL) |
| `Season` | `@@index([animeId])` | `anime_id` | B-tree | FK index |
| `Episode` | `@@index([seasonId])` | `season_id` | B-tree | FK index |
| `Episode` | `@@index([airDate])` | `air_date` | B-tree | Sort |
| `StreamAsset` | `@@index([episodeId])` | `episode_id` | B-tree | FK index |
| `StreamAsset` | `@@index([expiresAt])` | `expires_at` | B-tree | TTL cleanup |
| `Genre` | `@@index([slug])` | `slug` | B-tree | Unique lookup |
| `Studio` | `@@index([slug])` | `slug` | B-tree | Unique lookup |
| `AnimeGenre` | `@@index([genreId])` | `genre_id` | B-tree | FK index |
| `WatchHistory` | `@@index([userId])` | `user_id` | B-tree | FK index |
| `WatchHistory` | `@@index([episodeId])` | `episode_id` | B-tree | FK index |
| `WatchHistory` | `@@index([watchedAt(sort: Desc)])` | `watched_at DESC` | B-tree | Sort |
| `WatchHistory` | `@@index([userId, episodeId])` | `user_id, episode_id` | B-tree (composite) | Continue-watching lookup |
| `Watchlist` | `@@index([userId])` | `user_id` | B-tree | FK index |
| `Watchlist` | `@@index([animeId])` | `anime_id` | B-tree | FK index |
| `Watchlist` | `@@index([status])` | `status` | B-tree | Filter |
| `Watchlist` | `@@index([userId, status])` | `user_id, status` | B-tree (composite) | Filter by status |
| `Favorite` | `@@index([userId])` | `user_id` | B-tree | FK index |
| `Favorite` | `@@index([animeId])` | `anime_id` | B-tree | FK index |
| `Review` | `@@index([userId])` | `user_id` | B-tree | FK index |
| `Review` | `@@index([animeId])` | `anime_id` | B-tree | FK index |
| `Review` | `@@index([status])` | `status` | B-tree | Filter |
| `Review` | `@@index([createdAt(sort: Desc)])` | `created_at DESC` | B-tree | Sort |
| `Rating` | `@@index([userId])` | `user_id` | B-tree | FK index |
| `Rating` | `@@index([animeId])` | `anime_id` | B-tree | FK index |
| `Comment` | `@@index([reviewId])` | `review_id` | B-tree | FK index |
| `Comment` | `@@index([parentCommentId])` | `parent_comment_id` | B-tree | Partial (see raw SQL) |
| `Comment` | `@@index([userId])` | `user_id` | B-tree | FK index |
| `Subscription` | `@@index([userId])` | `user_id` | B-tree | FK index |
| `Subscription` | `@@index([stripeCustomerId])` | `stripe_customer_id` | B-tree | Lookup |
| `Subscription` | `@@index([stripeSubscriptionId])` | `stripe_subscription_id` | B-tree | Lookup |
| `Subscription` | `@@index([status])` | `status` | B-tree | Filter |
| `Notification` | `@@index([userId])` | `user_id` | B-tree | FK index |
| `Notification` | `@@index([userId, isRead])` | `user_id, is_read` | B-tree (composite) | Unread count |
| `Notification` | `@@index([createdAt(sort: Desc)])` | `created_at DESC` | B-tree | Sort |
| `Shelf` | `@@index([key])` | `key` | B-tree | Unique lookup |
| `Shelf` | `@@index([isActive])` | `is_active` | B-tree | Partial (see raw SQL) |
| `ShelfItem` | `@@index([shelfId])` | `shelf_id` | B-tree | FK index |
| `ShelfItem` | `@@index([animeId])` | `anime_id` | B-tree | FK index |
| `ShelfItem` | `@@index([shelfId, position])` | `shelf_id, position` | B-tree (composite) | Ordered retrieval |

### 6.2 Indexes Requiring Raw SQL

Prisma does not support partial indexes or GIN indexes natively. These must be added via `$executeRaw` in a migration:

```sql
-- Partial index: exclude soft-deleted anime
CREATE INDEX "idx_anime_deleted_at" ON "anime" ("deleted_at") WHERE "deleted_at" IS NULL;

-- GIN index: full-text search on anime
CREATE INDEX "idx_anime_search" ON "anime" USING gin("search_vector");

-- Partial index: only non-null parent_comment_id (for reply lookups)
CREATE INDEX "idx_comments_parent_id" ON "comments" ("parent_comment_id") WHERE "parent_comment_id" IS NOT NULL;

-- Partial index: only active shelves
CREATE INDEX "idx_shelves_active" ON "shelves" ("is_active") WHERE "is_active" = true;
```

---

## 7. Constraints

### 7.1 Primary Keys

All models use `@id @default(uuid())` which maps to `PRIMARY KEY DEFAULT gen_random_uuid()` in PostgreSQL.

| Model | PK Column | Type |
|-------|-----------|------|
| All models | `id` | `String` (UUID) |
| `AnimeGenre` | `@@id([animeId, genreId])` | Composite |

### 7.2 Unique Constraints

| Model | Unique Field(s) | DB Constraint |
|-------|----------------|---------------|
| `User` | `email` | `UNIQUE NOT NULL` |
| `UserProfile` | `userId` | `UNIQUE NOT NULL` |
| `UserPreferences` | `userId` | `UNIQUE NOT NULL` |
| `Anime` | `slug` | `UNIQUE NOT NULL` |
| `Season` | `@@unique([animeId, seasonNumber])` | Composite unique |
| `Episode` | `@@unique([seasonId, episodeNumber])` | Composite unique |
| `Genre` | `slug` | `UNIQUE NOT NULL` |
| `Studio` | `slug` | `UNIQUE NOT NULL` |
| `Watchlist` | `@@unique([userId, animeId])` | One entry per user per anime |
| `Favorite` | `@@unique([userId, animeId])` | One favorite per user per anime |
| `Review` | `@@unique([userId, animeId])` | One review per user per anime |
| `Rating` | `@@unique([userId, animeId])` | One rating per user per anime |
| `Subscription` | `stripeCustomerId` | `UNIQUE NOT NULL` |
| `Subscription` | `stripeSubscriptionId` | `UNIQUE` |
| `Shelf` | `key` | `UNIQUE NOT NULL` |
| `ShelfItem` | `@@unique([shelfId, animeId])` | One anime per shelf |

### 7.3 CHECK Constraints

Prisma does not support CHECK constraints natively in the schema definition. These must be enforced via application logic (Zod validation) or raw SQL in migrations:

```sql
-- anime.total_episodes >= 0
ALTER TABLE "anime" ADD CONSTRAINT "anime_total_episodes_check" CHECK ("total_episodes" >= 0);

-- anime.score BETWEEN 0 AND 10
ALTER TABLE "anime" ADD CONSTRAINT "anime_score_check" CHECK ("score" >= 0 AND "score" <= 10);

-- seasons.season_number >= 1
ALTER TABLE "seasons" ADD CONSTRAINT "seasons_number_check" CHECK ("season_number" >= 1);

-- episodes.episode_number >= 0
ALTER TABLE "episodes" ADD CONSTRAINT "episodes_number_check" CHECK ("episode_number" >= 0);

-- watchlists.episodes_watched >= 0
ALTER TABLE "watchlists" ADD CONSTRAINT "watchlists_episodes_check" CHECK ("episodes_watched" >= 0);

-- watch_history.completion_pct BETWEEN 0 AND 100
ALTER TABLE "watch_history" ADD CONSTRAINT "watch_history_completion_check" CHECK ("completion_pct" >= 0 AND "completion_pct" <= 100);

-- ratings.score BETWEEN 1 AND 10
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_score_check" CHECK ("score" >= 1 AND "score" <= 10);
```

### 7.4 Default Values

| Model | Field | Default | Prisma Expression |
|-------|-------|---------|-------------------|
| `User` | `name` | `""` | `@default("")` |
| `User` | `role` | `user` | `@default(user)` |
| `UserPreferences` | `playbackQuality` | `auto` | `@default("auto")` |
| `UserPreferences` | `subtitleLanguage` | `en` | `@default("en")` |
| `UserPreferences` | `autoplay` | `true` | `@default(true)` |
| `UserPreferences` | `skipIntro` | `false` | `@default(false)` |
| `UserPreferences` | `theme` | `dark` | `@default("dark")` |
| `UserPreferences` | `language` | `en` | `@default("en")` |
| `Episode` | `isFiller` | `false` | `@default(false)` |
| `WatchHistory` | `positionSeconds` | `0` | `@default(0)` |
| `Watchlist` | `status` | `plan_to_watch` | `@default(plan_to_watch)` |
| `Watchlist` | `episodesWatched` | `0` | `@default(0)` |
| `Watchlist` | `priority` | `0` | `@default(0)` |
| `Review` | `isSpoiler` | `false` | `@default(false)` |
| `Review` | `helpfulCount` | `0` | `@default(0)` |
| `Review` | `status` | `published` | `@default(published)` |
| `Comment` | `likesCount` | `0` | `@default(0)` |
| `Subscription` | `status` | `trialing` | `@default(trialing)` |
| `Subscription` | `cancelAtPeriodEnd` | `false` | `@default(false)` |
| `Notification` | `type` | `system` | `@default(system)` |
| `Notification` | `isRead` | `false` | `@default(false)` |
| `Shelf` | `sortOrder` | `0` | `@default(0)` |
| `Shelf` | `isActive` | `true` | `@default(true)` |
| `ShelfItem` | `position` | `0` | `@default(0)` |

---

## 8. Differences from Drizzle Implementation

The project's architecture document (`backend-architecture.md`) specifies Drizzle ORM. This Prisma specification is provided as an alternative ORM mapping. Key differences:

| Aspect | Drizzle (planned) | Prisma (this spec) |
|--------|-------------------|---------------------|
| Schema definition | TypeScript `pgTable()` | Prisma Schema Language (PSL) |
| Type inference | From TS schema types | Generated `PrismaClient` |
| Migrations | `drizzle-kit generate` | `prisma migrate dev` |
| Raw SQL escape hatch | `sql\`...\`` template | `$queryRaw` / `$executeRaw` |
| Composite PKs | `pk({ columns: [...] })` | `@@id([...])` |
| Partial indexes | Native in `index().where()` | Requires raw SQL |
| GIN indexes | Native in `index().using('gin')` | Requires raw SQL |
| `tsvector` support | `tsvector()` custom type | `Unsupported("tsvector")` |
| CHECK constraints | Native in `check()` | Requires raw SQL |
| `Decimal` precision | `decimal('score', { precision: 4, scale: 2 })` | `Decimal` (precision lost) |
| `varchar(n)` length | `varchar('email', { length: 255 })` | `String` (length lost) |
| `updated_at` trigger | Explicit trigger function | `@updatedAt` (automatic) |
| `search_vector` trigger | Explicit trigger function | Requires raw SQL trigger |
| Enum mapping | `pgEnum()` | `enum` (native) |

### 8.1 Prisma Limitations Requiring Raw SQL

The following features cannot be expressed in PSL and require `$executeRaw` or migration SQL:

1. **`tsvector` column** — `Unsupported("tsvector")` is generated but the column type must be set up via raw SQL before Prisma migration runs, or added in a separate migration step.
2. **GIN index** — Prisma does not support GIN index type. Must be added via `CREATE INDEX ... USING gin(...)`.
3. **Partial indexes** — Prisma's `@@index` does not support `WHERE` clauses. Must be added via raw SQL.
4. **CHECK constraints** — Prisma does not support `CHECK` in schema. Must be added via raw SQL.
5. **Trigger functions** — Prisma does not manage triggers. The `updated_at` auto-update and `search_vector` triggers must be created via raw SQL.
6. **Column length/precision** — Prisma `String` maps to `text` in PostgreSQL by default. To enforce `varchar(255)`, use raw SQL in migrations.

### 8.2 Recommended Hybrid Approach

If the project decides to use Prisma, the recommended workflow is:

1. Define models in `schema.prisma` as shown in §2.
2. Run `prisma migrate dev --create-only` to generate the migration SQL.
3. Manually edit the migration SQL to add:
   - `varchar(n)` length constraints
   - CHECK constraints
   - Partial indexes
   - GIN index for `search_vector`
   - Trigger functions for `updated_at` and `search_vector`
4. Run `prisma migrate deploy` to apply.

---

## 9. Migration Strategy

### 9.1 Migration Order

Migrations must run in dependency order (parents before children):

| Order | Migration | Models Created | Depends On |
|-------|-----------|----------------|------------|
| 1 | `001_create_enums` | All 7 ENUM types | — |
| 2 | `002_create_reference_tables` | `genres`, `studios`, `shelves` | Enums |
| 3 | `003_create_users` | `users`, `user_profiles`, `user_preferences` | Enums |
| 4 | `004_create_content` | `anime`, `seasons`, `episodes`, `stream_assets`, `anime_genres` | Enums, reference tables, users |
| 5 | `005_create_engagement` | `watch_history`, `watchlists`, `favorites` | Users, anime, episodes |
| 6 | `006_create_social` | `reviews`, `ratings`, `comments` | Users, anime |
| 7 | `007_create_system` | `subscriptions`, `notifications` | Users, enums |
| 8 | `008_create_curation` | `shelf_items` | Shelves, anime |
| 9 | `009_create_indexes` | All non-PK indexes (raw SQL) | All tables |
| 10 | `010_create_triggers` | `updated_at` + `search_vector` triggers | All tables |

### 9.2 Prisma Commands

```bash
# Generate Prisma Client (type definitions)
pnpm prisma generate

# Create a new migration (dev only — generates SQL, does not apply)
pnpx prisma migrate dev --name "create_anime_model"

# Apply migrations to database
pnpx prisma migrate deploy

# Open Prisma Studio (visual DB browser)
pnpx prisma studio

# Validate schema without migrating
pnpx prisma validate

# Format schema file
pnpx prisma format
```

### 9.3 Trigger: Auto-Update `updated_at`

Prisma's `@updatedAt` directive handles this automatically — no trigger needed. This is a Prisma advantage over Drizzle.

### 9.4 Trigger: Auto-Update `search_vector`

This trigger must be added via raw SQL in a migration:

```sql
CREATE OR REPLACE FUNCTION anime_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.title_jp, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.synopsis, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER anime_search_vector_trigger
    BEFORE INSERT OR UPDATE ON "anime"
    FOR EACH ROW
    EXECUTE FUNCTION anime_search_vector_update();
```

---

## 10. TypeScript Type Generation

Running `prisma generate` produces a typed client at `packages/db/src/generated/client/`. The generated types include:

### 10.1 Exported Types

| Prisma Model | Generated Types |
|-------------|-----------------|
| `User` | `User`, `UserCreateInput`, `UserUpdateInput`, `UserWhereInput`, ... |
| `Anime` | `Anime`, `AnimeCreateInput`, `AnimeUpdateInput`, `AnimeWhereInput`, ... |
| `Watchlist` | `Watchlist`, `WatchlistCreateInput`, ... |
| ... | (same pattern for all 20 models) |

### 10.2 Enum Exports

```typescript
import { UserRole, AnimeType, AnimeStatus, WatchlistStatus } from '@nexus/db';

// Usage in services
const adminUsers = await prisma.user.findMany({
  where: { role: UserRole.admin },
});
```

### 10.3 Usage in Repository Layer

```typescript
// packages/db/src/repositories/anime-repository.ts
import { PrismaClient, Anime, AnimeCreateInput } from '../generated/client';

export class AnimeRepository {
  constructor(private readonly db: PrismaClient) {}

  async findBySlug(slug: string): Promise<Anime | null> {
    return this.db.anime.findUnique({ where: { slug } });
  }

  async create(data: AnimeCreateInput): Promise<Anime> {
    return this.db.anime.create({ data });
  }
}
```

---

## 11. Seed Mapping

The seed data from `database-design.md` §7 maps to Prisma's `create` or `createMany`:

### 11.1 Genres (17 records)

```typescript
await prisma.genre.createMany({
  data: [
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
  ],
  skipDuplicates: true,
});
```

### 11.2 Shelves (5 records)

```typescript
await prisma.shelf.createMany({
  data: [
    { key: 'hero', name: 'Featured Hero', sortOrder: 0 },
    { key: 'trending', name: 'Trending Now', sortOrder: 1 },
    { key: 'new_releases', name: 'New Releases', sortOrder: 2 },
    { key: 'top_rated', name: 'Top Rated', sortOrder: 3 },
    { key: 'staff_picks', name: 'Staff Picks', sortOrder: 4 },
  ],
  skipDuplicates: true,
});
```

### 11.3 Studios (10 records)

```typescript
await prisma.studio.createMany({
  data: [
    { slug: 'kyoto-animation', name: 'Kyoto Animation' },
    { slug: 'ufotable', name: 'ufotable' },
    { slug: 'wit-studio', name: 'WIT Studio' },
    { slug: 'mappa', name: 'MAPPA' },
    { slug: 'bones', name: 'Bones' },
    { slug: 'a-1-pictures', name: 'A-1 Pictures' },
    { slug: 'trigger', name: 'Studio Trigger' },
    { slug: 'madhouse', name: 'Madhouse' },
    { slug: 'shaft', name: 'SHAFT' },
    { slug: 'cloverworks', name: 'CloverWorks' },
  ],
  skipDuplicates: true,
});
```

---

## Appendix A: Complete Model Summary

| # | Prisma Model | DB Table | Fields | Relations | Indexes |
|---|-------------|----------|---------|-----------|---------|
| 1 | `User` | `users` | 8 | 10 outgoing | — |
| 2 | `UserProfile` | `user_profiles` | 9 | 1 incoming | 1 |
| 3 | `UserPreferences` | `user_preferences` | 9 | 1 incoming | 1 |
| 4 | `Anime` | `anime` | 17 | 7 outgoing | 7 |
| 5 | `Season` | `seasons` | 10 | 2 outgoing | 1 |
| 6 | `Episode` | `episodes` | 12 | 3 outgoing | 2 |
| 7 | `StreamAsset` | `stream_assets` | 10 | 1 incoming | 2 |
| 8 | `Genre` | `genres` | 6 | 1 outgoing | 1 |
| 9 | `Studio` | `studios` | 8 | 1 outgoing | 1 |
| 10 | `AnimeGenre` | `anime_genres` | 2 | 2 incoming | 1 |
| 11 | `WatchHistory` | `watch_history` | 9 | 2 incoming | 4 |
| 12 | `Watchlist` | `watchlists` | 9 | 2 incoming | 4 |
| 13 | `Favorite` | `favorites` | 4 | 2 incoming | 2 |
| 14 | `Review` | `reviews` | 10 | 2 outgoing | 4 |
| 15 | `Rating` | `ratings` | 5 | 2 incoming | 2 |
| 16 | `Comment` | `comments` | 9 | 3 (incl. self) | 3 |
| 17 | `Subscription` | `subscriptions` | 10 | 1 incoming | 4 |
| 18 | `Notification` | `notifications` | 8 | 1 incoming | 3 |
| 19 | `Shelf` | `shelves` | 8 | 1 outgoing | 2 |
| 20 | `ShelfItem` | `shelf_items` | 6 | 2 incoming | 3 |

**Total: 20 models, 7 enums, ~50 indexes (44 inline + 6 raw SQL)**

---

## Appendix B: Prisma Schema Validation Checklist

Before running migrations, verify:

- [ ] All `@map("snake_case")` annotations match the DB column names in `database-design.md`
- [ ] All `@@map("table_name")` annotations match the DB table names
- [ ] Enum values match the PostgreSQL ENUM values exactly
- [ ] All `onDelete: Cascade` / `onDelete: SetNull` match the relationships matrix
- [ ] Composite PKs use `@@id([...])` correctly
- [ ] Self-referencing relations use named `@relation("Name")` on both sides
- [ ] `Unsupported("tsvector")` is replaced with raw SQL in migration
- [ ] CHECK constraints are added via raw SQL migration
- [ ] Partial indexes are added via raw SQL migration
- [ ] GIN index for `search_vector` is added via raw SQL migration
- [ ] `varchar(n)` length constraints are added via raw SQL migration
- [ ] Trigger for `search_vector` is added via raw SQL migration

---

*This document is the authoritative Prisma ORM specification for the Nexus Anime database. All Prisma schema definitions, migrations, and generated types must conform to this specification. For the canonical SQL schema, see [database-design.md](./database-design.md).*
