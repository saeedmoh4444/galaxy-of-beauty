/**
 * Sentry instrumentation (D4) — Next.js convention: registers the
 * server/edge SDK configs per runtime. The configs no-op without a DSN,
 * so local dev and CI behave exactly as before.
 */
export async function register(): Promise<void> {
  if (process.env['NEXT_RUNTIME'] === 'nodejs') {
    await import('./sentry.server.config');
  }
  if (process.env['NEXT_RUNTIME'] === 'edge') {
    await import('./sentry.edge.config');
  }
}
