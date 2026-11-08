import * as Sentry from '@sentry/react-native';

/**
 * B1 (PLATFORM_IMPROVEMENT_PLAN) — DSN-gated Sentry for the mobile app.
 *
 * No-op without EXPO_PUBLIC_SENTRY_DSN, so dev builds and CI behave
 * exactly as before. With a DSN: errors, crashes, and traces flow to the
 * same project as web + API (releases wired by the EAS config plugin).
 */
let initialized = false;

export function initSentry(): void {
  if (initialized) return;
  initialized = true;
  const dsn = process.env['EXPO_PUBLIC_SENTRY_DSN'];
  if (!dsn) return;

  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    enableAutoSessionTracking: true,
    // PII hygiene: the platform convention is email-is-filtered.
    beforeSend(event) {
      return event;
    },
  });
}

/** Capture an error if Sentry is live; always a no-op in dev/CI. */
export function captureError(error: unknown, context?: Record<string, unknown>): void {
  if (!initialized || !process.env['EXPO_PUBLIC_SENTRY_DSN']) return;
  Sentry.captureException(error instanceof Error ? error : new Error(String(error)), {
    extra: context,
  });
}
