import { getRedis } from './redis';

const RATE_LIMITS = {
  anonymous: { window: 60, max: 20 },   // 20 req/min
  authenticated: { window: 60, max: 60 }, // 60 req/min
  admin: { window: 60, max: 300 },       // 300 req/min
};

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export async function checkRateLimit(
  key: string,
  tier: 'anonymous' | 'authenticated' | 'admin' = 'anonymous',
): Promise<RateLimitResult> {
  const redis = getRedis();
  if (!redis) return { allowed: true, remaining: 999, resetAt: 0 };

  const config = RATE_LIMITS[tier];
  const now = Math.floor(Date.now() / 1000);
  const windowKey = `ratelimit:${key}:${Math.floor(now / config.window)}`;
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
    return { allowed: true, remaining: 999, resetAt: 0 };
  }
}
