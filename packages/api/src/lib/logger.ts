import pino from 'pino';

/**
 * Structured JSON logger for production log aggregation.
 * In production, outputs raw JSON for services like Datadog, CloudWatch, etc.
 *
 * Usage:
 *   import { logger } from '../lib/logger';
 *   logger.info({ userId: 123 }, 'User logged in');
 *   logger.error({ err, bookingId }, 'Booking creation failed');
 */
export const logger = pino({
  level: process.env['LOG_LEVEL'] || (process.env['NODE_ENV'] === 'production' ? 'info' : 'debug'),
  // pino-pretty transport disabled in dev due to worker thread incompatibility with Next.js webpack
  redact: {
    paths: ['password', 'passwordHash', 'token', 'secret', 'apiKey', 'authorization'],
    censor: '[REDACTED]',
  },
});
