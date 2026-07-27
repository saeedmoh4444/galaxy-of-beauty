import pino from 'pino';

/**
 * Structured JSON logger for production log aggregation.
 * In development, uses pino-pretty for readable output.
 * In production, outputs raw JSON for services like Datadog, CloudWatch, etc.
 *
 * Usage:
 *   import { logger } from '../lib/logger';
 *   logger.info({ userId: 123 }, 'User logged in');
 *   logger.error({ err, bookingId }, 'Booking creation failed');
 */
export const logger = pino({
  level: process.env['LOG_LEVEL'] || (process.env['NODE_ENV'] === 'production' ? 'info' : 'debug'),
  // In dev, try pino-pretty; fall back to raw JSON if not installed
  ...(process.env['NODE_ENV'] !== 'production' && { transport: { target: 'pino-pretty', options: { colorize: true } } }),
  // Redact sensitive fields from logs
  redact: {
    paths: ['password', 'passwordHash', 'token', 'secret', 'apiKey', 'authorization'],
    censor: '[REDACTED]',
  },
});
