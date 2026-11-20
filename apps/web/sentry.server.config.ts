import * as Sentry from '@sentry/nextjs';
import { isValidSentryDsn } from '@galaxy/shared';

const dsn = process.env['SENTRY_DSN'];

// Fail-closed, same policy as sentry.client.config.ts.
if (isValidSentryDsn(dsn)) {
  try {
    Sentry.init({
      dsn,
      tracesSampleRate: process.env['NODE_ENV'] === 'production' ? 0.1 : 1.0,
      environment: process.env['NODE_ENV'] || 'development',
    });
  } catch (err) {
    console.warn('[Sentry] server init failed — error tracking disabled', err);
  }
} else {
  console.warn('[Sentry] DSN missing or invalid — server error tracking disabled');
}
