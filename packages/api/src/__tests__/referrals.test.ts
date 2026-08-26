/**
 * Referrals router tests — code generation, apply/redeem lifecycle,
 * stats math (incl. REFERRAL_BONUS wallet credits), leaderboard ordering,
 * share card, and tiered enhanced stats.
 * Coverage ratchet target: src/routers/referrals.ts (was 9.1%).
 *
 * All fixture users are created fresh via factories and cleaned up in
 * afterAll (children before parents), so assertions are deterministic
 * regardless of seeded data.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { buildUser, buildWallet, type BuildUserOverrides } from './factories';
import type { JwtPayload } from '../lib/jwt';

const createdUserIds: number[] = [];

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

async function makeUser(overrides?: BuildUserOverrides): Promise<JwtPayload> {
  const user = await prisma.user.create({ data: buildUser(overrides) });
  createdUserIds.push(user.id);
  return { id: user.id, role: user.role as JwtPayload['role'], email: user.email };
}

// ── Fixtures (created in dependency order) ─────────────────────────────
let referrerA: JwtPayload; // name 'Test' -> deterministic code
let referredB: JwtPayload; // redeems A's code
let secondC: JwtPayload; // second referrer (conflict + leaderboard + gold tier)
let freshD: JwtPayload; // never redeems anything (zeros + invalid-code cases)
let leaderE: JwtPayload; // COMPLETED referral, referred by C
let leaderF: JwtPayload; // COMPLETED referral, referred by C
let leaderG: JwtPayload; // COMPLETED referral, referred by A

let codeA: string;

beforeAll(async () => {
  referrerA = await makeUser({ name: 'Test' });
  referredB = await makeUser();
  secondC = await makeUser();
  freshD = await makeUser();
  leaderE = await makeUser();
  leaderF = await makeUser();
  leaderG = await makeUser();
}, 15000);

afterAll(async () => {
  if (createdUserIds.length > 0) {
    await prisma.referral.deleteMany({
      where: {
        OR: [{ referrerId: { in: createdUserIds } }, { referredId: { in: createdUserIds } }],
      },
    });
    await prisma.wallet.deleteMany({ where: { userId: { in: createdUserIds } } });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  }
});

describe('referrals router', () => {
  // ── getMyCode ────────────────────────────────────────────────────────
  describe('getMyCode', () => {
    it('generates a deterministic code without persisting a referral', async () => {
      const c = await caller(referrerA);
      const { code } = await c.referrals.getMyCode();
      const suffix = referrerA.id.toString(36).toUpperCase().padStart(3, '0');
      expect(code).toBe(`GOB-TEST${suffix}`);
      codeA = code;

      // Stable across calls
      expect((await c.referrals.getMyCode()).code).toBe(code);

      // The code is only reserved — no referral row exists yet
      const rows = await prisma.referral.findMany({ where: { referrerId: referrerA.id } });
      expect(rows).toHaveLength(0);
    });

    it('rejects anonymous callers', async () => {
      const c = await caller(null);
      await expect(c.referrals.getMyCode()).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });
  });

  // ── applyCode ────────────────────────────────────────────────────────
  describe('applyCode', () => {
    // NOTE: getMyCode/shareCard never persist the code, and applyCode only
    // resolves codes already stored in a referral row — so the first
    // redemption of any fresh code is impossible (see bug report). To
    // exercise the guards we seed the row the router would have created
    // after a (hypothetical) successful redemption.
    beforeAll(async () => {
      await prisma.referral.create({
        data: {
          referrerId: referrerA.id,
          referredId: referredB.id,
          referralCode: codeA,
          status: 'PENDING',
        },
      });
    });

    it('applies a freshly generated code that was never stored', async () => {
      // getMyCode derives the code from the referrer; the row is only
      // persisted on first redemption. Another user must be able to
      // redeem it (this used to fail — the referral feature was broken).
      const d = await caller(freshD);
      const { code } = await d.referrals.getMyCode();
      const e = await makeUser();
      const ec = await caller(e);
      const res = await ec.referrals.applyCode({ code });
      expect(res.status).toBe('PENDING');
      const row = await prisma.referral.findFirstOrThrow({
        where: { referrerId: freshD.id, referredId: e.id },
      });
      expect(row.referralCode).toBe(code);
      await prisma.referral.delete({ where: { id: row.id } });
    });

    it('rejects unknown codes', async () => {
      const d = await caller(freshD);
      await expect(d.referrals.applyCode({ code: 'XYZ-NOPE' })).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });

    it('rejects applying your own stored code', async () => {
      const a = await caller(referrerA);
      await expect(a.referrals.applyCode({ code: codeA })).rejects.toMatchObject({
        code: 'BAD_REQUEST',
      });
      await expect(a.referrals.applyCode({ code: codeA })).rejects.toThrow(
        'You cannot use your own referral code',
      );
    });

    it('rejects an already-referred user even with an unrelated code (guard ordering)', async () => {
      const b = await caller(referredB);
      await expect(b.referrals.applyCode({ code: 'GOB-NOPE456' })).rejects.toMatchObject({
        code: 'CONFLICT',
      });
    });

    it('lets a second user redeem the same stored code', async () => {
      // referralCode was @unique, so the second redemption of a code
      // used to throw a raw P2002. The unique constraint was dropped
      // (2026-08-19) — every referred user may carry the referrer's code.
      const d = await caller(freshD);
      const res = await d.referrals.applyCode({ code: codeA });
      expect(res.status).toBe('PENDING');
      const row = await prisma.referral.findFirstOrThrow({
        where: { referrerId: referrerA.id, referredId: freshD.id },
      });
      expect(row.referralCode).toBe(codeA);
      await prisma.referral.delete({ where: { id: row.id } });
    });

    it('validates the input shape', async () => {
      const d = await caller(freshD);
      await expect((d.referrals.applyCode as any)()).rejects.toThrow();
      await expect(d.referrals.applyCode({ code: 123 as any })).rejects.toThrow();
    });

    it('rejects anonymous callers', async () => {
      const c = await caller(null);
      await expect(c.referrals.applyCode({ code: codeA })).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });
  });

  // ── getStats ─────────────────────────────────────────────────────────
  describe('getStats', () => {
    it('returns zeroed stats for a user with no activity', async () => {
      const d = await caller(freshD);
      const s = await d.referrals.getStats();
      expect(s.totalReferred).toBe(0);
      expect(s.completedReferrals).toBe(0);
      expect(s.pendingReferrals).toBe(0);
      expect(s.totalEarned).toBe(0);
      expect(s.pendingRewards).toBe(0);
      expect(s.referrals).toHaveLength(0);
      expect(s.totalReferred).toBe(s.completedReferrals + s.pendingReferrals);
    });

    it('accounts a PENDING referral (seeded in applyCode describe) and REFERRAL_BONUS wallet credits', async () => {
      // Idempotent seeding for reruns: wipe any prior bonus tx for this user
      await prisma.walletTransaction.deleteMany({
        where: { source: 'REFERRAL_BONUS', wallet: { userId: referrerA.id } },
      });
      const wallet = await prisma.wallet.upsert({
        where: { userId: referrerA.id },
        update: {},
        create: buildWallet({ userId: referrerA.id, balance: 30 }),
      });
      await prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'CREDIT',
          source: 'REFERRAL_BONUS',
          amount: 30,
          referenceId: `ref-bonus-${referrerA.id}`,
        },
      });

      const a = await caller(referrerA);
      const s = await a.referrals.getStats();
      expect(s.totalReferred).toBe(1);
      expect(s.completedReferrals).toBe(0);
      expect(s.pendingReferrals).toBe(1);
      expect(s.totalEarned).toBe(30);
      expect(s.pendingRewards).toBe(20); // default referrerReward
      expect(s.referrals).toHaveLength(1);
      expect(s.referrals[0]!.status).toBe('PENDING');
      expect(s.referrals[0]!.referralCode).toBe(codeA);
      expect(s.referrals[0]!.rewardCredited).toBe(false);
      expect(s.referrals[0]!.referred.id).toBe(referredB.id);
      expect(s.totalReferred).toBe(s.completedReferrals + s.pendingReferrals);
    });

    it('rejects anonymous callers', async () => {
      const c = await caller(null);
      await expect(c.referrals.getStats()).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });
  });

  // ── shareCard ────────────────────────────────────────────────────────
  describe('shareCard', () => {
    it('falls back to a plain code when no referral exists', async () => {
      const d = await caller(freshD);
      const card = await d.referrals.shareCard();
      expect(card.code).toBe(`GOB-${freshD.id}`);
      expect(card.shareUrl).toContain(`ref=${card.code}`);
      expect(card.shareUrl).toContain('register');
      expect(card.shareText.length).toBeGreaterThan(0);
    });

    it('uses the redeemed code once a referral exists', async () => {
      const a = await caller(referrerA);
      const card = await a.referrals.shareCard();
      expect(card.code).toBe(codeA);
      expect(card.shareUrl).toContain(`ref=${codeA}`);
    });

    it('rejects anonymous callers', async () => {
      const c = await caller(null);
      await expect(c.referrals.shareCard()).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });
  });

  // ── leaderboard ──────────────────────────────────────────────────────
  describe('leaderboard', () => {
    it('aggregates COMPLETED referrals per referrer, best-first', async () => {
      // C refers two users; A refers one — all COMPLETED.
      // (Distinct codes are required: referralCode is unique per row.)
      await prisma.referral.create({
        data: {
          referrerId: secondC.id,
          referredId: leaderE.id,
          referralCode: `GOB-LEAD-${secondC.id}-1`,
          status: 'COMPLETED',
          rewardCredited: true,
        },
      });
      await prisma.referral.create({
        data: {
          referrerId: secondC.id,
          referredId: leaderF.id,
          referralCode: `GOB-LEAD-${secondC.id}-2`,
          status: 'COMPLETED',
          rewardCredited: true,
        },
      });
      await prisma.referral.create({
        data: {
          referrerId: referrerA.id,
          referredId: leaderG.id,
          referralCode: `GOB-LEAD-${referrerA.id}-1`,
          status: 'COMPLETED',
          rewardCredited: true,
        },
      });

      const c = await caller(null);
      const board = await c.referrals.leaderboard({});
      expect(board.length).toBeLessThanOrEqual(10);
      for (let i = 1; i < board.length; i++) {
        expect(board[i - 1]!._count.id).toBeGreaterThanOrEqual(board[i]!._count.id);
      }
      const cEntry = board.find((e: any) => e.referrerId === secondC.id);
      const aEntry = board.find((e: any) => e.referrerId === referrerA.id);
      expect(cEntry?._count.id).toBe(2);
      expect(aEntry?._count.id).toBe(1);
    });

    it('respects a custom limit', async () => {
      const c = await caller(null);
      const board = await c.referrals.leaderboard({ limit: 1 });
      expect(board.length).toBeLessThanOrEqual(1);
    });

    it('validates the limit input', async () => {
      const c = await caller(null);
      await expect(c.referrals.leaderboard({ limit: 'abc' as any })).rejects.toThrow();
    });
  });

  // ── getEnhancedStats ─────────────────────────────────────────────────
  describe('getEnhancedStats', () => {
    it('returns the starter tier for a user with no referrals', async () => {
      const d = await caller(freshD);
      const s = await d.referrals.getEnhancedStats();
      expect(s.referralCode).toBe('——');
      expect(s.totalReferrals).toBe(0);
      expect(s.completedReferrals).toBe(0);
      expect(s.totalEarnings).toBe(0);
      expect(s.tier).toBe(' مبتدئ');
      expect(s.nextTier).toBe(' فضي (إحالة واحدة)');
      expect(s.nextCount).toBe(1);
      expect(s.referrerBonus).toBe(20);
      expect(s.referredBonus).toBe(20);
      expect(s.recentReferrals).toHaveLength(0);
      expect(s.completedReferrals).toBeLessThanOrEqual(s.totalReferrals);
      expect(s.nextCount).toBeGreaterThanOrEqual(0);
    });

    it('tiers the referrer as the completed count grows', async () => {
      // A: 1 PENDING (by B) + 1 COMPLETED/rewardCredited (by G) -> silver tier
      const a = await caller(referrerA);
      const s = await a.referrals.getEnhancedStats();
      expect(s.totalReferrals).toBe(2);
      expect(s.completedReferrals).toBe(1);
      expect(s.totalEarnings).toBe(20);
      expect(s.tier).toBe(' فضي');
      expect(s.nextTier).toBe(' ذهبي (٥ إحالات)');
      expect(s.nextCount).toBe(4);
      expect(s.referralCode).toBe(`GOB-LEAD-${referrerA.id}-1`); // most recent first
      expect(s.recentReferrals).toHaveLength(2);
      expect(s.recentReferrals[0]!.rewarded).toBe(true);
      expect(s.recentReferrals[1]!.rewarded).toBe(false);
      expect(s.recentReferrals[1]!.referredId).toBe(referredB.id);

      // C: 2 COMPLETED/rewardCredited from the leaderboard test + 3 more
      // seeded here -> gold tier (>= 5 completed)
      for (let i = 3; i <= 5; i++) {
        await prisma.referral.create({
          data: {
            referrerId: secondC.id,
            referredId: leaderE.id, // referredId has no uniqueness constraint
            referralCode: `GOB-LEAD-${secondC.id}-${i}`,
            status: 'COMPLETED',
            rewardCredited: true,
          },
        });
      }
      const c = await caller(secondC);
      const cs = await c.referrals.getEnhancedStats();
      expect(cs.totalReferrals).toBe(5);
      expect(cs.completedReferrals).toBe(5);
      expect(cs.tier).toBe(' ذهبي');
      expect(cs.nextTier).toBe(' الماسي (١٠ إحالات)');
      expect(cs.nextCount).toBe(5);
      expect(cs.totalEarnings).toBe(100); // 5 x default 20
    });

    it('rejects anonymous callers', async () => {
      const c = await caller(null);
      await expect(c.referrals.getEnhancedStats()).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });
  });
});
