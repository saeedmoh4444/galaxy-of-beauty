import Redis from 'ioredis';
import { getEnv } from './env';

let redis: Redis | null = null;

/**
 * Get or create the shared Redis client instance.
 * Returns null if Redis is unavailable (degraded mode).
 */
export function getRedis(): Redis | null {
  if (redis) {
    // Check if the existing connection is still alive
    if (redis.status === 'ready' || redis.status === 'connecting') {
      return redis;
    }
    // Connection lost — recreate
    redis = null;
  }

  try {
    const env = getEnv();
    redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 2,
      retryStrategy(times) {
        if (times > 3) return null; // stop retrying after 3 attempts
        return Math.min(times * 200, 2000);
      },
      lazyConnect: false,
      enableOfflineQueue: false,
    });

    redis.on('error', (err) => {
      // Log Redis errors but don't crash — the API degrades gracefully
      // eslint-disable-next-line no-console
      console.error('[Redis] Connection error:', err.message);
    });

    return redis;
  } catch {
    // Redis not configured or unreachable — return null
    return null;
  }
}

/**
 * Check if Redis is available.
 */
export function isRedisAvailable(): boolean {
  const r = getRedis();
  return r !== null && (r.status === 'ready' || r.status === 'connecting');
}

// ── Rate Limiting Helpers ──────────────────────────────────

/**
 * Check if a key has exceeded the allowed number of attempts.
 * Uses Redis INCR + EXPIRE for atomicity.
 *
 * @returns The current attempt count after incrementing
 */
export async function incrementAttempts(
  key: string,
  windowSeconds: number,
): Promise<number> {
  const r = getRedis();
  if (!r) {
    // Redis unavailable — allow the request (fail open for availability)
    return 1;
  }

  try {
    const count = await r.incr(key);
    if (count === 1) {
      // First attempt — set expiry on the key
      await r.expire(key, windowSeconds);
    }
    return count;
  } catch {
    // Redis error — fail open
    return 1;
  }
}

/**
 * Reset the attempt counter for a key (e.g., after successful login).
 */
export async function resetAttempts(key: string): Promise<void> {
  const r = getRedis();
  if (!r) return;

  try {
    await r.del(key);
  } catch {
    // Silently ignore cleanup errors
  }
}
