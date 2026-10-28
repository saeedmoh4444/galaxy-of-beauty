/**
 * D1b — vendor webhook signing (Wave D): HMAC-SHA256 over the raw JSON
 * body. The signature header is `X-Gob-Signature: sha256=<hex>`.
 */
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

/** 32 random bytes, hex — shown once at webhook creation. */
export function generateWebhookSecret(): string {
  return randomBytes(32).toString('hex');
}

export function signWebhookPayload(secret: string, body: string): string {
  return createHmac('sha256', secret).update(body).digest('hex');
}

/** Constant-time comparison — the vendor verifies our signature server-side. */
export function verifyWebhookSignature(secret: string, body: string, signature: string): boolean {
  if (!signature || !/^[0-9a-f]{64}$/.test(signature)) return false;
  const expected = signWebhookPayload(secret, body);
  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(signature, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}
