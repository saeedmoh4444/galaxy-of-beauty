'use client';

// B1 — Turbopack does NOT auto-inject sentry.client.config.ts (the
// webpack-era behavior); withSentryConfig alone left the SDK out of the
// built chunks (proven by scripts/check-sentry-bundle.mjs). Importing
// the config from a client component mounted in the root layout forces
// it into the browser bundle — init + the ready marker run on load,
// DSN-gated exactly as before.
import '../../sentry.client.config';

export function SentryInit(): null {
  return null;
}
