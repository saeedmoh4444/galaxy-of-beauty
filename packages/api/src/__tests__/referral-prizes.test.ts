/**
 * 8.1a — monthly referral leaderboard & prizes.
 *
 * Covers: month helpers (monthKey/monthRange/previousMonthKey), the
 * v2 enriched leaderboard with a month filter, the monthlyPrizes
 * projection (config before awarding, winners after), and the admin
 * awardMonthlyPrizes mutation (top-3 selection, tie-break, wallet
 * crediting, idempotency, role guard).
 *
 * All fixtures are fresh users with wallets where crediting is asserted;
 * completedAt anchors into fixed past months so seeded data (which has
 * no rows there) cannot perturb the top-3.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { buildUser, buildWallet } from './factories';
import type { JwtPayload } from '../lib/jwt';
import {
  MONTHLY_PRIZE_AMOUNTS,
  monthKey,
  monthRange,
  previousMonthKey,
} from '../lib/referralRewards';

const createdUserIds: number[] = [];
const TARGET = '2020-01'; // fixed month; seeded data has no completedAt here
const OUTSIDE = '2019-12';

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

async function makeUser(overrides?: { name?: string; role?: string }): Promise<JwtPayload> {
  const user = await prisma.user.create({
    data: buildUser({ role: (overrides?.role as any) ?? 'CUSTOMER', name: overrides?.name }),
  });
  createdUserIds.push(user.id);
  return { id: user.id, role: user.role as JwtPayload['role'], email: user.email };
}

async function seedCompleted(
  referrerId: number,
  referredId: number,
  count: number,
  completedAt: Date,
  codePrefix: string,
) {
  for (let i = 0; i < count; i++) {
    await prisma.referral.create({
      data: {
        referrerId,
        referredId,
        referralCode: `${codePrefix}-${i}`,
        status: 'COMPLETED',
        rewardCredited: true,
        completedAt,
      },
    });
  }
}

let admin: JwtPayload;
let topA: JwtPayload; // 3 completions in TARGET -> rank 1
let topB: JwtPayload; // 2 completions in TARGET -> rank 2
let topC: JwtPayload; // 1 completion  in TARGET -> rank 3 (tie-break by id asc)
let topD: JwtPayload; // 1 completion  in TARGET -> tied with C, loses on id
let outside: JwtPayload; // 5 completions in OUTSIDE -> must not rank in TARGET
let filler: JwtPayload; // referredId target for all rows

beforeAll(async () => {
  admin = await makeUser({ role: 'ADMIN' });
  topA = await makeUser({ name: 'TopA' });
  topB = await makeUser({ name: 'TopB' });
  topC = await makeUser({ name: 'TopC' });
  topD = await makeUser({ name: 'TopD' });
  outside = await makeUser({ name: 'Outside' });
  filler = await makeUser();

  const inTarget = new Date(Date.UTC(2020, 0, 15));
  const outTarget = new Date(Date.UTC(2019, 11, 15));
  await seedCompleted(topA.id, filler.id, 3, inTarget, 'PZ-A');
  await seedCompleted(topB.id, filler.id, 2, inTarget, 'PZ-B');
  await seedCompleted(topC.id, filler.id, 1, inTarget, 'PZ-C');
  await seedCompleted(topD.id, filler.id, 1, inTarget, 'PZ-D');
  await seedCompleted(outside.id, filler.id, 5, outTarget, 'PZ-O');

  for (const [userId, amount] of [
    [topA.id, 0],
    [topB.id, 0],
    [topC.id, 0],
  ] as Array<[number, number]>) {
    await prisma.wallet.upsert({
      where: { userId },
      update: {},
      create: buildWallet({ userId, balance: amount }),
    });
  }
}, 30000);

afterAll(async () => {
  // Each step guarded: the referral_prizes table may not exist yet when
  // this file runs against a DB that has not had the migration applied,
  // and one throwing step must not abort the rest of the cleanup.
  try {
    await prisma.referralPrize.deleteMany({ where: { month: { in: [TARGET, OUTSIDE] } } });
  } catch {
    /* table not migrated yet */
  }
  try {
    await prisma.walletTransaction.deleteMany({
      where: { referenceId: { startsWith: 'prize_' } },
    });
  } catch {
    /* best-effort */
  }
  try {
    if (createdUserIds.length > 0) {
      await prisma.referral.deleteMany({
        where: {
          OR: [{ referrerId: { in: createdUserIds } }, { referredId: { in: createdUserIds } }],
        },
      });
      await prisma.wallet.deleteMany({ where: { userId: { in: createdUserIds } } });
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    }
  } catch {
    /* best-effort */
  }
});

describe('month helpers', () => {
  it('keys and ranges a month in UTC', () => {
    expect(monthKey(new Date(Date.UTC(2026, 8, 26)))).toBe('2026-09');
    expect(monthKey(new Date('2026-01-01T00:00:00Z'))).toBe('2026-01');
    const r = monthRange('2026-02');
    expect(r.start.toISOString()).toBe('2026-02-01T00:00:00.000Z');
    expect(r.end.toISOString()).toBe('2026-03-01T00:00:00.000Z');
  });

  it('computes the previous month key across year boundaries', () => {
    expect(previousMonthKey(new Date(Date.UTC(2026, 0, 5)))).toBe('2025-12');
    expect(previousMonthKey(new Date(Date.UTC(2026, 5, 5)))).toBe('2026-05');
  });
});

