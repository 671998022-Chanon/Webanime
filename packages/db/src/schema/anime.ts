import { uuid, varchar, text, timestamp, integer, decimal, bigint, boolean, pgTable } from "drizzle-orm/pg-core";
import { animeTypeEnum, animeStatusEnum } from "./enums";
import { studios } from "./studios";

export const anime = pgTable("anime", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 500 }).notNull(),
  titleJp: varchar("title_jp", { length: 500 }),
  synopsis: text("synopsis"),
  coverImageUrl: varchar("cover_image_url", { length: 1024 }),
  bannerImageUrl: varchar("banner_image_url", { length: 1024 }),
  type: animeTypeEnum("type"),
  status: animeStatusEnum("status"),
  totalEpisodes: integer("total_episodes"),
  durationMinutes: integer("duration_minutes"),
  startDate: timestamp("start_date", { withTimezone: true }),
  endDate: timestamp("end_date", { withTimezone: true }),
  score: decimal("score", { precision: 4, scale: 2 }),
  popularityRank: integer("popularity_rank"),
  studioId: uuid("studio_id").references(() => studios.id, { onDelete: "set null" }),
  // search_vector is tsvector — added via raw SQL migration (Drizzle lacks native tsvector)
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const seasons = pgTable("seasons", {
  id: uuid("id").primaryKey().defaultRandom(),
  animeId: uuid("anime_id")
    .notNull()
    .references(() => anime.id, { onDelete: "cascade" }),
  seasonNumber: integer("season_number").notNull(),
  title: varchar("title", { length: 500 }),
  synopsis: text("synopsis"),
  startDate: timestamp("start_date", { withTimezone: true }),
  endDate: timestamp("end_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const episodes = pgTable("episodes", {
  id: uuid("id").primaryKey().defaultRandom(),
  seasonId: uuid("season_id")
    .notNull()
    .references(() => seasons.id, { onDelete: "cascade" }),
  episodeNumber: integer("episode_number").notNull(),
  title: varchar("title", { length: 500 }),
  synopsis: text("synopsis"),
  durationSeconds: integer("duration_seconds"),
  airDate: timestamp("air_date", { withTimezone: true }),
  isFiller: boolean("is_filler").notNull().default(false),
  thumbnailUrl: varchar("thumbnail_url", { length: 1024 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const streamAssets = pgTable("stream_assets", {
  id: uuid("id").primaryKey().defaultRandom(),
  episodeId: uuid("episode_id")
    .notNull()
    .references(() => episodes.id, { onDelete: "cascade" }),
  manifestUrl: varchar("manifest_url", { length: 2048 }).notNull(),
  subtitleUrl: varchar("subtitle_url", { length: 2048 }),
  bitrate: integer("bitrate"),
  resolution: varchar("resolution", { length: 20 }),
  codec: varchar("codec", { length: 50 }),
  fileSizeBytes: bigint("file_size_bytes", { mode: "number" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
