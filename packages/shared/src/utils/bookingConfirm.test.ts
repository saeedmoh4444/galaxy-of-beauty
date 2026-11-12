import { describe, it, expect } from 'vitest';
import { buildBookingConfirmHref } from './bookingConfirm';

/**
 * W2-4 (audit 2026-11-11) — the confirm screens showed a placeholder
 * '———' code because the create flows never passed ?code=&date=.
 * This helper builds the confirm href; the create pages (web + mobile)
 * call it in their onSuccess.
 */
describe('buildBookingConfirmHref', () => {
  it('appends code and date when both are present', () => {
    const href = buildBookingConfirmHref(
      '/bookings/confirm',
      'GOB-A1B2C3D4',
      '2026-11-13T07:00:00.000Z',
    );
    expect(href).toBe('/bookings/confirm?code=GOB-A1B2C3D4&date=2026-11-13T07%3A00%3A00.000Z');
  });

  it('accepts a Date and serializes it to ISO', () => {
    const date = new Date('2026-11-13T07:00:00.000Z');
    const href = buildBookingConfirmHref('/bookings/confirm', 'GOB-A1B2C3D4', date);
    expect(href).toContain('code=GOB-A1B2C3D4');
    expect(href).toContain(`date=${encodeURIComponent(date.toISOString())}`);
  });

  it('omits missing params and keeps the bare path when both are absent', () => {
    expect(buildBookingConfirmHref('/bookings/confirm', undefined, undefined)).toBe(
      '/bookings/confirm',
    );
    expect(buildBookingConfirmHref('/bookings/confirm', null, '2026-11-13T07:00:00.000Z')).toBe(
      '/bookings/confirm?date=2026-11-13T07%3A00%3A00.000Z',
    );
    expect(buildBookingConfirmHref('/bookings/confirm', 'GOB-A1B2C3D4', null)).toBe(
      '/bookings/confirm?code=GOB-A1B2C3D4',
    );
  });

  it('works for the mobile pathname too', () => {
    const href = buildBookingConfirmHref(
      '/customer/bookings/confirm',
      'GOB-A1B2C3D4',
      '2026-11-13T07:00:00.000Z',
    );
    expect(href).toBe(
      '/customer/bookings/confirm?code=GOB-A1B2C3D4&date=2026-11-13T07%3A00%3A00.000Z',
    );
  });
});
