import { describe, it, expect } from 'vitest';
import {
  signWebhookPayload,
  verifyWebhookSignature,
  generateWebhookSecret,
} from '../lib/webhookSigning';

describe('webhookSigning', () => {
  it('signs a payload with HMAC-SHA256 and verifies it', () => {
    const secret = generateWebhookSecret();
    const body = JSON.stringify({ event: 'order.placed', orderId: 42 });
    const signature = signWebhookPayload(secret, body);
    expect(signature).toMatch(/^[0-9a-f]{64}$/);
    expect(verifyWebhookSignature(secret, body, signature)).toBe(true);
  });

  it('rejects a tampered body or the wrong secret', () => {
    const secret = generateWebhookSecret();
    const body = JSON.stringify({ event: 'order.placed', orderId: 42 });
    const signature = signWebhookPayload(secret, body);
    expect(verifyWebhookSignature(secret, body + 'x', signature)).toBe(false);
    expect(verifyWebhookSignature(generateWebhookSecret(), body, signature)).toBe(false);
    expect(verifyWebhookSignature(secret, body, '')).toBe(false);
  });

  it('generates unique 32-byte secrets', () => {
    const secrets = new Set(Array.from({ length: 25 }, () => generateWebhookSecret()));
    expect(secrets.size).toBe(25);
    for (const s of secrets) expect(s).toMatch(/^[0-9a-f]{64}$/);
  });
});
