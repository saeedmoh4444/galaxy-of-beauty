/**
 * D1 — vendor API keys (PROFESSIONALIZATION Wave D): generation, hashing
 * and constant-time verification. Plaintext is shown ONCE at creation;
 * only the sha256 hash is stored. Prefixes make keys recognizable in
 * logs ("gb_live_...").
 */
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

export interface GeneratedApiKey {
  /** The full key shown to the vendor once: `gb_live_<32 hex>`. */
  plaintext: string;
  /** sha256 hex of the plaintext — the only stored form. */
  hash: string;
  /** The recognizable prefix ("gb_live"). */
  prefix: string;
}

export function generateApiKey(prefix = 'gb_live'): GeneratedApiKey {
  const secret = randomBytes(16).toString('hex');
  const plaintext = `${prefix}_${secret}`;
  return { plaintext, hash: hashApiKey(plaintext), prefix };
}

export function hashApiKey(plaintext: string): string {
  return createHash('sha256').update(plaintext).digest('hex');
}

/** Constant-time comparison — never leak how much of the key matched. */
export function verifyApiKey(plaintext: string, storedHash: string): boolean {
  if (!plaintext) return false;
  const candidate = hashApiKey(plaintext);
  const a = Buffer.from(candidate, 'hex');
  const b = Buffer.from(storedHash, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}
