import { uuid, varchar, text, integer, boolean, timestamp, pgTable } from "drizzle-orm/pg-core";
import { anime } from "./anime";

export const shelves = pgTable("shelves", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  iconUrl: varchar("icon_url", { length: 1024 }),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const shelfItems = pgTable("shelf_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  shelfId: uuid("shelf_id")
    .notNull()
    .references(() => shelves.id, { onDelete: "cascade" }),
  animeId: uuid("anime_id")
    .notNull()
    .references(() => anime.id, { onDelete: "cascade" }),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
