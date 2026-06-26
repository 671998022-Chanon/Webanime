/**
 * Seed catalog data: genres, studios, shelves.
 * Safe in all environments (local, staging, production).
 * Idempotent via onConflictDoNothing.
 */
import "server-only";

import { getDb } from "@nexus/db/client";
import { genres, studios, shelves } from "@nexus/db/schema";

const db = getDb();

const GENRES = [
  { slug: "action", name: "Action" },
  { slug: "adventure", name: "Adventure" },
  { slug: "comedy", name: "Comedy" },
  { slug: "drama", name: "Drama" },
  { slug: "fantasy", name: "Fantasy" },
  { slug: "horror", name: "Horror" },
  { slug: "isekai", name: "Isekai" },
  { slug: "mecha", name: "Mecha" },
  { slug: "mystery", name: "Mystery" },
  { slug: "psychological", name: "Psychological" },
  { slug: "romance", name: "Romance" },
  { slug: "sci-fi", name: "Sci-Fi" },
  { slug: "slice-of-life", name: "Slice of Life" },
  { slug: "sports", name: "Sports" },
  { slug: "supernatural", name: "Supernatural" },
  { slug: "thriller", name: "Thriller" },
  { slug: "music", name: "Music" },
];

const STUDIOS = [
  { slug: "kyoto-animation", name: "Kyoto Animation" },
  { slug: "ufotable", name: "ufotable" },
  { slug: "wit-studio", name: "WIT Studio" },
  { slug: "mappa", name: "MAPPA" },
  { slug: "bones", name: "Bones" },
  { slug: "a-1-pictures", name: "A-1 Pictures" },
  { slug: "trigger", name: "Studio Trigger" },
  { slug: "madhouse", name: "Madhouse" },
  { slug: "shaft", name: "SHAFT" },
  { slug: "cloverworks", name: "CloverWorks" },
];

const SHELVES = [
  { key: "hero", name: "Featured Hero", sortOrder: 0 },
  { key: "trending", name: "Trending Now", sortOrder: 1 },
  { key: "new_releases", name: "New Releases", sortOrder: 2 },
  { key: "top_rated", name: "Top Rated", sortOrder: 3 },
  { key: "staff_picks", name: "Staff Picks", sortOrder: 4 },
];

export async function main() {
  console.log("[seed:catalog] starting...");

  const insertedGenres = await db.insert(genres).values(GENRES).onConflictDoNothing().returning();
  console.log(`[seed:catalog] genres: ${insertedGenres.length} inserted (skipped ${GENRES.length - insertedGenres.length})`);

  const insertedStudios = await db.insert(studios).values(STUDIOS).onConflictDoNothing().returning();
  console.log(`[seed:catalog] studios: ${insertedStudios.length} inserted (skipped ${STUDIOS.length - insertedStudios.length})`);

  const insertedShelves = await db.insert(shelves).values(SHELVES).onConflictDoNothing().returning();
  console.log(`[seed:catalog] shelves: ${insertedShelves.length} inserted (skipped ${SHELVES.length - insertedShelves.length})`);

  console.log("[seed:catalog] done.");
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[seed:catalog] failed:", err);
      process.exit(1);
    });
}
