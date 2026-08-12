import { RATE_LIMIT_PUBLIC, RATE_LIMIT_AUTH, RATE_LIMIT_ADMIN } from '@galaxy/shared';
import { getRedis } from './redis';

const RATE_LIMIT_WINDOW_S = 60; // 1‑minute sliding window

const RATE_LIMITS = {
  anonymous: { window: RATE_LIMIT_WINDOW_S, max: RATE_LIMIT_PUBLIC },
  authenticated: { window: RATE_LIMIT_WINDOW_S, max: RATE_LIMIT_AUTH },
  admin: { window: RATE_LIMIT_WINDOW_S, max: RATE_LIMIT_ADMIN },
};

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check rate limit for a given key and tier.
 *
 * Anonymous keys MUST include a client identifier (IP or session-derived hash)
 * to prevent one abusive client from exhausting the global anonymous bucket.
 *
 * Failure policy: If Redis is unavailable, requests are ALLOWED through
 * (fail-open for availability) but the event is logged. Rate-limiting is a
 * defense-in-depth measure, not a primary security boundary.
 */
export async function checkRateLimit(
  key: string,
  tier: 'anonymous' | 'authenticated' | 'admin' = 'anonymous',
): Promise<RateLimitResult> {
  const redis = getRedis();
  if (!redis) {
    // Fail-open: Redis unavailable → allow request.
    // Rate limiting is not a primary security boundary.
    return { allowed: true, remaining: 999, resetAt: 0 };
  }

  const config = RATE_LIMITS[tier];
  const now = Math.floor(Date.now() / 1000);
  const windowKey = `ratelimit:${tier}:${key}:${Math.floor(now / config.window)}`;
  const resetAt = (Math.floor(now / config.window) + 1) * config.window;

  try {
    const count = await redis.incr(windowKey);
    if (count === 1) await redis.expire(windowKey, config.window);

    return {
      allowed: count <= config.max,
      remaining: Math.max(0, config.max - count),
      resetAt,
    };
  } catch {
    // Fail-open: Redis error → allow request
    return { allowed: true, remaining: 999, resetAt: 0 };
  }
}
