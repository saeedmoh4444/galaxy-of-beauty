import { CACHE_DEFAULT_TTL_S } from '@galaxy/shared';
import { getRedis } from './redis';
import { logger } from './logger';

const DEFAULT_TTL = CACHE_DEFAULT_TTL_S; // 5 minutes — good balance for catalog data

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
    // Message-only: cache failures are benign (DB fallback), and logging
    // the full error object dumps noisy stack traces on every request
    // while Redis is down.
    logger.warn(
      `Redis cache read failed (${(err as Error).message}) — falling back to fetcher: ${cacheKey}`,
    );
  }

  const data = await fetcher();

  try {
    await redis.setex(cacheKey, ttl, JSON.stringify(data));
  } catch (err) {
    logger.warn(`Redis cache write failed (${(err as Error).message}): ${cacheKey}`);
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
    logger.warn(`Redis cache invalidation failed (${(err as Error).message}): ${key}`);
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
    logger.warn(`Redis cache prefix invalidation failed (${(err as Error).message}): ${prefix}`);
  }
}
