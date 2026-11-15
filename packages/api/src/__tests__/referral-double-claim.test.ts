/**
 * W5-2 — referral double-claim. The pair (referrerId, referredId) had no
 * compound unique and applyCode had no existence check: repeated applies
 * created unlimited PENDING rows, and booking completion could credit
 * both sides more than once. Contract: one referral row per pair —
 * applyCode is idempotent, and the DB rejects duplicates.
 */
import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { buildUser } from './factories';
import type { JwtPayload } from '../lib/jwt';

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

const createdUserIds: number[] = [];
let referrer: JwtPayload;
let referred: JwtPayload;
let referrerCode: string;

beforeAll(async () => {
  const ru = await prisma.user.create({ data: buildUser() });
  const du = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(ru.id, du.id);
  referrer = { id: ru.id, role: 'CUSTOMER', email: ru.email };
  referred = { id: du.id, role: 'CUSTOMER', email: du.email };

  const rc = await caller(referrer);
  const code = await rc.referrals.getMyCode();
  referrerCode = (code as { code: string }).code;
}, 30000);

afterAll(async () => {
  await prisma.referral.deleteMany({ where: { referredId: referred.id } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

describe('referral double-claim (W5-2)', () => {
  it('a second apply is rejected — one row per pair (API guard)', async () => {
    const c = await caller(referred);
    const first = await c.referrals.applyCode({ code: referrerCode });
    expect(first.id).toBeGreaterThan(0);

    await expect(c.referrals.applyCode({ code: referrerCode })).rejects.toMatchObject({
      code: 'CONFLICT',
    });

    const rows = await prisma.referral.count({
      where: { referrerId: referrer.id, referredId: referred.id },
    });
    expect(rows).toBe(1);
  });

  it('the DB rejects a second row for the same pair', async () => {
    let rejected = false;
    try {
      await prisma.referral.create({
        data: {
          referrerId: referrer.id,
          referredId: referred.id,
          referralCode: referrerCode,
          status: 'PENDING',
        },
      });
    } catch {
      rejected = true;
    }
    expect(rejected, 'expected the compound unique to reject the row').toBe(true);
  });
});
