/**
 * SMS lib tests — the no-config dev path, the Twilio REST flow with a
 * mocked fetch, failure paths, and the templated messages.
 * (Coverage ratchet target: src/lib/sms.ts — was 1.6%)
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  sendSms,
  sendBookingConfirmationSms,
  sendBookingReminderSms,
  sendOtpSms,
} from '../lib/sms';

const TWILIO_ENV = ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER'] as const;

function setTwilioConfig(): void {
  process.env['TWILIO_ACCOUNT_SID'] = 'AC-test';
  process.env['TWILIO_AUTH_TOKEN'] = 'secret-token';
  process.env['TWILIO_PHONE_NUMBER'] = '+966500000000';
}

describe('sms lib', () => {
  afterEach(() => {
    for (const key of TWILIO_ENV) delete process.env[key];
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('sendSms', () => {
    it('returns true and logs when Twilio is not configured', async () => {
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const ok = await sendSms('+966500000001', 'مرحباً');
      expect(ok).toBe(true);
      expect(spy).toHaveBeenCalled();
    });

    it('sends a Basic-authed Twilio request and returns response.ok', async () => {
      setTwilioConfig();
      const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 201 }));
      vi.stubGlobal('fetch', fetchMock);

      const ok = await sendSms('+966500000001', 'مرحباً');
      expect(ok).toBe(true);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toContain('/Accounts/AC-test/Messages.json');
      expect(String(init.headers?.['Authorization'])).toBe(
        `Basic ${Buffer.from('AC-test:secret-token').toString('base64')}`,
      );
      expect(init.method).toBe('POST');
      expect(String(init.body)).toContain('To=%2B966500000001');
    });

    it('returns false on a non-2xx Twilio response', async () => {
      setTwilioConfig();
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 401 })));
      const ok = await sendSms('+966500000001', 'مرحباً');
      expect(ok).toBe(false);
    });

    it('returns false when the fetch throws', async () => {
      setTwilioConfig();
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
      const ok = await sendSms('+966500000001', 'مرحباً');
      expect(ok).toBe(false);
      expect(errSpy).toHaveBeenCalled();
    });
  });

  describe('templated messages', () => {
    it('builds Arabic and English booking confirmation messages', async () => {
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      await sendBookingConfirmationSms('+966500000001', 'GOB-1234', '2026-09-01');
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('GOB-1234'));
      await sendBookingConfirmationSms('+966500000001', 'GOB-1234', '2026-09-01', 'en');
      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining('Galaxy of Beauty booking is confirmed'),
      );
    });

    it('builds Arabic and English reminder messages with hours', async () => {
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      await sendBookingReminderSms('+966500000001', 'GOB-1234', 3);
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('3 ساعة'));
      await sendBookingReminderSms('+966500000001', 'GOB-1234', 3, 'en');
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('in 3 hours'));
    });

    it('builds the bilingual OTP message', async () => {
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      await sendOtpSms('+966500000001', '123456');
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('123456'));
    });
  });
});
