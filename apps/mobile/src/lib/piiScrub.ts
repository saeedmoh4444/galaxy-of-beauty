/**
 * W4-4 — PII scrubber for the Sentry beforeSend hook. Emails, Saudi phone
 * numbers and JWT-like tokens never leave the device. Pure + unit-tested
 * (mobile node suite).
 */

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
// Saudi formats: +9665XXXXXXXX, 9665XXXXXXXX, 05XXXXXXXX (10 digits).
const PHONE_RE = /(\+?966)?0?5\d{8}/g;
// JWT-like: three base64url segments separated by dots.
const JWT_RE = /[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}/g;

export function scrubString(text: string): string {
  return text
    .replace(EMAIL_RE, '[email-redacted]')
    .replace(PHONE_RE, '[phone-redacted]')
    .replace(JWT_RE, '[token-redacted]');
}

export function scrubPii(value: unknown): unknown {
  if (typeof value === 'string') return scrubString(value);
  if (Array.isArray(value)) return value.map(scrubPii);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = scrubPii(v);
    }
    return out;
  }
  return value;
}

/** Minimal structural type for the Sentry event shape we scrub. */
interface ScrubEventShape {
  message?: string;
  exception?: { values?: Array<{ type?: string; value?: string }> };
  breadcrumbs?: Array<{ message?: string; data?: unknown; timestamp?: number }>;
  extra?: Record<string, unknown>;
  [key: string]: unknown;
}

export function scrubEvent(event: ScrubEventShape): ScrubEventShape {
  const out = scrubPii(event) as ScrubEventShape;
  return out;
}
