import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["user", "admin", "superadmin"]);
export const animeTypeEnum = pgEnum("anime_type", ["TV", "OVA", "ONA", "Movie", "Special"]);
export const animeStatusEnum = pgEnum("anime_status", ["airing", "finished", "upcoming"]);
export const watchlistStatusEnum = pgEnum("watchlist_status", [
  "plan_to_watch",
  "watching",
  "completed",
  "dropped",
  "on_hold",
]);
export const reviewStatusEnum = pgEnum("review_status", ["published", "draft", "hidden"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "past_due",
  "canceled",
  "unpaid",
  "trialing",
]);
export const notificationTypeEnum = pgEnum("notification_type", [
  "system",
  "episode",
  "social",
  "promo",
]);
