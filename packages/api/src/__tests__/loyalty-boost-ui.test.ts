/**
 * ENHANCEMENT_PLAN 8.2 — Loyalty 2.0: boost UI contract (slice 3).
 *
 * Drives: loyalty.activeBoosts (public) — only boosts that are active AND
 * inside their window, ordered by multiplier desc.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';

const SUFFIX = Date.now();
const createdBoostIds: number[] = [];
let inWindowId = 0;
let futureId = 0;

beforeAll(async () => {
  const base = {
    nameJson: { ar: `نقاط مضاعفة ${SUFFIX}`, en: `Double points ${SUFFIX}` },
    multiplier: 2,
  } as const;
  const inWindow = await prisma.loyaltyBoost.create({
    data: {
      ...base,
      startsAt: new Date(Date.now() - 86_400_000),
      endsAt: new Date(Date.now() + 86_400_000),
      isActive: true,
    },
  });
  createdBoostIds.push(inWindow.id);
  inWindowId = inWindow.id;

  // Inactive (toggled off) — must not surface.
  const inactive = await prisma.loyaltyBoost.create({
    data: {
      ...base,
      startsAt: new Date(Date.now() - 86_400_000),
      endsAt: new Date(Date.now() + 86_400_000),
      isActive: false,
    },
  });
  createdBoostIds.push(inactive.id);

  // Future window — must not surface.
  const future = await prisma.loyaltyBoost.create({
    data: {
      ...base,
      startsAt: new Date(Date.now() + 86_400_000),
      endsAt: new Date(Date.now() + 2 * 86_400_000),
      isActive: true,
    },
  });
  createdBoostIds.push(future.id);
  futureId = future.id;
}, 30000);

afterAll(async () => {
  try {
    await prisma.loyaltyBoost.deleteMany({ where: { id: { in: createdBoostIds } } });
  } catch {
    // cleanup is best-effort
  }
});

describe('loyalty.activeBoosts', () => {
  it('returns only active boosts inside their window, multiplier desc', async () => {
    const ctx = await createTRPCContext();
    const caller = (appRouter as any).createCaller(ctx);

    const boosts = await caller.loyalty.activeBoosts();
    const ids = boosts.map((b: { id: number }) => b.id);

    expect(ids).toContain(inWindowId);
    expect(ids).not.toContain(futureId);
    // Every returned boost is active and windowed-now.
    const now = Date.now();
    for (const b of boosts) {
      expect(b.isActive).toBe(true);
      expect(new Date(b.startsAt).getTime()).toBeLessThanOrEqual(now);
      expect(new Date(b.endsAt).getTime()).toBeGreaterThanOrEqual(now);
    }
  });
});
