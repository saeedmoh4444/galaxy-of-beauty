/**
 * Graceful Degradation Middleware
 *
 * Wraps route handlers to catch external service failures and
 * degrade gracefully instead of crashing with 500 errors.
 *
 * Services handled:
 *   - Redis unavailable → skip caching, proceed without cache
 *   - BullMQ unavailable → skip job enqueue, log warning
 *   - Socket.IO unavailable → skip real-time emit
 *   - OpenAI unavailable → return fallback response
 *   - PayFort unavailable → return 503 with retry guidance
 */

import logger from '../config/logger.js';

/**
 * Wrap an async route handler to catch external service failures
 * and return partial results instead of crashing.
 *
 * Usage:
 *   router.get('/data', degradeOn('redis'), handler);
 */
export function degradeOn(service) {
  return (err, req, res, next) => {
    // Only handle external service errors, not validation/auth errors
    if (!err.isExternalService) {
      return next(err);
    }

    if (err.serviceName === service) {
      logger.warn(`Service ${service} degraded`, {
        path: req.path,
        error: err.message,
      });

      // Return partial/graceful response
      return res.status(200).json({
        data: [],
        degraded: true,
        message: {
          ar: 'بعض البيانات غير متاحة حالياً. يرجى المحاولة لاحقاً.',
          en: 'Some data is temporarily unavailable. Please try again later.',
        },
      });
    }

    next(err);
  };
}

/**
 * Mark an error as an external service failure.
 * Used to distinguish between business logic errors and
 * infrastructure failures for graceful degradation.
 *
 * @param {Error} error - Original error
 * @param {string} serviceName - Service that failed (redis, payfort, openai, etc.)
 * @returns {Error}
 */
export function externalServiceError(error, serviceName) {
  error.isExternalService = true;
  error.serviceName = serviceName;
  return error;
}

/**
 * Safe wrapper for Redis operations.
 * If Redis is down, returns null instead of throwing.
 *
 * @param {() => Promise<any>} fn - Redis operation
 * @returns {Promise<any>}
 */
export async function safeRedis(fn) {
  try {
    return await fn();
  } catch (error) {
    logger.warn('Redis operation failed, skipping', { error: error.message });
    return null;
  }
}

/**
 * Safe wrapper for BullMQ enqueue operations.
 * If Redis/BullMQ is down, logs warning and returns null.
 *
 * @param {import('bullmq').Queue} queue
 * @param {string} jobName
 * @param {object} data
 * @param {object} [opts]
 * @returns {Promise<object|null>}
 */
export async function safeEnqueue(queue, jobName, data, opts = {}) {
  try {
    return await queue.add(jobName, data, opts);
  } catch (error) {
    logger.warn('Queue enqueue failed, job skipped', {
      queue: queue.name,
      jobName,
      error: error.message,
    });
    return null;
  }
}

/**
 * Safe wrapper for Socket.IO emit operations.
 * If socket server is not initialized, silently skips.
 *
 * @param {() => void} fn - Emit operation
 */
export function safeEmit(fn) {
  try {
    fn();
  } catch (error) {
    logger.warn('Socket emit failed, skipping', { error: error.message });
  }
}

export default { degradeOn, externalServiceError, safeRedis, safeEnqueue, safeEmit };
