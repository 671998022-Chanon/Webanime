/**
 * Seed sample anime data (local + staging only).
 * Refuses to run in production. Idempotent via slug existence check.
 * Depends on: genres, studios, shelves already seeded.
 */
import "server-only";

import { eq, inArray } from "drizzle-orm";
import { getDb } from "@nexus/db/client";
import {
  anime,
  seasons,
  episodes,
  animeGenres,
  studios,
  genres,
  shelves,
  shelfItems,
} from "@nexus/db/schema";

const db = getDb();

interface SampleAnime {
  slug: string;
  title: string;
  type: "TV" | "OVA" | "ONA" | "Movie" | "Special";
  status: "airing" | "finished" | "upcoming";
  year: number;
  synopsis: string;
  totalEpisodes: number;
  studioSlug: string;
  genreSlugs: string[];
  shelfKeys: string[];
}

const SAMPLE_ANIME: SampleAnime[] = [
  {
    slug: "starfall-chronicles",
    title: "Starfall Chronicles",
    type: "TV",
    status: "airing",
    year: 2025,
    synopsis:
      "In a dying galaxy, young pilots discover ancient mechs that hold the key to humanity's survival.",
    totalEpisodes: 12,
    studioSlug: "bones",
    genreSlugs: ["action", "fantasy", "mecha"],
    shelfKeys: ["hero", "new_releases"],
  },
  {
    slug: "midnight-diner-tokyo",
    title: "Midnight Diner: Tokyo",
    type: "TV",
    status: "finished",
    year: 2024,
    synopsis:
      "A quiet diner open past midnight serves comfort food and life stories to its eclectic patrons.",
    totalEpisodes: 10,
    studioSlug: "kyoto-animation",
    genreSlugs: ["slice-of-life", "drama"],
    shelfKeys: ["trending", "top_rated"],
  },
  {
    slug: "velocity-rush",
    title: "Velocity Rush",
    type: "TV",
    status: "finished",
    year: 2024,
    synopsis:
      "High-speed street racers compete for the underground championship while outrunning their pasts.",
    totalEpisodes: 13,
    studioSlug: "mappa",
    genreSlugs: ["sports", "action"],
    shelfKeys: ["new_releases"],
  },
  {
    slug: "whispers-in-the-dark",
    title: "Whispers in the Dark",
    type: "Movie",
    status: "upcoming",
    year: 2026,
    synopsis:
      "A detective hunts a killer whose crimes mirror urban legends — but the legends start coming true.",
    totalEpisodes: 1,
    studioSlug: "shaft",
    genreSlugs: ["horror", "mystery", "psychological"],
    shelfKeys: ["staff_picks"],
  },
  {
    slug: "love-in-the-spring",
    title: "Love in the Spring",
    type: "TV",
    status: "finished",
    year: 2024,
    synopsis:
      "Two college students navigate first love, career anxiety, and the changing seasons of youth.",
    totalEpisodes: 12,
    studioSlug: "a-1-pictures",
    genreSlugs: ["romance", "comedy"],
    shelfKeys: ["top_rated", "staff_picks"],
  },
];

export async function main() {
  if (process.env.NODE_ENV === "production") {
    console.warn("[seed:anime] skipping — NODE_ENV=production");
    return;
  }

  const allStudioSlugs = Array.from(new Set(SAMPLE_ANIME.map((a) => a.studioSlug)));
  const allGenreSlugs = Array.from(new Set(SAMPLE_ANIME.flatMap((a) => a.genreSlugs)));
  const allShelfKeys = Array.from(new Set(SAMPLE_ANIME.flatMap((a) => a.shelfKeys)));

  const studioRows = await db.select().from(studios).where(inArray(studios.slug, allStudioSlugs));
  const genreRows = await db.select().from(genres).where(inArray(genres.slug, allGenreSlugs));
  const shelfRows = await db.select().from(shelves).where(inArray(shelves.key, allShelfKeys));

  const studioBySlug = new Map(studioRows.map((s) => [s.slug, s]));
  const genreBySlug = new Map(genreRows.map((g) => [g.slug, g]));
  const shelfByKey = new Map(shelfRows.map((s) => [s.key, s]));

  let insertedCount = 0;

  for (const entry of SAMPLE_ANIME) {
    const existing = await db.select().from(anime).where(eq(anime.slug, entry.slug)).limit(1);
    if (existing.length > 0) {
      console.log(`[seed:anime] "${entry.title}" already exists, skipping.`);
      continue;
    }

    const studio = studioBySlug.get(entry.studioSlug);
    if (!studio) {
      console.warn(`[seed:anime] studio "${entry.studioSlug}" not found, skipping "${entry.title}"`);
      continue;
    }

    const [insertedAnime] = await db
      .insert(anime)
      .values({
        slug: entry.slug,
        title: entry.title,
        type: entry.type,
        status: entry.status,
        synopsis: entry.synopsis,
        totalEpisodes: entry.totalEpisodes,
        studioId: studio.id,
      })
      .returning();

    const matchedGenres = entry.genreSlugs
      .map((slug) => genreBySlug.get(slug))
      .filter((g): g is NonNullable<typeof g> => Boolean(g));
    if (matchedGenres.length > 0) {
      await db
        .insert(animeGenres)
        .values(matchedGenres.map((g) => ({ animeId: insertedAnime.id, genreId: g.id })))
        .onConflictDoNothing();
    }

    const matchedShelves = entry.shelfKeys
      .map((key) => shelfByKey.get(key))
      .filter((s): s is NonNullable<typeof s> => Boolean(s));
    if (matchedShelves.length > 0) {
      await db
        .insert(shelfItems)
        .values(matchedShelves.map((s, i) => ({ shelfId: s.id, animeId: insertedAnime.id, position: i })))
        .onConflictDoNothing();
    }

    const episodeCount = Math.min(entry.totalEpisodes, 3);
    const [season] = await db
      .insert(seasons)
      .values({
        animeId: insertedAnime.id,
        seasonNumber: 1,
        title: "Season 1",
      })
      .returning();

    await db.insert(episodes).values(
      Array.from({ length: episodeCount }, (_, i) => ({
        seasonId: season.id,
        episodeNumber: i + 1,
        title: `Episode ${i + 1}`,
        durationSeconds: 24 * 60,
      })),
    );

    insertedCount++;
    console.log(
      `[seed:anime] inserted "${entry.title}" (${matchedGenres.length} genres, ${episodeCount} episodes)`,
    );
  }

  console.log(`[seed:anime] done. ${insertedCount} new anime seeded.`);
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[seed:anime] failed:", err);
      process.exit(1);
    });
}
