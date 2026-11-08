import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env['NEXT_PUBLIC_SENTRY_DSN'] || process.env['SENTRY_DSN'],
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

// B1 smoke marker — the E2E gate polls this to prove the config actually
// ran in the browser (v11 no longer stamps __SENTRY__ at module load).
window.__GOB_SENTRY_READY__ = true;

declare global {
  interface Window {
    __GOB_SENTRY_READY__?: boolean;
  }
}
