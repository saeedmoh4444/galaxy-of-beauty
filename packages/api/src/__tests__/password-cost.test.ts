/**
 * B5 — env-tunable bcrypt cost. Production default is 12; test
 * environments set BCRYPT_COST=4 so logins stay fast under load.
 * The cost is encoded in the hash prefix ($2b$<cost>$), so we can
 * assert it without timing anything.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const ORIGINAL = process.env['BCRYPT_COST'];

describe('bcrypt cost selection', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    if (ORIGINAL === undefined) delete process.env['BCRYPT_COST'];
    else process.env['BCRYPT_COST'] = ORIGINAL;
    vi.resetModules();
  });

  it('defaults to cost 12 without the env var', async () => {
    delete process.env['BCRYPT_COST'];
    const { hashPassword } = await import('../lib/password');
    const hash = await hashPassword('hunter22');
    expect(hash.startsWith('$2b$12$') || hash.startsWith('$2a$12$')).toBe(true);
  });

  it('uses BCRYPT_COST when set', async () => {
    process.env['BCRYPT_COST'] = '4';
    const { hashPassword } = await import('../lib/password');
    const hash = await hashPassword('hunter22');
    expect(hash.startsWith('$2b$04$') || hash.startsWith('$2a$04$')).toBe(true);
  });

  it('clamps invalid values back to the production default', async () => {
    process.env['BCRYPT_COST'] = 'not-a-number';
    const { hashPassword } = await import('../lib/password');
    const hash = await hashPassword('hunter22');
    expect(hash.startsWith('$2b$12$') || hash.startsWith('$2a$12$')).toBe(true);
  });

  it('verifies hashes produced at any cost (cost is encoded in the hash)', async () => {
    process.env['BCRYPT_COST'] = '4';
    const { hashPassword, verifyPassword } = await import('../lib/password');
    const cheap = await hashPassword('hunter22');
    process.env['BCRYPT_COST'] = '12';
    vi.resetModules();
    const re = await import('../lib/password');
    expect(await re.verifyPassword('hunter22', cheap)).toBe(true);
    expect(await re.verifyPassword('wrong', cheap)).toBe(false);
  });
});
