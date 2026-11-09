/**
 * D3 — cache hit/miss accounting and invalidation, against the real Redis
 * (the Unit Tests CI job provisions one). Local runs without Redis skip.
 */
import { beforeAll, describe, expect, it } from 'vitest';
import {
  cached,
  getCacheStats,
  invalidateCache,
  invalidateCachePrefix,
  resetCacheStats,
} from '../lib/cache';
import { getRedis } from '../lib/redis';

let redisAvailable = false;

beforeAll(async () => {
  const r = getRedis();
  if (r) {
    try {
      await r.ping();
      redisAvailable = true;
    } catch {
      redisAvailable = false;
    }
  }
});

describe('cache stats + invalidation', () => {
  it('counts a miss then a hit across two identical reads', async (ctx) => {
    if (!redisAvailable) return;
    resetCacheStats();
    let fetches = 0;
    const fetch = async () => {
      fetches += 1;
      return { value: 42 };
    };

    const first = await cached('d3-stats-test', fetch, 60);
    const second = await cached('d3-stats-test', fetch, 60);

    expect(first).toEqual({ value: 42 });
    expect(second).toEqual({ value: 42 });
    expect(fetches).toBe(1); // second read served from Redis
    const stats = getCacheStats();
    expect(stats.hits).toBe(1);
    expect(stats.misses).toBe(1);

    await invalidateCache('d3-stats-test'); // cleanup
  });

  it('invalidateCache forces a re-fetch (stale-proof)', async (ctx) => {
    if (!redisAvailable) return;
    resetCacheStats();
    let fetches = 0;
    const fetch = async () => {
      fetches += 1;
      return { n: fetches };
    };

    await cached('d3-invalidate-test', fetch, 60);
    await invalidateCache('d3-invalidate-test');
    const after = await cached('d3-invalidate-test', fetch, 60);

    expect(fetches).toBe(2);
    expect(after).toEqual({ n: 2 });
    await invalidateCache('d3-invalidate-test'); // cleanup
  });

  it('invalidateCachePrefix clears the whole family', async (ctx) => {
    if (!redisAvailable) return;
    const r = getRedis();
    if (!r) return;

    await cached('d3-prefix-test:a', async () => 1, 60);
    await cached('d3-prefix-test:b', async () => 2, 60);
    await invalidateCachePrefix('d3-prefix-test:');

    const keys = await r.keys('cache:d3-prefix-test:*');
    expect(keys.length).toBe(0);
  });
});
