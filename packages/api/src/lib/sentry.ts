// Sentry Node.js instrumentation stub.
// In production, initialize with: @sentry/node
// For now, provides a structured error-logging facade.

interface SentryScope {
  setTag(key: string, value: string): void;
  setUser(user: { id: number; email?: string; role?: string }): void;
  setExtra(key: string, value: unknown): void;
}

interface SentryClient {
  captureException(error: Error, scope?: Partial<SentryScope>): string;
  captureMessage(message: string, level?: 'info' | 'warning' | 'error'): string;
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
    const SentryNode = await Function('return import("@sentry/node")')();
    SentryNode.init({ dsn, tracesSampleRate: 0.1, environment: process.env['NODE_ENV'] || 'development' });
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
    sentry.captureException(error, {
      setExtra: (_key: string, _value: unknown) => {},
    } as SentryScope);
  }
  // Always log to console as fallback
  // eslint-disable-next-line no-console
  console.error('[Sentry]', error.message, context || '');
}

export async function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'error'): Promise<void> {
  const sentry = await getSentry();
  if (sentry) {
    sentry.captureMessage(message, level);
  }
  // eslint-disable-next-line no-console
  console.log(`[Sentry:${level}]`, message);
}
