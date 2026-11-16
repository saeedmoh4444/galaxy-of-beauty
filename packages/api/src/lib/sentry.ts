// Sentry Node.js instrumentation. Lazily initializes @sentry/node only
// when SENTRY_DSN is set; without it, provides a console-logging facade.

import type * as SentryNodeModule from '@sentry/node';

// The Function() wrapper keeps the spec out of bundler static analysis,
// since this package runs standalone AND bundled inside the web app.
export function loadSentryNode(): Promise<typeof SentryNodeModule> {
  return Function('return import("@sentry/node")')();
}

type SentryLoader = typeof loadSentryNode;
let sentryLoader: SentryLoader = loadSentryNode;

// Test seam: swap the loader (e.g., to simulate a missing/broken module).
export function _setSentryLoaderForTests(loader: SentryLoader): void {
  sentryLoader = loader;
}

interface SentryScope {
  setTag(key: string, value: string): void;
  setUser(user: { id: number; email?: string; role?: string }): void;
  setExtra(key: string, value: unknown): void;
}

interface SentryClient {
  captureException(error: Error, scope?: (scope: SentryScope) => void): string;
  captureMessage(message: string, level?: 'info' | 'warning' | 'error'): string;
  captureCheckIn?(checkIn: { monitorSlug: string; status: 'in_progress' | 'ok' | 'error' }): string;
}

let _sentry: SentryClient | null = null;

async function getSentry(): Promise<SentryClient | null> {
  if (_sentry !== null) return _sentry;
  const dsn = process.env['SENTRY_DSN'];

  if (!dsn) {
    _sentry = null;
    return null;
  }

  try {
    const SentryNode = await sentryLoader();
    const sampleRate = parseFloat(process.env['SENTRY_TRACES_SAMPLE_RATE'] || '0.1');
    SentryNode.init({
      dsn,
      tracesSampleRate: sampleRate,
      environment: process.env['NODE_ENV'] || 'development',
    });
    _sentry = SentryNode as SentryClient;
    return _sentry;
  } catch {
    _sentry = null;
    return null;
  }
}

export async function captureError(error: Error, context?: Record<string, unknown>): Promise<void> {
  const sentry = await getSentry();
  if (sentry) {
    // Real scope enrichment — @sentry/node accepts a scope callback, so
    // context keys land on the event as extras.
    sentry.captureException(error, (scope) => {
      for (const [key, value] of Object.entries(context ?? {})) {
        scope.setExtra(key, value);
      }
    });
  }
  // Always log to console as fallback
  console.error('[Sentry]', error.message, context || '');
}

export async function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'error',
): Promise<void> {
  const sentry = await getSentry();
  if (sentry) {
    sentry.captureMessage(message, level);
  }
  console.log(`[Sentry:${level}]`, message);
}

export type CheckInStatus = 'in_progress' | 'ok' | 'error';

/**
 * W6-5 — cron-monitor heartbeat. Sentry cron monitors track scheduled
 * work through check-ins; without them a silent scheduler death looks
 * like a healthy quiet period. DSN-gated like the rest of the facade:
 * without a DSN this is a console heartbeat only.
 */
export async function captureCheckIn(monitorSlug: string, status: CheckInStatus): Promise<void> {
  const sentry = await getSentry();
  if (sentry?.captureCheckIn) {
    sentry.captureCheckIn({ monitorSlug, status });
  }
  console.log(`[Sentry:checkin:${status}]`, monitorSlug);
}

/**
 * W6-5 — run a scheduled handler under a heartbeat: in_progress → ok, or
 * in_progress → error (and rethrow) so a failed sweep marks its monitor
 * red instead of disappearing into the console.
 */
export async function withHeartbeat<T>(monitorSlug: string, fn: () => Promise<T>): Promise<T> {
  await captureCheckIn(monitorSlug, 'in_progress');
  try {
    const result = await fn();
    await captureCheckIn(monitorSlug, 'ok');
    return result;
  } catch (err) {
    await captureCheckIn(monitorSlug, 'error');
    throw err;
  }
}
