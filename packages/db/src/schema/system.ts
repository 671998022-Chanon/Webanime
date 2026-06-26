import { uuid, varchar, text, boolean, timestamp, pgTable } from "drizzle-orm/pg-core";
import { subscriptionStatusEnum, notificationTypeEnum } from "./enums";
import { users } from "./users";

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }).notNull().unique(),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }).unique(),
  status: subscriptionStatusEnum("status").notNull().default("trialing"),
  currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 500 }).notNull(),
  body: text("body"),
  type: notificationTypeEnum("type").notNull().default("system"),
  isRead: boolean("is_read").notNull().default(false),
  actionUrl: varchar("action_url", { length: 1024 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
