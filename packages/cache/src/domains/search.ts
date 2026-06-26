import { getRedis } from "../client";
import { cacheFeatures } from "../feature-flags";
import { cacheKeys } from "../keys";
import { TTL } from "../ttl";
import { hashQuery } from "../serializers";

export async function getSearchResults<T>(query: string, cursor?: string): Promise<T | null> {
  if (!cacheFeatures.search()) return null;
  const redis = getRedis();
  const hash = hashQuery(query);
  return await redis.get<T>(cacheKeys.search(hash, cursor));
}

export async function setSearchResults<T>(
  query: string,
  data: T,
  cursor?: string,
): Promise<void> {
  if (!cacheFeatures.search()) return;
  const redis = getRedis();
  const hash = hashQuery(query);
  await redis.set(cacheKeys.search(hash, cursor), data, { ex: TTL.SEARCH });
}
