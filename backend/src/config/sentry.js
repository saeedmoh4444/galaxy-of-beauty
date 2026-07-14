import env from './env.js';
import logger from './logger.js';

/**
 * Sentry error tracking integration.
 *
 * Reports unhandled errors, unhandled promise rejections, and
 * provides request-level error context.
 *
 * In development: errors are logged but not sent to Sentry.
 * In production: errors are reported to the configured Sentry DSN.
 */

let Sentry = null;

/**
 * Initialize Sentry if DSN is configured.
 * Call once at application startup.
 */
export async function initializeSentry() {
  if (!env.SENTRY_DSN) {
    logger.info('Sentry DSN not configured — error tracking disabled');
    return;
  }

  try {
    Sentry = await import('@sentry/node');

    Sentry.init({
      dsn: env.SENTRY_DSN,
      environment: env.NODE_ENV,
      tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,
      profilesSampleRate: 0.1,
      // Ignore common non-actionable errors
      ignoreErrors: [
        'ECONNREFUSED',
        'ECONNRESET',
        'socket hang up',
        'PrismaClientKnownRequestError',
      ],
      beforeSend(event) {
        // Don't send events in development
        if (env.NODE_ENV === 'development') return null;
        return event;
      },
    });

    logger.info('Sentry initialized');
  } catch (error) {
    logger.warn('Failed to initialize Sentry', { error: error.message });
  }
}

/**
 * Capture an error in Sentry with optional context.
 *
 * @param {Error} error
 * @param {object} [context] - Extra context (userId, requestId, etc.)
 */
export function captureError(error, context = {}) {
  if (!Sentry) {
    logger.error('Error (Sentry not configured)', {
      error: error.message,
      stack: error.stack,
      ...context,
    });
    return;
  }

  Sentry.withScope((scope) => {
    if (context.userId) scope.setUser({ id: context.userId });
    if (context.requestId) scope.setTag('requestId', context.requestId);
    if (context.path) scope.setTag('path', context.path);
    if (context.method) scope.setTag('method', context.method);
    scope.setExtras(context);

    Sentry.captureException(error);
  });
}

/**
 * Capture a warning/non-fatal message in Sentry.
 *
 * @param {string} message
 * @param {object} [context]
 */
export function captureMessage(message, context = {}) {
  if (!Sentry) {
    logger.warn(message, context);
    return;
  }

  Sentry.withScope((scope) => {
    scope.setExtras(context);
    Sentry.captureMessage(message, 'warning');
  });
}

/**
 * Express middleware: set up Sentry request handler.
 * Must be the first middleware in the chain.
 */
export function sentryRequestHandler() {
  if (!Sentry) return (_req, _res, next) => next();
  return Sentry.Handlers.requestHandler();
}

/**
 * Express middleware: set up Sentry error handler.
 * Must be the last error handler in the chain (after custom errorHandler).
 */
export function sentryErrorHandler() {
  if (!Sentry) return (err, _req, _res, next) => next(err);
  return Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      // Only report 5xx and unhandled errors
      return !error.statusCode || error.statusCode >= 500;
    },
  });
}

export default { initializeSentry, captureError, captureMessage, sentryRequestHandler, sentryErrorHandler };
