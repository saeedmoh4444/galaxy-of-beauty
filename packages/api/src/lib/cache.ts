import { CACHE_DEFAULT_TTL_S } from '@galaxy/shared';
import { getRedis } from './redis';
import { logger } from './logger';

const DEFAULT_TTL = CACHE_DEFAULT_TTL_S; // 5 minutes — good balance for catalog data

// ── Hit/miss accounting (D3) ───────────────────────────────
// In-process counters feed the health payload and the k6 cache-hit gate.
// Per-process only — that is exactly what the single-server k6 assertion
// needs; multi-instance production dashboards should use Redis-side INFO.

type KeyCounters = { hits: number; misses: number };

const counters: KeyCounters & { keys: Map<string, KeyCounters> } = {
  hits: 0,
  misses: 0,
  keys: new Map(),
};

function record(key: string, kind: 'hit' | 'miss'): void {
  counters[kind === 'hit' ? 'hits' : 'misses'] += 1;
  const entry = counters.keys.get(key) ?? { hits: 0, misses: 0 };
  entry[kind === 'hit' ? 'hits' : 'misses'] += 1;
  counters.keys.set(key, entry);
}

/** Process-wide cache hit/miss totals (exposed on the health endpoint). */
export function getCacheStats(): { hits: number; misses: number; entries: number } {
  return { hits: counters.hits, misses: counters.misses, entries: counters.keys.size };
}

/** Test hook — zero the counters between assertions. */
export function resetCacheStats(): void {
  counters.hits = 0;
  counters.misses = 0;
  counters.keys.clear();
}

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
      record(key, 'hit');
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
  record(key, 'miss');

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
