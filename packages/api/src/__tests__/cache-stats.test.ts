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

/** The suite runs in the test env, where cached() is OFF by default —
 * the D3 cache tests opt in per test. */
function enableCache(): void {
  process.env.GOB_TEST_CACHE = '1';
}

describe('cache stats + invalidation', () => {
  it('bypasses the cache in the test env unless opted in (shared-DB safety)', async () => {
    delete process.env.GOB_TEST_CACHE;
    let fetches = 0;
    const fetch = async () => {
      fetches += 1;
      return { value: fetches };
    };
    // Two identical reads must BOTH hit the fetcher — the test env never
    // serves stale data to tests that mutate the shared DB directly.
    await cached('d3-bypass-test', fetch, 60);
    await cached('d3-bypass-test', fetch, 60);
    expect(fetches).toBe(2);
    enableCache();
  });

  it('counts a miss then a hit across two identical reads', async (ctx) => {
    if (!redisAvailable) return;
    enableCache();
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
    enableCache();
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
    enableCache();
    const r = getRedis();
    if (!r) return;

    await cached('d3-prefix-test:a', async () => 1, 60);
    await cached('d3-prefix-test:b', async () => 2, 60);
    await invalidateCachePrefix('d3-prefix-test:');

    const keys = await r.keys('cache:d3-prefix-test:*');
    expect(keys.length).toBe(0);
  });
});
