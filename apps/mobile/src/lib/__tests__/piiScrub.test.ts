/**
 * W4-4 — the mobile Sentry beforeSend was a passthrough with an
 * aspirational "email-is-filtered" comment. These tests pin the REAL
 * scrubber: emails, Saudi phone numbers, and JWT-like tokens are
 * redacted recursively before anything leaves the device.
 */
import { describe, expect, it } from 'vitest';
import { scrubPii, scrubEvent } from '../piiScrub';

describe('scrubPii (W4-4)', () => {
  it('redacts emails in plain strings', () => {
    expect(scrubPii('contact alice@example.com please')).toBe('contact [email-redacted] please');
  });

  it('redacts Saudi phone numbers', () => {
    expect(scrubPii('call +966512345678 or 0551234567')).toBe(
      'call [phone-redacted] or [phone-redacted]',
    );
  });

  it('redacts JWT-like tokens', () => {
    const jwt =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6InRlc3QifQ.signature-abc123';
    expect(scrubPii(`token=${jwt}`)).toBe('token=[token-redacted]');
  });

  it('recurses into nested objects and arrays', () => {
    const input = {
      user: { email: 'sara@example.com', phone: '+966500000000' },
      tags: ['alice@example.com', 42, null],
      safe: 'keep me',
    };
    const out = scrubPii(input) as typeof input;
    expect(out.user.email).toBe('[email-redacted]');
    expect(out.user.phone).toBe('[phone-redacted]');
    expect(out.tags[0]).toBe('[email-redacted]');
    expect(out.tags[1]).toBe(42);
    expect(out.safe).toBe('keep me');
  });

  it('leaves non-string scalars untouched', () => {
    expect(scrubPii(42)).toBe(42);
    expect(scrubPii(null)).toBe(null);
    expect(scrubPii(true)).toBe(true);
  });

  it('scrubEvent redacts exception values, breadcrumbs and extras', () => {
    const event = scrubEvent({
      message: 'failed for alice@example.com',
      exception: { values: [{ type: 'Error', value: 'boom +966512345678' }] },
      breadcrumbs: [{ message: 'login by bob@example.com', timestamp: 1 }],
      extra: { contact: 'alice@example.com' },
    }) as Record<string, unknown>;

    expect(event.message).toContain('[email-redacted]');
    const values = (event.exception as { values: Array<{ value: string }> }).values;
    expect(values[0]!.value).toContain('[phone-redacted]');
    const crumbs = event.breadcrumbs as Array<{ message: string }>;
    expect(crumbs[0]!.message).toContain('[email-redacted]');
    expect((event.extra as Record<string, string>).contact).toBe('[email-redacted]');
  });
});
