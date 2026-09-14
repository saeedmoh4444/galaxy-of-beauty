/**
 * C3 (Tier 3 #8) — goal-linked installment plans. A persisted BnplPlan can
 * be attached to a savings goal ("laser course by wedding day"); the list
 * query returns the linked plan with decimal-safe numbers.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

let user: JwtPayload;
let otherUser: JwtPayload;
const createdUserIds: number[] = [];
const createdGoalIds: number[] = [];
const createdPlanIds: number[] = [];

async function caller(u: JwtPayload | null) {
  return (appRouter as any).createCaller({ user: u, ip: '127.0.0.1' });
}

describe('goal-linked Bnpl plans (C3)', () => {
  beforeAll(async () => {
    const u = await prisma.user.create({ data: buildUser() });
    const o = await prisma.user.create({ data: buildUser() });
    user = { id: u.id, role: 'CUSTOMER', email: u.email };
    otherUser = { id: o.id, role: 'CUSTOMER', email: o.email };
    createdUserIds.push(u.id, o.id);
  }, 15000);

  afterAll(async () => {
    try {
      await prisma.savingsGoal.deleteMany({ where: { userId: { in: createdUserIds } } });
    } catch {}
    try {
      await prisma.bnplPlan.deleteMany({ where: { userId: { in: createdUserIds } } });
    } catch {}
    try {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    } catch {}
  });

  it('attachBnpl links an owned plan to an owned goal', async () => {
    const c = await caller(user);
    const plan = await c.bnpl.createPlan({ amount: 2400, provider: 'tabby', installments: 4 });
    createdPlanIds.push(plan.planId);
    const goal = await c.savingsGoals.create({ title: 'دورة ليزر قبل الزواج', targetAmount: 2400 });
    createdGoalIds.push(goal.id);

    const updated = await c.savingsGoals.attachBnpl({ goalId: goal.id, bnplPlanId: plan.planId });
    expect(updated.bnplPlanId).toBe(plan.planId);
  });

  it('attachBnpl rejects a plan owned by another user', async () => {
    const other = await caller(otherUser);
    const foreignPlan = await other.bnpl.createPlan({ amount: 500, provider: 'tamara' });
    createdPlanIds.push(foreignPlan.planId);

    const c = await caller(user);
    const goal = await c.savingsGoals.create({ title: 'هدف اختبار', targetAmount: 500 });
    createdGoalIds.push(goal.id);

    await expect(
      c.savingsGoals.attachBnpl({ goalId: goal.id, bnplPlanId: foreignPlan.planId }),
    ).rejects.toThrow();
  });

  it('list includes the linked plan with decimal-safe numbers', async () => {
    const c = await caller(user);
    const goals = await c.savingsGoals.list();
    const linked = goals.find((g: { id: number }) => g.id === createdGoalIds[0]);
    expect(linked).toBeDefined();
    expect(linked!.bnplPlan).toBeTruthy();
    expect(typeof linked!.bnplPlan.totalAmount).toBe('number');
    expect(typeof linked!.bnplPlan.monthlyPayment).toBe('number');
  });
});
