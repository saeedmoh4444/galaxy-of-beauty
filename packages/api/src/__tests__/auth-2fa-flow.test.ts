/**
 * 2FA flow integration tests — setup, verify, login challenge, disable.
 * Also covers me/updateProfile/logout on the same isolated user.
 *
 * Uses a freshly registered user so enabling 2FA can't interfere with
 * other test files that log in as the shared seed customer.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import crypto from 'crypto';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';
import type { JwtPayload } from '../lib/jwt';

const CSRF = 'a'.repeat(64);

async function anonCaller() {
  const ctx = await createTRPCContext({ csrfCookie: CSRF, csrfHeader: CSRF });
  return (appRouter as any).createCaller(ctx);
}

async function authCaller(user: JwtPayload) {
  const ctx = await createTRPCContext({ user, csrfCookie: CSRF, csrfHeader: CSRF });
  return (appRouter as any).createCaller(ctx);
}

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/** RFC 6238 TOTP (SHA1, 6 digits, 30s) — mirrors the server implementation. */
function totpCode(secret: string, when = Date.now()): string {
  const counter = Math.floor(when / 1000 / 30);
  const counterBuf = Buffer.alloc(8);
  counterBuf.writeBigInt64BE(BigInt(counter), 0);

  // base32 decode
  const clean = secret.toUpperCase().replace(/=+$/, '');
  let bits = 0;
  let value = 0;
  const keyBytes: number[] = [];
  for (const char of clean) {
    const index = BASE32.indexOf(char);
    if (index === -1) throw new Error(`bad base32 char: ${char}`);
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      keyBytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }

  const hmac = crypto.createHmac('sha1', Buffer.from(keyBytes));
  hmac.update(counterBuf);
  const digest = hmac.digest();
  const offset = digest[digest.length - 1]! & 0x0f;
  const code =
    (((digest[offset]! & 0x7f) << 24) |
      ((digest[offset + 1]! & 0xff) << 16) |
      ((digest[offset + 2]! & 0xff) << 8) |
      (digest[offset + 3]! & 0xff)) %
    1_000_000;
  return String(code).padStart(6, '0');
}

const email = `2fa-test-${Date.now()}@test.com`;
const password = 'StrongPass123!';
let user: JwtPayload;
let refreshToken: string;

beforeAll(async () => {
  const anon = await anonCaller();
  const reg = await anon.auth.register({
    email,
    password,
    name: 'مختبرة التحقق الثنائي',
    phone: `+9665${String(Math.floor(10000000 + Math.random() * 90000000))}`,
    acceptedTerms: true,
  });
  user = { id: reg.user.id, role: reg.user.role, email: reg.user.email };
}, 15000);

describe('Auth — 2FA flow', () => {
  let secret = '';

  it('me should report twoFactorEnabled=false initially', async () => {
    const me = await (await authCaller(user)).auth.me();
    expect(me.twoFactorEnabled).toBe(false);
  });

  it('setup2FA should return a base32 secret with an otpauth URL', async () => {
    const setup = await (await authCaller(user)).auth.setup2FA({});
    expect(setup.secret).toMatch(/^[A-Z2-7]+$/);
    expect(setup.otpauthUrl).toContain(setup.secret);
    secret = setup.secret;
  });

  it('verify2FA should reject a wrong code', async () => {
    const wrong = String((Number(totpCode(secret)) + 1) % 1_000_000).padStart(6, '0');
    await expect((await authCaller(user)).auth.verify2FA({ token: wrong })).rejects.toThrow();
  });

  it('verify2FA should accept a valid TOTP code', async () => {
    const result = await (await authCaller(user)).auth.verify2FA({ token: totpCode(secret) });
    expect(result).toBeDefined();
  });

  it('login should challenge with 2FA_REQUIRED once enabled', async () => {
    const anon = await anonCaller();
    await expect(anon.auth.login({ email, password })).rejects.toMatchObject({
      code: 'PRECONDITION_FAILED',
      message: '2FA_REQUIRED',
    });
  });

  it('login should succeed with a valid TOTP code', async () => {
    const anon = await anonCaller();
    const login = await anon.auth.login({ email, password, totpToken: totpCode(secret) });
    expect(login.accessToken).toBeDefined();
    refreshToken = login.refreshToken;
  });

  it('logout should revoke refresh tokens', async () => {
    await (await authCaller(user)).auth.logout({});
    const anon = await anonCaller();
    await expect(anon.auth.refresh({ refreshToken })).rejects.toThrow();
  });

  it('updateProfile should update the name and me should reflect it', async () => {
    await (await authCaller(user)).auth.updateProfile({ name: 'اسم محدث' });
    const me = await (await authCaller(user)).auth.me();
    expect(me.name).toBe('اسم محدث');
  });

  it('disable2FA should turn 2FA off', async () => {
    await (await authCaller(user)).auth.disable2FA({});
    const me = await (await authCaller(user)).auth.me();
    expect(me.twoFactorEnabled).toBe(false);

    // Login no longer challenges
    const anon = await anonCaller();
    const login = await anon.auth.login({ email, password });
    expect(login.accessToken).toBeDefined();
  });
});
