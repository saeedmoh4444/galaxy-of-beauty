/**
 * Audit gap #4 — referral-race prizes were display strings with no award
 * path. awardPrizes (admin) credits the top-3 referrers' bonusBalance via
 * REFERRAL_BONUS transactions, idempotent per campaign.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

let admin: JwtPayload;
let w1: number;
let w2: number;
let w3: number;
const userIds: number[] = [];
const referralIds: number[] = [];

function callerFor(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

async function makeReferrer(walletBalance: number, completedRefs: number): Promise<number> {
  const u = await prisma.user.create({ data: buildUser() });
  userIds.push(u.id);
  await prisma.wallet.create({ data: { userId: u.id, balance: walletBalance } });
  for (let i = 0; i < completedRefs; i++) {
    const referred = await prisma.user.create({ data: buildUser() });
    userIds.push(referred.id);
    const r = await prisma.referral.create({
      data: {
        referrerId: u.id,
        referredId: referred.id,
        referralCode: `rc-${u.id}-${i}`,
        status: 'COMPLETED',
        rewardCredited: true,
        completedAt: new Date(),
      },
    });
    referralIds.push(r.id);
  }
  return u.id;
}

beforeAll(async () => {
  const adminDb = await prisma.user.create({ data: buildUser({ role: 'ADMIN' }) });
  userIds.push(adminDb.id);
  admin = { id: adminDb.id, role: 'ADMIN', email: adminDb.email };

  // Rank 1: 3 completed referrals; rank 2: 2; rank 3: 1.
  w1 = await makeReferrer(0, 3);
  w2 = await makeReferrer(0, 2);
  w3 = await makeReferrer(0, 1);
}, 20000);

afterAll(async () => {
  try {
    await prisma.walletTransaction.deleteMany({
      where: { wallet: { userId: { in: userIds } } },
    });
  } catch {}
  try {
    await prisma.referral.deleteMany({ where: { id: { in: referralIds } } });
  } catch {}
  try {
    await prisma.wallet.deleteMany({ where: { userId: { in: userIds } } });
  } catch {}
  try {
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  } catch {}
});

describe('referral race awards', () => {
  it('credits the top-3 referrers with REFERRAL_BONUS transactions', async () => {
    const caller = callerFor(admin);
    const result = await caller.referralRace.awardPrizes();

    expect(result.awarded.length).toBe(3);
    const rank1 = result.awarded.find((a: { rank: number }) => a.rank === 1);
    expect(rank1).toBeTruthy();
    expect(rank1!.userId).toBe(w1);
    expect(rank1!.amount).toBeGreaterThan(0);

    const wallet = await prisma.wallet.findUniqueOrThrow({ where: { userId: w1 } });
    expect(Number(wallet.bonusBalance)).toBe(rank1!.amount);

    const txn = await prisma.walletTransaction.findFirst({
      where: { walletId: wallet.id, type: 'CREDIT', source: 'REFERRAL_BONUS' },
    });
    expect(txn).toBeTruthy();
  }, 20000);

  it('is idempotent — re-running does not double-credit', async () => {
    const caller = callerFor(admin);
    await caller.referralRace.awardPrizes();
    const again = await caller.referralRace.awardPrizes();

    expect(again.awarded.length).toBe(0); // already awarded this campaign

    const wallet = await prisma.wallet.findUniqueOrThrow({ where: { userId: w1 } });
    const txns = await prisma.walletTransaction.count({
      where: { walletId: wallet.id, type: 'CREDIT', source: 'REFERRAL_BONUS' },
    });
    expect(txns).toBe(1);
  }, 20000);
});
