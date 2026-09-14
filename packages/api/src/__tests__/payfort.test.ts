/**
 * PayFort gateway tests — signature generation/verification, the
 * development stub path, and the live authorization flow via a mocked
 * fetch. (Coverage ratchet target: src/lib/payfort.ts — was 31.92%)
 */
import { createHash } from 'crypto';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  generateRequestSignature,
  verifyResponseSignature,
  authorizePayment,
  verifyWebhookSignature,
  isPayFortConfigured,
} from '../lib/payfort';

const PAYFORT_ENV = [
  'PAYFORT_MERCHANT_ID',
  'PAYFORT_ACCESS_CODE',
  'PAYFORT_SHA_REQUEST_PHRASE',
  'PAYFORT_SHA_RESPONSE_PHRASE',
  'PAYFORT_SANDBOX',
] as const;

function setGatewayConfig(sandbox = 'true'): void {
  process.env['PAYFORT_MERCHANT_ID'] = 'TEST_MERCHANT';
  process.env['PAYFORT_ACCESS_CODE'] = 'TEST_ACCESS';
  process.env['PAYFORT_SHA_REQUEST_PHRASE'] = 'test-request-phrase';
  process.env['PAYFORT_SHA_RESPONSE_PHRASE'] = 'test-response-phrase';
  process.env['PAYFORT_SANDBOX'] = sandbox;
}

function clearGatewayConfig(): void {
  for (const key of PAYFORT_ENV) delete process.env[key];
}

beforeEach(clearGatewayConfig);
afterEach(() => {
  clearGatewayConfig();
  vi.unstubAllGlobals();
});

// ── Signature generation ────────────────────────────────────

describe('generateRequestSignature', () => {
  it('sorts keys alphabetically and appends the phrase', () => {
    const sig = generateRequestSignature({ b: '2', a: '1' }, 'secret');
    // sha256('a=1b=2secret')
    expect(sig).toBe('8c5aab83ca09877f08eacf84c9db85355699e3b45b054d5d2f028a2e95bdbc35');
  });

  it('hashes the concatenation alone when the phrase is empty', () => {
    const sig = generateRequestSignature({ b: '2', a: '1' }, '');
    // sha256('a=1b=2')
    expect(sig).toBe('94c1dc2f3087f8bdab990bda40608b0e51606354ecea4b052c409a5004dc8128');
  });

  it('skips the signature key, undefined, and empty values', () => {
    const sig = generateRequestSignature(
      { b: '2', a: '1', signature: 'prev', empty: '', undef: undefined } as Record<string, string>,
      'secret',
    );
    expect(sig).toBe('8c5aab83ca09877f08eacf84c9db85355699e3b45b054d5d2f028a2e95bdbc35');
  });

  it('ignores phrase whitespace content literally', () => {
    const sig1 = generateRequestSignature({ a: '1' }, 'phr');
    // sha256('a=1phr')
    expect(sig1).toBe(cryptoSha('a=1phr'));
  });
});

// ── Signature verification ──────────────────────────────────

describe('verifyResponseSignature', () => {
  const params = { b: '2', a: '1' };
  const phrase = 'secret';
  const valid = '8c5aab83ca09877f08eacf84c9db85355699e3b45b054d5d2f028a2e95bdbc35';

  it('accepts a correct signature', () => {
    expect(verifyResponseSignature(params, phrase, valid)).toBe(true);
  });

  it('rejects a tampered signature', () => {
    expect(verifyResponseSignature(params, phrase, '0'.repeat(64))).toBe(false);
  });

  it('rejects a malformed signature instead of throwing', () => {
    // timingSafeEqual throws on length mismatch — the wrapper must return false.
    expect(verifyResponseSignature(params, phrase, 'abc')).toBe(false);
  });
});

// ── Authorization ───────────────────────────────────────────

