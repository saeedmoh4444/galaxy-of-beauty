/**
 * Token Reuse Detection Tests — real integration coverage.
 *
 * Drives auth.register / auth.refresh against the seeded DB and inspects
 * refresh_tokens rows to verify the family-rotation rules:
 *   - rotation keeps the same familyId and revokes the previous token
 *   - replaying a revoked token revokes the whole family
 *   - family revocation is scoped to the token's user
 *   - a legacy row with an empty familyId rotates into a fresh family
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';

const CSRF = 'a'.repeat(64);

async function anonCaller() {
  const ctx = await createTRPCContext({ csrfCookie: CSRF, csrfHeader: CSRF });
  return (appRouter as any).createCaller(ctx);
}

const uid = Date.now();
const emails: string[] = [];

async function registerUser(tag: string): Promise<{
  userId: number;
  refreshToken: string;
}> {
  const email = `reuse-${tag}-${uid}@test.com`;
  emails.push(email);
  const caller = await anonCaller();
  const result = await caller.auth.register({
    email,
    password: 'StrongPass123!',
    name: 'اختبار العائلة',
    phone: `+9665${String(Math.floor(10000000 + Math.random() * 90000000))}`,
    acceptedTerms: true,
  });
  return { userId: result.user.id, refreshToken: result.refreshToken };
}

async function refresh(token: string) {
  const caller = await anonCaller();
  return caller.auth.refresh({ refreshToken: token });
}

function familyOf(token: string) {
  return prisma.refreshToken.findUnique({ where: { token } }).then((r) => r?.familyId);
}

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { in: emails } } });
});

// ── Rotation rules ─────────────────────────────────────────

describe('Refresh Token — Rotation Rules', () => {
  let userId: number;
  let tokenA: string;
  let tokenB: string;
  let family: string | undefined;

  beforeAll(async () => {
    const u = await registerUser('rotate');
    userId = u.userId;
    tokenA = u.refreshToken;
    family = await familyOf(tokenA);
    const rotated = await refresh(tokenA);
    tokenB = rotated.refreshToken;
  });

  it('assigns a non-empty familyId at registration', () => {
    expect(family).toBeTruthy();
    expect(family).not.toBe('');
  });

  it('keeps the same familyId across rotation', async () => {
    expect(await familyOf(tokenB)).toBe(family);
  });

  it('produces a different token on rotation', () => {
    expect(tokenA).not.toBe(tokenB);
  });

  it('revokes the previous token during rotation', async () => {
    const rowA = await prisma.refreshToken.findUnique({ where: { token: tokenA } });
    expect(rowA?.revokedAt).toBeInstanceOf(Date);
  });
});

// ── Reuse detection ────────────────────────────────────────

describe('Refresh Token — Reuse Detection', () => {
  let userIdA: number;
  let tokenA1: string;
  let tokenA2: string;
  let tokenB1: string;

  beforeAll(async () => {
    const a = await registerUser('replay-a');
    userIdA = a.userId;
    tokenA1 = a.refreshToken;
    tokenA2 = (await refresh(tokenA1)).refreshToken;

    const b = await registerUser('replay-b');
    tokenB1 = b.refreshToken;
  });

  it('rejects a replayed token', async () => {
    await expect(refresh(tokenA1)).rejects.toThrow(/Token reuse detected/);
  });

  it('revokes the entire family on replay', async () => {
    const rowA2 = await prisma.refreshToken.findUnique({ where: { token: tokenA2 } });
    expect(rowA2?.revokedAt).toBeInstanceOf(Date);
  });

  it('leaves other users tokens untouched (cross-user isolation)', async () => {
    const rowB1 = await prisma.refreshToken.findUnique({ where: { token: tokenB1 } });
    expect(rowB1?.revokedAt).toBeNull();
    // B's token still works
    const rotated = await refresh(tokenB1);
    expect(rotated.accessToken).toBeDefined();
  });

  it('rejects a token whose family was revoked by replay', async () => {
    // A2 was revoked by the family revocation — replaying it lands in
    // the same reuse-detection branch as A1.
    await expect(refresh(tokenA2)).rejects.toThrow(/Token reuse detected/);
  });
});

// ── Legacy empty-family guard ──────────────────────────────

describe('Refresh Token — Legacy Empty Family', () => {
  it('rotates a legacy token into a fresh non-empty family', async () => {
    const u = await registerUser('legacy');
    const legacyToken = u.refreshToken;

    // Simulate a pre-Phase-3 row: the DB default is now a UUID, but
    // rows written before the backfill had familyId = ''.
    await prisma.refreshToken.update({
      where: { token: legacyToken },
      data: { familyId: '' },
    });

    const rotated = await refresh(legacyToken);
    const newFamily = await familyOf(rotated.refreshToken);
    expect(newFamily).toBeTruthy();
    expect(newFamily).not.toBe('');

    // The legacy row itself must be revoked by rotation.
    const legacyRow = await prisma.refreshToken.findUnique({ where: { token: legacyToken } });
    expect(legacyRow?.revokedAt).toBeInstanceOf(Date);

    // And the fresh token works normally.
    const again = await refresh(rotated.refreshToken);
    expect(again.accessToken).toBeDefined();
  });
});
