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

    // Log each distinct error message once per process — repeated retry
    // failures while Redis is down otherwise spam the console
    const loggedErrors = new Set<string>();
    redis.on('error', (err) => {
      if (loggedErrors.has(err.message)) return;
      loggedErrors.add(err.message);
      // Log Redis errors but don't crash — the API degrades gracefully
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

// ── BullMQ Connection ──────────────────────────────

let bullRedis: Redis | null = null;

/**
 * Get or create the dedicated BullMQ connection.
 *
 * BullMQ workers issue blocking commands (BRPOPLPUSH), which require
 * `maxRetriesPerRequest: null` — the shared app client sets it to 2 for
 * regular command resilience, so it must NEVER be passed to a Worker
 * (BullMQ throws "Your redis options maxRetriesPerRequest must be null").
 * Lazy-connect keeps construction side-effect free; BullMQ connects it.
 */
export function getRedisForBull(): Redis | null {
  if (bullRedis && (bullRedis.status === 'ready' || bullRedis.status === 'connecting')) {
    return bullRedis;
  }

  try {
    const env = getEnv();
    bullRedis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      retryStrategy(times) {
        // Keep retrying on the worker connection — jobs must not be lost
        // because of a transient Redis blip.
        return Math.min(times * 200, 5000);
      },
      lazyConnect: true,
    });
    return bullRedis;
  } catch {
    // Redis not configured — callers take their degraded path.
    return null;
  }
}

// ── Rate Limiting Helpers ──────────────────────────────────

/**
 * Check if a key has exceeded the allowed number of attempts.
 * Uses Redis INCR + EXPIRE for atomicity.
 *
 * @returns The current attempt count after incrementing
 */
export async function incrementAttempts(key: string, windowSeconds: number): Promise<number> {
  const r = getRedis();

  if (r) {
    try {
      const count = await r.incr(key);
      if (count === 1) {
        // First attempt — set expiry on the key
        await r.expire(key, windowSeconds);
      }
      return count;
    } catch {
      // Redis error — fall through to the in-process counter (fail closed).
    }
  }

  // Security: never fail OPEN on the login lockout. When Redis is down the
  // counter degrades to a per-process map — attempts still accumulate and
  // the lockout still triggers (per-process only, acceptable degradation).
  return incrementInMemoryAttempts(key, windowSeconds);
}

// ── In-process fallback for attempt counters (Redis down) ────────────

const inMemoryAttempts = new Map<string, { count: number; expiresAt: number }>();

function incrementInMemoryAttempts(key: string, windowSeconds: number): number {
  const now = Date.now();
  const entry = inMemoryAttempts.get(key);
  if (!entry || entry.expiresAt <= now) {
    inMemoryAttempts.set(key, { count: 1, expiresAt: now + windowSeconds * 1000 });
    return 1;
  }
  entry.count += 1;
  return entry.count;
}

/**
 * Reset the attempt counter for a key (e.g., after successful login).
 */
export async function resetAttempts(key: string): Promise<void> {
  inMemoryAttempts.delete(key);

  const r = getRedis();
  if (!r) return;

  try {
    await r.del(key);
  } catch {
    // Silently ignore cleanup errors
  }
}