describe('authorizePayment', () => {
  it('returns a development stub when the gateway is unconfigured', async () => {
    const result = await authorizePayment({
      amount: 150,
      customerEmail: 'cust@test.local',
      customerName: 'Test Customer',
      merchantReference: 'BOOK-1',
      returnUrl: 'http://localhost:3000/checkout/return',
    });
    expect(result.success).toBe(true);
    expect(result.paymentUrl).toBeNull();
    expect(result.gatewayRef).toMatch(/^DEV-/);
    expect(result.message).toContain('development stub');
  });

  it('sends amount in minor units with a valid request signature', async () => {
    setGatewayConfig();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ response_code: '20064', '3ds_url': 'https://3ds' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await authorizePayment({
      amount: 150.5,
      customerEmail: 'cust@test.local',
      customerName: 'Test Customer',
      merchantReference: 'BOOK-2',
      returnUrl: 'http://localhost:3000/checkout/return',
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://sbcheckout.payfort.com/FortAPI/paymentPage');
    const body = JSON.parse(String(init?.body)) as Record<string, string>;
    expect(body['amount']).toBe('15050');
    expect(body['merchant_reference']).toBe('BOOK-2');
    expect(body['language']).toBe('ar');
    // Signature must verify against the request params + request phrase
    const { signature, ...rest } = body;
    expect(generateRequestSignature(rest, 'test-request-phrase')).toBe(signature);

    expect(result.success).toBe(true);
    expect(result.paymentUrl).toBe('https://3ds');
    expect(result.fortId).toBeNull();
  });

  it('treats response code 20000 as success', async () => {
    setGatewayConfig();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ response_code: '20000', fort_id: 'F1' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );

    const result = await authorizePayment({
      amount: 100,
      customerEmail: 'cust@test.local',
      customerName: 'Test Customer',
      merchantReference: 'BOOK-3',
      returnUrl: 'http://localhost:3000/checkout/return',
    });
    expect(result.success).toBe(true);
    expect(result.gatewayRef).toBe('F1');
  });

  it('maps non-success response codes to failure with the gateway message', async () => {
    setGatewayConfig();
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({ response_code: '00014', response_message: 'Invalid card' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          ),
        ),
    );

    const result = await authorizePayment({
      amount: 100,
      customerEmail: 'cust@test.local',
      customerName: 'Test Customer',
      merchantReference: 'BOOK-4',
      returnUrl: 'http://localhost:3000/checkout/return',
    });
    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid card');
  });

  it('uses the production endpoint when sandbox is disabled', async () => {
    setGatewayConfig('false');
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ response_code: '20000' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await authorizePayment({
      amount: 100,
      customerEmail: 'cust@test.local',
      customerName: 'Test Customer',
      merchantReference: 'BOOK-5',
      returnUrl: 'http://localhost:3000/checkout/return',
    });

    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toBe('https://checkout.payfort.com/FortAPI/paymentPage');
  });

  it('returns failure when the gateway request throws', async () => {
    setGatewayConfig();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));

    const result = await authorizePayment({
      amount: 100,
      customerEmail: 'cust@test.local',
      customerName: 'Test Customer',
      merchantReference: 'BOOK-6',
      returnUrl: 'http://localhost:3000/checkout/return',
    });
    expect(result.success).toBe(false);
    expect(result.message).toContain('network down');
  });
});

// ── Webhook verification ────────────────────────────────────

describe('verifyWebhookSignature', () => {
  it('returns false when the gateway is unconfigured', () => {
    expect(verifyWebhookSignature({ a: '1' }, 'whatever')).toBe(false);
  });

  it('verifies against the response phrase when configured', () => {
    setGatewayConfig();
    const params = { a: '1' };
    const sig = generateRequestSignature(params, 'test-response-phrase');
    expect(verifyWebhookSignature(params, sig)).toBe(true);
    expect(verifyWebhookSignature(params, '0'.repeat(64))).toBe(false);
  });
});

// ── Configuration check ─────────────────────────────────────

describe('isPayFortConfigured', () => {
  it('is false without env vars', () => {
    expect(isPayFortConfigured()).toBe(false);
  });

  it('is true with all required env vars', () => {
    setGatewayConfig();
    expect(isPayFortConfigured()).toBe(true);
  });

  it('is false when only some vars are set', () => {
    process.env['PAYFORT_MERCHANT_ID'] = 'M';
    expect(isPayFortConfigured()).toBe(false);
  });
});

// Small helper: independent sha256 for cross-checking one vector.
function cryptoSha(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}
