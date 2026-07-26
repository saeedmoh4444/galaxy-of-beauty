import Redis from 'ioredis';
import env from './env.js';
import logger from './logger.js';

let redisAvailable = false;

/**
 * Redis client for caching and BullMQ.
 * Configured with retry strategy and connection timeout.
 * Degrades gracefully when Redis is unavailable (dev mode without Redis).
 */
const redis = new Redis(env.REDIS_URL, {
  password: env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 3) {
      logger.warn('Redis: max retries exceeded — caching disabled');
      return null;
    }
    return Math.min(times * 200, 2000);
  },
  lazyConnect: true,
  enableReadyCheck: true,
});

redis.on('connect', () => {
  redisAvailable = true;
  logger.info('Redis connected successfully');
});

const onRedisError = (err) => {
  redisAvailable = false;
  if (err.code === 'ECONNREFUSED' && env.NODE_ENV === 'development') {
    // Suppress repeated ECONNREFUSED logs in dev — it's noisy and expected without Redis
    redis.off('error', onRedisError);
    return;
  }
  logger.error('Redis connection error', { error: err.message });
};

redis.on('error', onRedisError);

redis.on('close', () => {
  redisAvailable = false;
});

/** Check if Redis is currently connected. */
export function isRedisAvailable() {
  return redisAvailable;
}

/**
 * Safe Redis get — returns null if Redis is down.
 */
async function safeGet(key) {
  if (!redisAvailable) return null;
  try {
    return await redis.get(key);
  } catch {
    return null;
  }
}

/**
 * Safe Redis set — no-ops if Redis is down.
 */
async function safeSet(key, value, ...args) {
  if (!redisAvailable) return null;
  try {
    return await redis.set(key, value, ...args);
  } catch {
    return null;
  }
}

/**
 * Safe Redis setex — no-ops if Redis is down.
 */
async function safeSetex(key, ttl, value) {
  if (!redisAvailable) return null;
  try {
    return await redis.setex(key, ttl, value);
  } catch {
    return null;
  }
}

/**
 * Safe Redis del — no-ops if Redis is down.
 */
async function safeDel(...keys) {
  if (!redisAvailable) return 0;
  try {
    return await redis.del(...keys);
  } catch {
    return 0;
  }
}

/**
 * Safe Redis keys — returns empty array if Redis is down.
 */
async function safeKeys(pattern) {
  if (!redisAvailable) return [];
  try {
    return await redis.keys(pattern);
  } catch {
    return [];
  }
}

/**
 * Generic cache helper with TTL.
 * @param {string} key - Cache key
 * @param {() => Promise<any>} fetchFn - Function to fetch data on cache miss
 * @param {number} ttlSeconds - TTL in seconds
 * @returns {Promise<any>}
 */
export async function cacheWithTTL(key, fetchFn, ttlSeconds = 300) {
  try {
    const cached = await safeGet(key);
    if (cached) {
      return JSON.parse(cached);
    }
    const data = await fetchFn();
    await safeSetex(key, ttlSeconds, JSON.stringify(data));
    return data;
  } catch (error) {
    logger.error('Cache error', { key, error: error.message });
    // Fall back to fetching directly
    return fetchFn();
  }
}

/**
 * Invalidate cache keys matching a pattern.
 * @param {string} pattern - Glob pattern (e.g., "categories:*")
 */
export async function invalidateCache(pattern) {
  const keys = await safeKeys(pattern);
  if (keys.length > 0) {
    await safeDel(...keys);
    logger.debug('Cache invalidated', { pattern, keysDeleted: keys.length });
  }
}

export default redis;
