'use client';

import dynamic from 'next/dynamic';

/**
 * B1 — mounts the sentry client config in the browser. Turbopack does
 * not auto-inject sentry.client.config.ts (webpack-era behavior), so it
 * is imported here — DYNAMICALLY, so the SDK (~90 KB) lands in its own
 * chunk and never weighs any page's initial bundle (the FE-007 size
 * gate enforces that). The build gate greps the produced chunk for the
 * config's ready-marker.
 */
const SentryBootstrap = dynamic(
  () =>
    import('../../sentry.client.config')
      .then(() => ({ default: () => null }))
      // A failed chunk fetch must never take down the page — Sentry is
      // best-effort telemetry, not application functionality.
      .catch(() => ({ default: () => null })),
  { ssr: false },
);

export function SentryInit() {
  return <SentryBootstrap />;
}
