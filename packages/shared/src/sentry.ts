/**
 * Minimal Sentry DSN shape check — callers use it to fail closed before
 * Sentry.init, which throws "Invalid Sentry Dsn" on malformed values and
 * (at module scope) breaks the whole bundle. Shape (public format):
 *
 *   https://<32-hex-public-key>@<host>/<numeric-project-id>
 *
 * 2026-11-20 platform run: a dev .env carried a DSN with the key glued to
 * the host (dot instead of `@`) — every client load threw at module
 * evaluation. Kept deliberately permissive beyond the separator/key/project
 * checks (self-hosted hosts, any TLD) — the SDK re-validates internally.
 */
export function isValidSentryDsn(dsn: string | undefined | null): boolean {
  if (!dsn) return false;
  return /^https:\/\/[a-f0-9]{32}@.+\/\d+$/i.test(dsn);
}
