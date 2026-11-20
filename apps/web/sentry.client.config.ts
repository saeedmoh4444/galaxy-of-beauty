import * as Sentry from '@sentry/nextjs';
import { isValidSentryDsn } from '@galaxy/shared';

const dsn = process.env['NEXT_PUBLIC_SENTRY_DSN'] || process.env['SENTRY_DSN'];

// Fail-closed (2026-11-20 platform run): Sentry.init throws "Invalid Sentry
// Dsn" on malformed values, and a throw at module scope breaks the whole
// client bundle. Missing or malformed DSN → console-only error tracking,
// matching the api package's console facade (lib/sentry.ts).
if (isValidSentryDsn(dsn)) {
  try {
    Sentry.init({
      dsn,
      tracesSampleRate: process.env['NODE_ENV'] === 'production' ? 0.1 : 1.0,
      replaysSessionSampleRate: 0.01,
      replaysOnErrorSampleRate: 1.0,
      integrations: [Sentry.replayIntegration(), Sentry.browserTracingIntegration()],
      beforeSend(event) {
        // Filter PII — don't send email/password fields
        if (event.request?.data) {
          const data = event.request.data as Record<string, unknown>;
          if (data['password']) delete data['password'];
          if (data['email']) data['email'] = '[filtered]';
        }
        return event;
      },
    });
  } catch (err) {
    console.warn('[Sentry] client init failed — error tracking disabled', err);
  }
} else {
  console.warn('[Sentry] DSN missing or invalid — client error tracking disabled');
}

// B1 smoke marker — the E2E gate polls this to prove the config actually
// ran in the browser (v11 no longer stamps __SENTRY__ at module load).
// Set unconditionally: the gate checks module evaluation, not whether a
// DSN was configured.
window.__GOB_SENTRY_READY__ = true;

declare global {
  interface Window {
    __GOB_SENTRY_READY__?: boolean;
  }
}
