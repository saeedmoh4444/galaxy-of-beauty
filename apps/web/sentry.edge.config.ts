import * as Sentry from '@sentry/nextjs';
import { isValidSentryDsn } from '@galaxy/shared';

const dsn = process.env['SENTRY_DSN'];

// Fail-closed, same policy as sentry.client.config.ts: a malformed DSN must
// not throw at module scope in the edge runtime.
if (isValidSentryDsn(dsn)) {
  try {
    Sentry.init({
      dsn,
      tracesSampleRate: 0,
    });
  } catch (err) {
    console.warn('[Sentry] edge init failed — error tracking disabled', err);
  }
} else {
  console.warn('[Sentry] DSN missing or invalid — edge error tracking disabled');
}
