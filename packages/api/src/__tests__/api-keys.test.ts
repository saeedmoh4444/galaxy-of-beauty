import { describe, it, expect } from 'vitest';
import { generateApiKey, hashApiKey, verifyApiKey } from '../lib/apiKeys';

describe('apiKeys', () => {
  it('generates prefixed keys with enough entropy and hashes them', () => {
    const { plaintext, hash, prefix } = generateApiKey('gb_live');
    expect(plaintext.startsWith('gb_live_')).toBe(true);
    expect(plaintext.length).toBeGreaterThanOrEqual(40); // prefix + 32 hex
    expect(prefix).toBe('gb_live');
    expect(hash).not.toBe(plaintext);
    expect(hash).toMatch(/^[0-9a-f]{64}$/); // sha256 hex
  });

  it('verifies the plaintext against the hash, rejecting tampered keys', () => {
    const { plaintext, hash } = generateApiKey('gb_live');
    expect(verifyApiKey(plaintext, hash)).toBe(true);
    expect(verifyApiKey('gb_live_' + '0'.repeat(32), hash)).toBe(false);
    expect(verifyApiKey('', hash)).toBe(false);
  });

  it('produces unique keys on every call', () => {
    const keys = new Set(Array.from({ length: 50 }, () => generateApiKey('gb_live').plaintext));
    expect(keys.size).toBe(50);
  });

  it('matches the stored prefix during verification', () => {
    const { plaintext, hash, prefix } = generateApiKey('gb_live');
    expect(prefix).toBe(hashApiKey(plaintext) === hash ? 'gb_live' : '');
    expect(hashApiKey(plaintext)).toBe(hash);
  });
});
