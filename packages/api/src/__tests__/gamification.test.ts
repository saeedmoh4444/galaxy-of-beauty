/**
 * Audit #14 — the gamification stubs returned "coming soon" placeholders.
 * leaderboard + myPoints are now real: LoyaltyAccount-backed.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

let topUser: JwtPayload;
const userIds: number[] = [];
const accountIds: number[] = [];

function callerFor(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

async function makeAccount(points: number): Promise<JwtPayload> {
  const u = await prisma.user.create({ data: buildUser() });
  userIds.push(u.id);
  const acc = await prisma.loyaltyAccount.create({
    data: { userId: u.id, points, lifetimePoints: points, tier: 'GOLD' },
  });
  accountIds.push(acc.id);
  return { id: u.id, role: 'CUSTOMER', email: u.email };
}

beforeAll(async () => {
  await makeAccount(3000);
  topUser = await makeAccount(5000);
  await makeAccount(4000);
}, 15000);

afterAll(async () => {
  try {
    await prisma.loyaltyAccount.deleteMany({ where: { id: { in: accountIds } } });
  } catch {}
  try {
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  } catch {}
});

describe('gamification (audit #14)', () => {
  it('leaderboard returns users ordered by loyalty points, names joined', async () => {
    const caller = callerFor(null);
    const board = await caller.beautyGamification.leaderboard({ limit: 20 });

    // Seeded accounts may outrank the fixtures — scope to the fixtures and
    // assert their relative order and shape.
    const mine = board.items.filter((i: { userId: number }) => userIds.includes(i.userId));
    expect(mine.length).toBe(3);
    expect(mine[0].userId).toBe(topUser.id);
    expect(mine[0].points).toBe(5000);
    expect(typeof mine[0].userName).toBe('string');
    expect(mine[0].points).toBeGreaterThanOrEqual(mine[1].points);
    expect(mine[1].points).toBeGreaterThanOrEqual(mine[2].points);
    expect(board.message).toBeUndefined(); // no more "coming soon"
  }, 15000);

  it('myPoints returns the caller points and tier (zero-account → 0/SILVER)', async () => {
    const caller = callerFor(topUser);
    const mine = await caller.beautyGamification.myPoints();
    expect(mine.points).toBe(5000);
    expect(mine.tier).toBe('GOLD');
    expect(Array.isArray(mine.challenges)).toBe(true);

    const fresh = await prisma.user.create({ data: buildUser() });
    userIds.push(fresh.id);
    const empty = await callerFor({ id: fresh.id, role: 'CUSTOMER', email: fresh.email });
    const zero = await empty.beautyGamification.myPoints();
    expect(zero.points).toBe(0);
    expect(zero.tier).toBe('SILVER');
  }, 15000);
});
