/**
 * ENHANCEMENT_PLAN 2.2 — Beauty Subscription (SaaS for customers).
 *
 * SUB-1 contract: the seeded Basic/Premium/VIP catalog (monthly + yearly),
 * subscribe() setting a 12-month period for YEARLY plans with autoRenew
 * defaulting to true, and the existing pause/resume/cancel lifecycle.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';
import { generateCsrfToken } from '../lib/csrf';
import { buildUser } from './factories';
import type { JwtPayload } from '../lib/jwt';

const CSRF = generateCsrfToken();

async function authCaller(user: JwtPayload) {
  const ctx = await createTRPCContext({ user, csrfCookie: CSRF, csrfHeader: CSRF });
  return (appRouter as any).createCaller(ctx);
}

let customer: JwtPayload;
const createdUserIds: number[] = [];
const createdSubIds: number[] = [];

beforeAll(async () => {
  const u = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(u.id);
  customer = { id: u.id, role: 'CUSTOMER', email: u.email };
}, 15000);

afterAll(async () => {
  try {
    await prisma.customerSubscription.deleteMany({ where: { id: { in: createdSubIds } } });
  } catch {}
  try {
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  } catch {}
});

describe('beauty subscription catalog (2.2 SUB-1)', () => {
  it('lists seeded monthly and yearly plans with perks', async () => {
    const c = await authCaller(customer);
    const plans = await c.subscriptionBoxes.plans();
    expect(plans.length).toBeGreaterThanOrEqual(3);

    const bySlugName = (frag: string) =>
      plans.find((p: any) => JSON.stringify(p.nameJson).includes(frag));

    const basic = bySlugName('Basic');
    expect(basic).toBeDefined();
    expect(Number(basic.price)).toBe(199);
    expect(basic.interval).toBe('MONTHLY');
    expect(basic.servicesPerMonth).toBe(2);
    expect(basic.discountPercent).toBe(10);

    const vip = bySlugName('VIP');
    expect(vip).toBeDefined();
    expect(vip.servicesPerMonth).toBe(8);
    expect(vip.priorityBooking).toBe(true);

    const yearly = plans.find((p: any) => p.interval === 'YEARLY');
    expect(yearly).toBeDefined();
  });

  it('subscribe defaults autoRenew to true and prices a YEARLY plan for 12 months', async () => {
    const c = await authCaller(customer);
    const plans = await c.subscriptionBoxes.plans();
    const yearly = plans.find((p: any) => p.interval === 'YEARLY');

    const sub = await c.subscriptionBoxes.subscribe({ planId: yearly.id });
    createdSubIds.push(sub.id);

    expect(sub.autoRenew).toBe(true);
    const start = new Date(sub.currentPeriodStart);
    const end = new Date(sub.currentPeriodEnd);
    const months =
      (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    expect(months).toBe(12);

    // Yearly price = 10 monthly payments ("2 months free").
    expect(Number(sub.plan.price)).toBe(Number(yearly.price));
  });

  it('rejects a second active subscription to the same plan', async () => {
    const c = await authCaller(customer);
    const plans = await c.subscriptionBoxes.plans();
    const monthly = plans.find(
      (p: any) => p.interval === 'MONTHLY' && JSON.stringify(p.nameJson).includes('Basic'),
    );

    const sub = await c.subscriptionBoxes.subscribe({ planId: monthly.id });
    createdSubIds.push(sub.id);

    await expect(c.subscriptionBoxes.subscribe({ planId: monthly.id })).rejects.toThrow(
      /Already subscribed/,
    );
  });

  it('pause/resume/cancel lifecycle works with the new autoRenew field intact', async () => {
    const c = await authCaller(customer);
    const plans = await c.subscriptionBoxes.plans();
    const monthly = plans.find(
      (p: any) => p.interval === 'MONTHLY' && JSON.stringify(p.nameJson).includes('Premium'),
    );

    const sub = await c.subscriptionBoxes.subscribe({ planId: monthly.id });
    createdSubIds.push(sub.id);

    const paused = await c.subscriptionBoxes.pause({ id: sub.id });
    expect(paused.status).toBe('PAUSED');

    const resumed = await c.subscriptionBoxes.resume({ id: sub.id });
    expect(resumed.status).toBe('ACTIVE');

    const cancelled = await c.subscriptionBoxes.cancel({ id: sub.id });
    expect(cancelled.status).toBe('CANCELLED');
    expect(cancelled.cancelledAt).toBeTruthy();
    // Cancelling also switches auto-renewal off.
    expect(cancelled.autoRenew).toBe(false);
  });
});
