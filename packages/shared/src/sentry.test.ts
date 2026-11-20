import { describe, it, expect } from 'vitest';
import { isValidSentryDsn } from './sentry';

describe('isValidSentryDsn', () => {
  it('accepts a real-shaped Sentry DSN', () => {
    expect(
      isValidSentryDsn(
        'https://0123456789abcdef0123456789abcdef@o0.ingest.sentry.io/4500000000000000',
      ),
    ).toBe(true);
    expect(
      isValidSentryDsn('https://abcdef0123456789abcdef0123456789@mysentry.example.com/123'),
    ).toBe(true);
  });

  it('rejects missing or empty values', () => {
    expect(isValidSentryDsn(undefined)).toBe(false);
    expect(isValidSentryDsn(null)).toBe(false);
    expect(isValidSentryDsn('')).toBe(false);
  });

  it('rejects the malformed dev DSN (missing @ separator)', () => {
    // The exact shape that broke the 2026-11-20 platform run: key glued to
    // the host with a dot instead of the required @ separator.
    expect(
      isValidSentryDsn(
        'https://6f724feb3c252f435f2053cba6f8a798.ingest.us.sentry.io/4512191087247360',
      ),
    ).toBe(false);
  });

  it('rejects non-DSN junk', () => {
    expect(isValidSentryDsn('https://xxx@xxx.ingest.sentry.io/xxx')).toBe(false);
    expect(isValidSentryDsn('not-a-url')).toBe(false);
    expect(isValidSentryDsn('https://short@host.com/1')).toBe(false); // key not 32 hex
  });
});
