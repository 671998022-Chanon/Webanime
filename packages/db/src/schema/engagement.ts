import { uuid, text, integer, decimal, timestamp, pgTable } from "drizzle-orm/pg-core";
import { watchlistStatusEnum } from "./enums";
import { users } from "./users";
import { anime } from "./anime";
import { episodes } from "./anime";

export const watchHistory = pgTable("watch_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  episodeId: uuid("episode_id")
    .notNull()
    .references(() => episodes.id, { onDelete: "cascade" }),
  positionSeconds: integer("position_seconds").notNull().default(0),
  durationSeconds: integer("duration_seconds"),
  completionPct: decimal("completion_pct", { precision: 5, scale: 2 }),
  watchedAt: timestamp("watched_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const watchlists = pgTable("watchlists", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  animeId: uuid("anime_id")
    .notNull()
    .references(() => anime.id, { onDelete: "cascade" }),
  status: watchlistStatusEnum("status").notNull().default("plan_to_watch"),
  episodesWatched: integer("episodes_watched").notNull().default(0),
  priority: integer("priority").notNull().default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const favorites = pgTable("favorites", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  animeId: uuid("anime_id")
    .notNull()
    .references(() => anime.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
