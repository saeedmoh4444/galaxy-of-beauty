import { getRedis } from './redis';
import { logger } from './logger';

const DEFAULT_TTL = 300; // 5 minutes — good balance for catalog data

/**
 * Attempts to read from Redis cache. On miss, calls `fetcher()`,
 * stores the result, and returns it. Cache failures are silent
 * (falls back to fetcher).
 */
export async function cached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = DEFAULT_TTL,
): Promise<T> {
  const redis = getRedis();
  if (!redis) return fetcher();

  const cacheKey = `cache:${key}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached !== null) {
      return JSON.parse(cached) as T;
    }
  } catch (err) {
    logger.warn({ err, key: cacheKey }, 'Redis cache read failed — falling back to fetcher');
  }

  const data = await fetcher();

  try {
    await redis.setex(cacheKey, ttl, JSON.stringify(data));
  } catch (err) {
    logger.warn({ err, key: cacheKey }, 'Redis cache write failed');
  }

  return data;
}

/**
 * Invalidates a specific cache key. Use after mutations that change the data.
 */
export async function invalidateCache(key: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  try {
    await redis.del(`cache:${key}`);
  } catch (err) {
    logger.warn({ err, key }, 'Redis cache invalidation failed');
  }
}

/**
 * Invalidates all cache keys matching a prefix. Use for broad invalidation
 * (e.g., after category create/update/delete, clear `categories:*`).
 */
export async function invalidateCachePrefix(prefix: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  try {
    const keys = await redis.keys(`cache:${prefix}*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (err) {
    logger.warn({ err, prefix }, 'Redis cache prefix invalidation failed');
  }
}
