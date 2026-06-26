import { getRedis } from "../client";
import { cacheFeatures } from "../feature-flags";
import { cacheKeys } from "../keys";
import { TTL } from "../ttl";

export async function getAnimeDetail<T>(slug: string): Promise<T | null> {
  if (!cacheFeatures.animeDetails()) return null;
  const redis = getRedis();
  return await redis.get<T>(cacheKeys.animeDetail(slug));
}

export async function setAnimeDetail<T>(slug: string, data: T): Promise<void> {
  if (!cacheFeatures.animeDetails()) return;
  const redis = getRedis();
  await redis.set(cacheKeys.animeDetail(slug), data, { ex: TTL.ANIME_DETAIL });
}
