import pino from 'pino';

/**
 * Structured JSON logger for production log aggregation.
 *
 * Features (OPS-002):
 * - Request correlation via `correlationId` (set from X-Request-ID header)
 * - Service/version/environment metadata on every log line
 * - Automatic redaction of sensitive fields
 * - Pino-pretty in development, raw JSON in production
 *
 * Usage:
 *   import { logger } from '../lib/logger';
 *   logger.info({ userId: 123, correlationId }, 'User logged in');
 *   logger.error({ err, bookingId, correlationId }, 'Booking creation failed');
 */

const SERVICE_NAME = 'galaxy-of-beauty-api';
const SERVICE_VERSION = process.env['APP_VERSION'] || '0.0.0';

export const logger = pino({
  name: SERVICE_NAME,
  level: process.env['LOG_LEVEL'] || (process.env['NODE_ENV'] === 'production' ? 'info' : 'debug'),
  base: {
    service: SERVICE_NAME,
    version: SERVICE_VERSION,
    env: process.env['NODE_ENV'] || 'development',
  },
  redact: {
    paths: [
      'password',
      'passwordHash',
      'token',
      'accessToken',
      'refreshToken',
      'secret',
      'apiKey',
      'authorization',
      'cookie',
      'set-cookie',
    ],
    censor: '[REDACTED]',
  },
  // Add timestamp in ISO format for log aggregation
  timestamp: pino.stdTimeFunctions.isoTime,
});

/**
 * Create a child logger with a correlation ID for request tracing.
 * Call at the start of every request handler.
 *
 * Usage:
 *   const log = logger.child({ correlationId: ctx.correlationId });
 *   log.info('Processing request');
 */
export function withCorrelation(correlationId: string): pino.Logger {
  return logger.child({ correlationId });
}
