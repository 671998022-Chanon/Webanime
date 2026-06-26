import { getRedis } from "../client";
import { cacheFeatures } from "../feature-flags";
import { cacheKeys } from "../keys";
import { TTL } from "../ttl";

export async function cacheSubscriptionStatus(
  userId: string,
  status: string,
): Promise<void> {
  if (!cacheFeatures.subscription()) return;
  const redis = getRedis();
  await redis.set(cacheKeys.subscription(userId), status, { ex: TTL.SUBSCRIPTION });
}

export async function getCachedSubscriptionStatus(
  userId: string,
): Promise<string | null> {
  if (!cacheFeatures.subscription()) return null;
  const redis = getRedis();
  return await redis.get<string>(cacheKeys.subscription(userId));
}
