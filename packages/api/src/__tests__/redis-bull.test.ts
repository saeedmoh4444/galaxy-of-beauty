/**
 * Redis connection factories — the BullMQ contract.
 *
 * BullMQ workers issue blocking commands (BRPOPLPUSH) and therefore
 * REQUIRE a connection with `maxRetriesPerRequest: null`. The shared
 * app client (getRedis) sets it to 2 for regular command resilience —
 * passing it to a Worker throws at construction ("Your redis options
 * maxRetriesPerRequest must be null"). This test pins the dedicated
 * BullMQ factory so that regression cannot ship again.
 *
 * The factory uses lazyConnect so no network I/O happens here.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../lib/env', () => ({
  getEnv: () => ({ REDIS_URL: 'redis://localhost:6379' }),
}));

import { getRedis, getRedisForBull } from '../lib/redis';

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  // ioredis clients keep timers alive; disconnect without network.
  const shared = getRedis();
  const bull = getRedisForBull();
  shared?.disconnect();
  bull?.disconnect();
});

describe('getRedisForBull (BullMQ worker connection)', () => {
  it('returns a connection with maxRetriesPerRequest null', () => {
    const conn = getRedisForBull();
    expect(conn).not.toBeNull();
    expect(conn?.options.maxRetriesPerRequest).toBeNull();
  });

  it('returns a connection separate from the shared app client', () => {
    const shared = getRedis();
    const bull = getRedisForBull();
    expect(bull).not.toBeNull();
    expect(bull).not.toBe(shared);
  });

  it('does not connect eagerly (lazyConnect) so construction is side-effect free', () => {
    const conn = getRedisForBull();
    expect(conn?.options.lazyConnect).toBe(true);
  });
});
