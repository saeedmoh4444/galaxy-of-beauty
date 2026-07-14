import redis, { isRedisAvailable } from '../config/redis.js';
import { AppError, ErrorCodes } from './errors.js';

const IDEMPOTENCY_PREFIX = 'idem:';
const IDEMPOTENCY_TTL = 24 * 60 * 60; // 24 hours

/**
 * Check if an idempotency key has already been processed.
 *
 * Uses Redis SET NX (SET if Not eXists) for atomicity — prevents
 * race conditions where two concurrent requests with the same
 * idempotency key could both pass the check.
 *
 * When Redis is unavailable, idempotency is NOT enforced (requests
 * always proceed). This is acceptable in dev mode but requires Redis
 * in production.
 *
 * @param {string} key - Idempotency key from client
 * @returns {Promise<{isNew: boolean, storedResult?: object}>}
 */
export async function checkIdempotency(key) {
  if (!key || !isRedisAvailable()) {
    return { isNew: true };
  }

  const redisKey = `${IDEMPOTENCY_PREFIX}${key}`;

  // Atomic: try to set "processing" only if the key doesn't exist.
  // SET key value NX EX ttl returns "OK" if set, null if key exists.
  const result = await redis.set(
    redisKey,
    JSON.stringify({ status: 'processing' }),
    'EX',
    IDEMPOTENCY_TTL,
    'NX',
  );

  if (result === 'OK') {
    // We claimed the key — this request proceeds
    return { isNew: true };
  }

  // Key already exists — check if it was completed
  const existing = await redis.get(redisKey);
  if (existing) {
    const parsed = JSON.parse(existing);
    if (parsed.status === 'completed') {
      throw new AppError(
        'This request was already processed',
        409,
        ErrorCodes.IDEMPOTENCY_KEY_REUSED,
        { existingResult: parsed.result },
      );
    }
    // Still processing from another concurrent request
    return { isNew: false, inProgress: true };
  }

  // Fallback: key somehow vanished (shouldn't happen with TTL)
  return { isNew: true };
}

/**
 * Mark an idempotency key as completed with the result.
 * @param {string} key - Idempotency key
 * @param {object} result - The response result to store
 */
export async function completeIdempotency(key, result) {
  if (!key || !isRedisAvailable()) return;
  const redisKey = `${IDEMPOTENCY_PREFIX}${key}`;
  await redis.setex(
    redisKey,
    IDEMPOTENCY_TTL,
    JSON.stringify({ status: 'completed', result }),
  );
}

/**
 * Release an idempotency key on error — allows retry.
 * @param {string} key - Idempotency key
 */
export async function releaseIdempotency(key) {
  if (!key || !isRedisAvailable()) return;
  const redisKey = `${IDEMPOTENCY_PREFIX}${key}`;
  await redis.del(redisKey);
}

export default { checkIdempotency, completeIdempotency, releaseIdempotency };
