/**
 * 6.5 WhatsApp transport tests — Cloud API sender (env-gated) + KSA phone
 * normalization. The transport is failure-tolerant and NEVER throws:
 * unconfigured or failing sends log and return false, so the notification
 * worker can treat WhatsApp like any other best-effort channel.
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import { isWhatsAppConfigured, normalizeKsaPhone, sendWhatsAppText } from '../lib/whatsapp';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('normalizeKsaPhone', () => {
  it('converts local 05x numbers to E.164-ish 966 format', () => {
    expect(normalizeKsaPhone('0501234567')).toBe('966501234567');
    expect(normalizeKsaPhone('+966 50 123 4567')).toBe('966501234567');
    expect(normalizeKsaPhone('966501234567')).toBe('966501234567');
  });

  it('strips separators and a leading zero', () => {
    expect(normalizeKsaPhone('05 0123-4567')).toBe('966501234567');
  });

  it('returns null for non-KSA numbers (platform is KSA-only)', () => {
    expect(normalizeKsaPhone('+12025550123')).toBeNull();
    expect(normalizeKsaPhone('+971501234567')).toBeNull();
    expect(normalizeKsaPhone('')).toBeNull();
  });
});

describe('isWhatsAppConfigured', () => {
  it('is false without credentials', () => {
    vi.stubEnv('WHATSAPP_TOKEN', '');
    vi.stubEnv('WHATSAPP_PHONE_NUMBER_ID', '');
    expect(isWhatsAppConfigured()).toBe(false);
  });

  it('is true with both credentials', () => {
    vi.stubEnv('WHATSAPP_TOKEN', 'token');
    vi.stubEnv('WHATSAPP_PHONE_NUMBER_ID', '12345');
    expect(isWhatsAppConfigured()).toBe(true);
  });
});

describe('sendWhatsAppText', () => {
  it('skips silently (returns false, no fetch) without credentials', async () => {
    vi.stubEnv('WHATSAPP_TOKEN', '');
    vi.stubEnv('WHATSAPP_PHONE_NUMBER_ID', '');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await expect(sendWhatsAppText('0501234567', 'hello')).resolves.toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns false for non-KSA numbers', async () => {
    vi.stubEnv('WHATSAPP_TOKEN', 'token');
    vi.stubEnv('WHATSAPP_PHONE_NUMBER_ID', '12345');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await expect(sendWhatsAppText('+12025550123', 'hello')).resolves.toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('POSTs a text message to the Cloud API with the Bearer token', async () => {
    vi.stubEnv('WHATSAPP_TOKEN', 'token-123');
    vi.stubEnv('WHATSAPP_PHONE_NUMBER_ID', '555123');
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    await expect(sendWhatsAppText('0501234567', 'مرحباً')).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('555123');
    expect((init.headers as Record<string, string>)['Authorization']).toBe('Bearer token-123');
    const body = JSON.parse(init.body as string) as Record<string, unknown>;
    expect(body['to']).toBe('966501234567');
    expect(body['messaging_product']).toBe('whatsapp');
    expect(body['type']).toBe('text');
  });

  it('returns false when the API responds non-ok (never throws)', async () => {
    vi.stubEnv('WHATSAPP_TOKEN', 'token');
    vi.stubEnv('WHATSAPP_PHONE_NUMBER_ID', '12345');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    await expect(sendWhatsAppText('0501234567', 'hello')).resolves.toBe(false);
  });

  it('returns false when fetch throws (never propagates)', async () => {
    vi.stubEnv('WHATSAPP_TOKEN', 'token');
    vi.stubEnv('WHATSAPP_PHONE_NUMBER_ID', '12345');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
    await expect(sendWhatsAppText('0501234567', 'hello')).resolves.toBe(false);
  });
});