describe('leaderboard v2', () => {
  it('enriches rows with names and ranks, best-first (all-time)', async () => {
    const c = await caller(null);
    const board = await c.referrals.leaderboard({});
    for (let i = 1; i < board.length; i++) {
      expect(board[i - 1]!.count).toBeGreaterThanOrEqual(board[i]!.count);
    }
    const out = board.find((e: any) => e.userId === outside.id);
    const a = board.find((e: any) => e.userId === topA.id);
    expect(out?.count).toBe(5);
    expect(out?.name).toBe('Outside');
    expect(a?.count).toBe(3);
    expect(a?.rank).toBe(board.indexOf(a as any) + 1);
    // Enriched rows carry no groupBy internals.
    expect(
      board.every((e: any) => typeof e.userId === 'number' && typeof e.name === 'string'),
    ).toBe(true);
  });

  it('filters by month on completedAt', async () => {
    const c = await caller(null);
    const board = await c.referrals.leaderboard({ month: TARGET });
    const a = board.find((e: any) => e.userId === topA.id);
    const out = board.find((e: any) => e.userId === outside.id);
    expect(a?.count).toBe(3);
    expect(board[0]!.userId).toBe(topA.id);
    expect(out).toBeUndefined(); // OUTSIDE completions are in 2019-12
  });

  it('rejects malformed months', async () => {
    const c = await caller(null);
    await expect(c.referrals.leaderboard({ month: '2020-13' })).rejects.toThrow();
    await expect(c.referrals.leaderboard({ month: 'nope' })).rejects.toThrow();
  });
});

describe('monthlyPrizes', () => {
  it('synthesizes the config with null winners before awarding', async () => {
    const c = await caller(null);
    const { month, prizes } = await c.referrals.monthlyPrizes({ month: TARGET });
    expect(month).toBe(TARGET);
    expect(prizes).toHaveLength(3);
    expect(prizes.map((p: any) => p.amount)).toEqual(MONTHLY_PRIZE_AMOUNTS);
    expect(prizes.map((p: any) => p.rank)).toEqual([1, 2, 3]);
    expect(prizes.every((p: any) => p.winnerId === null)).toBe(true);
  });

  it('defaults to the current month', async () => {
    const c = await caller(null);
    const { month } = await c.referrals.monthlyPrizes({});
    expect(month).toBe(monthKey(new Date()));
  });
});

describe('awardMonthlyPrizes', () => {
  it('awards the top-3 referrers of the month and credits their wallets', async () => {
    const c = await caller(admin);
    const res = await c.referrals.awardMonthlyPrizes({ month: TARGET });
    expect(res).toHaveLength(3);
    expect(res.map((p: any) => p.rank)).toEqual([1, 2, 3]);
    expect(res[0]).toMatchObject({ winnerId: topA.id, amount: 500 });
    expect(res[1]).toMatchObject({ winnerId: topB.id, amount: 300 });
    // C and D both have 1 — tie breaks by referrerId asc, C was created first.
    expect(res[2]).toMatchObject({ winnerId: topC.id, amount: 200 });
    expect(res.every((p: any) => p.status === 'CREDITED' && p.creditedAt)).toBe(true);

    for (const [userId, amount] of [
      [topA.id, 500],
      [topB.id, 300],
      [topC.id, 200],
    ] as Array<[number, number]>) {
      const wallet = await prisma.wallet.findUniqueOrThrow({ where: { userId } });
      expect(wallet.bonusBalance.toNumber()).toBe(amount);
      const tx = await prisma.walletTransaction.findFirst({
        where: {
          source: 'REFERRAL_BONUS',
          referenceId: { startsWith: 'prize_' },
          wallet: { userId },
        },
        orderBy: { id: 'desc' },
      });
      expect(tx).not.toBeNull();
      expect(tx!.amount.toNumber()).toBe(amount);
      const prize = await prisma.referralPrize.findFirstOrThrow({
        where: { winnerId: userId, month: TARGET },
      });
      expect(tx!.referenceId).toBe(`prize_${prize.id}`);
    }
  });

  it('is idempotent — a second award does not double-credit', async () => {
    const c = await caller(admin);
    const first = await c.referrals.awardMonthlyPrizes({ month: TARGET });
    const second = await c.referrals.awardMonthlyPrizes({ month: TARGET });
    expect(second.map((p: any) => p.winnerId)).toEqual(first.map((p: any) => p.winnerId));
    const wallet = await prisma.wallet.findUniqueOrThrow({ where: { userId: topA.id } });
    expect(wallet.bonusBalance.toNumber()).toBe(500); // still exactly one credit
  });

  it('reflects winners in monthlyPrizes after awarding', async () => {
    const c = await caller(null);
    const { prizes } = await c.referrals.monthlyPrizes({ month: TARGET });
    expect(prizes[0]).toMatchObject({ rank: 1, winnerId: topA.id, winnerName: 'TopA' });
    expect(prizes[0]!.status).toBe('CREDITED');
  });

  it('defaults to the previous month', async () => {
    const c = await caller(admin);
    const month = previousMonthKey();
    const res = await c.referrals.awardMonthlyPrizes({});
    expect(res.every((p: any) => p.month === month)).toBe(true);
    // Undo this award so reruns stay idempotent and seeded wallets are
    // untouched (winners here are seeded users, not our fixtures).
    for (const p of res) {
      if (p.winnerId == null) continue;
      const tx = await prisma.walletTransaction.findFirst({
        where: { referenceId: `prize_${p.id}` },
      });
      if (tx) {
        await prisma.walletTransaction.delete({ where: { id: tx.id } });
        await prisma.wallet.update({
          where: { userId: p.winnerId },
          data: { bonusBalance: { decrement: p.amount } },
        });
      }
      await prisma.referralPrize.delete({ where: { id: p.id } }).catch(() => {});
    }
  });

  it('rejects non-admin callers', async () => {
    const c = await caller(topA);
    await expect(c.referrals.awardMonthlyPrizes({ month: TARGET })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });
});
