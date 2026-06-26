/**
 * Seed admin user (local + staging only).
 * Refuses to run in production. Idempotent via email existence check.
 */
import "server-only";

import { hash } from "bcrypt";
import { eq } from "drizzle-orm";
import { getDb } from "@nexus/db/client";
import { users } from "@nexus/db/schema";

const db = getDb();

const ADMIN_EMAIL = "dev@nexus-anime.local";
const ADMIN_NAME = "Dev Admin";

export async function main() {
  if (process.env.NODE_ENV === "production") {
    console.warn("[seed:admin] skipping — NODE_ENV=production");
    return;
  }

  const existing = await db.select().from(users).where(eq(users.email, ADMIN_EMAIL)).limit(1);
  if (existing.length > 0) {
    console.log("[seed:admin] admin user already exists, skipping.");
    return;
  }

  const password = process.env.SEED_ADMIN_PASSWORD ?? "password123";
  const hashedPassword = await hash(password, 12);

  await db.insert(users).values({
    email: ADMIN_EMAIL,
    name: ADMIN_NAME,
    hashedPassword,
    role: "superadmin",
    emailVerified: new Date(),
  });

  console.log(`[seed:admin] seeded superadmin: ${ADMIN_EMAIL}`);
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[seed:admin] failed:", err);
      process.exit(1);
    });
}
