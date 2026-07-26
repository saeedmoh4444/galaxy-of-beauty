import { verifyToken } from '../utils/jwt.js';
import { AppError, ErrorCodes } from '../utils/errors.js';
import prisma from '../config/database.js';
import redis, { isRedisAvailable } from '../config/redis.js';

const AUTH_CACHE_TTL = 300; // 5 minutes

/** Safe Redis get/cache helpers that no-op when Redis is down */
async function safeGetAuth(key) {
  if (!isRedisAvailable()) return null;
  try { return await redis.get(key); } catch { return null; }
}
async function safeSetAuth(key, ttl, value) {
  if (!isRedisAvailable()) return;
  try { await redis.setex(key, ttl, value); } catch { /* noop */ }
}

/**
 * Require valid JWT access token.
 * Attaches req.user = { userId, role, email }
 * Caches user active-status check in Redis to avoid DB hit on every request.
 * Falls back to direct DB check when Redis is unavailable.
 */
export async function isAuth(req, _res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401, ErrorCodes.UNAUTHORIZED);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token, 'access');
    req.user = decoded;

    // Check Redis cache first for user active status
    const cacheKey = `auth:user:${decoded.userId}`;
    const cached = await safeGetAuth(cacheKey);

    if (cached === 'active') {
      return next();
    }

    if (cached === 'suspended') {
      throw new AppError('Account is suspended or deactivated', 401, ErrorCodes.ACCOUNT_SUSPENDED);
    }

    // Cache miss — query DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, isActive: true, suspendedAt: true },
    });

    if (!user || !user.isActive) {
      // Cache negative result briefly
      await safeSetAuth(cacheKey, 60, 'suspended');
      throw new AppError('Account not found or deactivated', 401, ErrorCodes.ACCOUNT_SUSPENDED);
    }

    // Cache positive result
    await safeSetAuth(cacheKey, AUTH_CACHE_TTL, 'active');
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Invalidate auth cache for a user (call after suspend/reinstate).
 */
export async function invalidateAuthCache(userId) {
  if (!isRedisAvailable()) return;
  try { await redis.del(`auth:user:${userId}`); } catch { /* noop */ }
}

/**
 * Role-based authorization middleware factory.
 */
export function hasRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401, ErrorCodes.UNAUTHORIZED));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403, ErrorCodes.FORBIDDEN));
    }
    next();
  };
}

export default { isAuth, hasRole, invalidateAuthCache };
