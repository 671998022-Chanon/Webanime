import { uuid, varchar, text, timestamp, jsonb, boolean, pgTable } from "drizzle-orm/pg-core";
import { userRoleEnum } from "./enums";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull().default(""),
  image: varchar("image", { length: 1024 }),
  hashedPassword: varchar("hashed_password", { length: 255 }),
  role: userRoleEnum("role").notNull().default("user"),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  bio: text("bio"),
  avatarUrl: varchar("avatar_url", { length: 1024 }),
  website: varchar("website", { length: 500 }),
  location: varchar("location", { length: 255 }),
  dateOfBirth: timestamp("date_of_birth", { withTimezone: true }),
  socialLinks: jsonb("social_links"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const userPreferences = pgTable("user_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  playbackQuality: varchar("playback_quality", { length: 20 }).notNull().default("auto"),
  subtitleLanguage: varchar("subtitle_language", { length: 10 }).default("en"),
  autoplay: boolean("autoplay").notNull().default(true),
  skipIntro: boolean("skip_intro").notNull().default(false),
  theme: varchar("theme", { length: 20 }).notNull().default("dark"),
  language: varchar("language", { length: 10 }).notNull().default("en"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
