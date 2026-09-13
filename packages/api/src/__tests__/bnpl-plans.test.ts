/**
 * E4b — BNPL persistence. createPlan used to compute a schedule and throw it
 * away; now it stores a BnplPlan, myPlans lists the user's plans, and
 * markPaid advances the installment schedule to COMPLETED.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

let user: JwtPayload;
let otherUser: JwtPayload;
const createdUserIds: number[] = [];

async function caller(u: JwtPayload | null) {
  return (appRouter as any).createCaller({ user: u, ip: '127.0.0.1' });
}

describe('bnpl plan persistence (E4b)', () => {
  beforeAll(async () => {
    const u = await prisma.user.create({ data: buildUser() });
    const o = await prisma.user.create({ data: buildUser() });
    user = { id: u.id, role: 'CUSTOMER', email: u.email };
    otherUser = { id: o.id, role: 'CUSTOMER', email: o.email };
    createdUserIds.push(u.id, o.id);
  }, 15000);

  afterAll(async () => {
    try {
      await prisma.bnplPlan.deleteMany({ where: { userId: { in: createdUserIds } } });
    } catch {}
    try {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    } catch {}
  });

  it('rejects anonymous access', async () => {
    const anon = await caller(null);
    await expect(anon.bnpl.createPlan({ amount: 1200, provider: 'tabby' })).rejects.toThrow();
    await expect(anon.bnpl.myPlans()).rejects.toThrow();
    await expect(anon.bnpl.markPaid({ planId: 1 })).rejects.toThrow();
  });

  it('createPlan persists the plan and returns planId + schedule', async () => {
    const c = await caller(user);
    const plan = await c.bnpl.createPlan({ amount: 1200, provider: 'tabby', installments: 4 });

    expect(plan.planId).toBeTruthy();
    expect(plan.totalAmount).toBe(1200);
    expect(plan.monthlyPayment).toBe(300);
    expect(plan.schedule).toHaveLength(4);
    expect(plan.schedule![0].month).toBe(1);
    expect(plan.schedule![0].paid).toBe(false);

    const stored = await prisma.bnplPlan.findUniqueOrThrow({ where: { id: plan.planId } });
    expect(stored.userId).toBe(user.id);
    expect(stored.status).toBe('ACTIVE');
    expect(stored.paidCount).toBe(0);
    expect(Number(stored.totalAmount)).toBe(1200);
    expect(stored.schedule).toHaveLength(4);
  });

  it('rejects an unknown provider', async () => {
    const c = await caller(user);
    await expect(
      c.bnpl.createPlan({ amount: 900, provider: 'unknown-provider' as any }),
    ).rejects.toThrow();
  });

  it('myPlans lists only the caller plans, newest first', async () => {
    const c = await caller(user);
    await c.bnpl.createPlan({ amount: 800, provider: 'tamara', installments: 4 });

    const mine = await c.bnpl.myPlans();
    expect(mine.length).toBe(2);
    expect(mine.every((p: any) => p.userId === user.id)).toBe(true);
    expect(new Date(mine[0]!.createdAt).getTime()).toBeGreaterThanOrEqual(
      new Date(mine[1]!.createdAt).getTime(),
    );

    const others = await caller(otherUser);
    const theirs = await others.bnpl.myPlans();
    expect(theirs).toHaveLength(0);
  });

  it('markPaid advances the schedule and completes the final installment', async () => {
    const c = await caller(user);
    const mine = await c.bnpl.myPlans();
    const plan = mine.find((p: any) => p.installments === 4 && Number(p.monthlyPayment) === 300)!;

    const afterFirst = await c.bnpl.markPaid({ planId: plan.id });
    expect(afterFirst.paidCount).toBe(1);
    expect(afterFirst.remainingPayments).toBe(3);
    expect(afterFirst.schedule[0].paid).toBe(true);
    expect(afterFirst.schedule[1].paid).toBe(false);
    expect(afterFirst.status).toBe('ACTIVE');

    await c.bnpl.markPaid({ planId: plan.id });
    await c.bnpl.markPaid({ planId: plan.id });
    const done = await c.bnpl.markPaid({ planId: plan.id });
    expect(done.paidCount).toBe(4);
    expect(done.remainingPayments).toBe(0);
    expect(done.status).toBe('COMPLETED');
    expect(done.schedule.every((s: any) => s.paid)).toBe(true);

    // Paying a completed plan is rejected.
    await expect(c.bnpl.markPaid({ planId: plan.id })).rejects.toThrow();
  });
});
