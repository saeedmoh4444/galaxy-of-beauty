/**
 * Performance Monitoring Middleware
 *
 * Tracks response times, detects slow requests, sets timeouts,
 * and adds API versioning headers.
 */

import logger from '../config/logger.js';

const SLOW_THRESHOLD_MS = 1000; // Log warnings for requests > 1s
const CRITICAL_THRESHOLD_MS = 5000; // Log errors for requests > 5s
const DEFAULT_TIMEOUT_MS = 30000; // 30 second request timeout

/**
 * Track response time for every request.
 * Logs a warning for slow requests and an error for very slow ones.
 */
export function responseTimeMiddleware(req, res, next) {
  const start = Date.now();

  // Hook into response finish
  const originalEnd = res.end;
  res.end = function (...args) {
    const duration = Date.now() - start;
    res.set('X-Response-Time-Ms', String(duration));

    if (duration > CRITICAL_THRESHOLD_MS) {
      logger.error('CRITICAL slow request', {
        method: req.method,
        path: req.originalUrl,
        duration,
        statusCode: res.statusCode,
      });
    } else if (duration > SLOW_THRESHOLD_MS) {
      logger.warn('Slow request', {
        method: req.method,
        path: req.originalUrl,
        duration,
        statusCode: res.statusCode,
      });
    }

    return originalEnd.apply(res, args);
  };

  next();
}

/**
 * Request timeout middleware.
 * Aborts requests that take too long with a 504 Gateway Timeout.
 *
 * @param {number} [timeoutMs] - Timeout in milliseconds
 */
export function timeoutMiddleware(timeoutMs = DEFAULT_TIMEOUT_MS) {
  return (req, res, next) => {
    // Skip timeout for file uploads (they need longer)
    if (req.path.includes('/kyc') || req.path.includes('/upload')) {
      return next();
    }

    const timer = setTimeout(() => {
      if (!res.headersSent) {
        logger.error('Request timeout', {
          method: req.method,
          path: req.originalUrl,
          timeout: timeoutMs,
        });

        res.status(504).json({
          error: {
            code: 'REQUEST_TIMEOUT',
            message: 'Request took too long to process',
            messageAr: 'استغرقت المعالجة وقتاً طويلاً. يرجى المحاولة مرة أخرى.',
            requestId: req.requestId,
          },
        });
      }
    }, timeoutMs);

    // Clear timer when response finishes
    const originalEnd = res.end;
    res.end = function (...args) {
      clearTimeout(timer);
      return originalEnd.apply(res, args);
    };

    next();
  };
}

/**
 * Add API version header to all responses.
 */
export function apiVersionMiddleware(req, res, next) {
  res.set({
    'X-API-Version': '1.0.0',
    'X-API-Deprecated': 'false',
    'X-Powered-By': 'Galaxy of Beauty',
  });
  next();
}

/**
 * Set Connection: keep-alive with timeout for efficient connection reuse.
 */
export function connectionMiddleware(req, res, next) {
  // Keep-alive for 60 seconds (matches typical load balancer settings)
  res.set('Connection', 'keep-alive');
  res.set('Keep-Alive', 'timeout=60, max=1000');
  next();
}

export default {
  responseTimeMiddleware,
  timeoutMiddleware,
  apiVersionMiddleware,
  connectionMiddleware,
  SLOW_THRESHOLD_MS,
  CRITICAL_THRESHOLD_MS,
};
