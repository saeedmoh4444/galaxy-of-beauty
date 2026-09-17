/**
 * ENHANCEMENT_PLAN 2.2 — Beauty Subscription (SaaS for customers).
 *
 * SUB-1 contract: the seeded Basic/Premium/VIP catalog (monthly + yearly),
 * subscribe() setting a 12-month period for YEARLY plans with autoRenew
 * defaulting to true, and the existing pause/resume/cancel lifecycle.
 * SUB-2 contract: renewal engine + bookings.create enforcement (cap,
 * discount, bookingsThisMonth increment).
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';
import { generateCsrfToken } from '../lib/csrf';
import { buildUser } from './factories';
import { renewDueSubscriptions, sendRenewalReminders } from '../workers/subscriptionRenewal';
import type { JwtPayload } from '../lib/jwt';

const CSRF = generateCsrfToken();

async function authCaller(user: JwtPayload) {
  const ctx = await createTRPCContext({ user, csrfCookie: CSRF, csrfHeader: CSRF });
  return (appRouter as any).createCaller(ctx);
}

let customer: JwtPayload;
const createdUserIds: number[] = [];
const createdSubIds: number[] = [];
const createdBookingIds: number[] = [];
const createdServiceIds: number[] = [];
const createdCategoryIds: number[] = [];
let techUserId = 0;
let addressId = 0;
let plainServiceId = 0;

beforeAll(async () => {
  const u = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(u.id);
  customer = { id: u.id, role: 'CUSTOMER', email: u.email };

  // Booking fixtures for the enforcement tests.
  const cat = await prisma.category.findFirst({ select: { id: true } });
  const address = await prisma.address.findFirst({ select: { id: true } });
  const tech = await prisma.technician.findFirst({ select: { userId: true } });
  techUserId = tech?.userId ?? 1;
  addressId = address?.id ?? 1;
  const svc = await prisma.service.create({
    data: {
      categoryId: cat?.id ?? 1,
      titleJson: { ar: 'خدمة اشتراك', en: 'Subscription service' },
      descriptionJson: { ar: 'x', en: 'x' },
      basePrice: 100,
      durationMin: 60,
      slug: `sub-test-svc-${Date.now()}`,
      sortOrder: 999,
    },
  });
  plainServiceId = svc.id;
  createdServiceIds.push(svc.id);
}, 30000);

afterAll(async () => {
  try {
    await prisma.booking.deleteMany({ where: { id: { in: createdBookingIds } } });
  } catch {}
  try {
    await prisma.customerSubscription.deleteMany({ where: { id: { in: createdSubIds } } });
  } catch {}
  try {
    await prisma.service.deleteMany({ where: { id: { in: createdServiceIds } } });
  } catch {}
  try {
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  } catch {}
});

async function bookOne(start: Date): Promise<number> {
  const c = await authCaller(customer);
  const booking = await c.bookings.create({
    technicianId: techUserId,
    serviceId: plainServiceId,
    addressId,
    startAt: start.toISOString(),
    endAt: new Date(start.getTime() + 3_600_000).toISOString(),
    idempotencyKey: `sub-bk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  });
  createdBookingIds.push(booking.id);
  return Number(booking.totalAmount);
}

/** Find-or-create an ACTIVE subscription for the test customer (earlier
 *  tests in this file may already hold one for the same plan). All OTHER
 *  customer subs are paused so bookings.create enforcement sees exactly
 *  this one (findFirst has no ordering guarantee). */
async function setActiveSub(planId: number, autoRenew = true): Promise<number> {
  await prisma.customerSubscription.updateMany({
    where: { userId: customer.id, planId: { not: planId } },
    data: { status: 'PAUSED' },
  });
  const existing = await prisma.customerSubscription.findUnique({
    where: { userId_planId: { userId: customer.id, planId } },
  });
  if (existing) {
    const updated = await prisma.customerSubscription.update({
      where: { id: existing.id },
      data: {
        status: 'ACTIVE',
        autoRenew,
        cancelledAt: null,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 86_400_000),
        bookingsThisMonth: 0,
      },
    });
    return updated.id;
  }
  const created = await prisma.customerSubscription.create({
    data: {
      userId: customer.id,
      planId,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 86_400_000),
      autoRenew,
    },
  });
  return created.id;
}

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

describe('renewal engine (2.2 SUB-2)', () => {
  it('renews an autoRenew subscription and resets bookingsThisMonth', async () => {
    const c = await authCaller(customer);
    const plans = await c.subscriptionBoxes.plans();
    const monthly = plans.find(
      (p: any) => p.interval === 'MONTHLY' && JSON.stringify(p.nameJson).includes('Basic'),
    );

    const subId = await setActiveSub(monthly.id);
    // Force the period to be due now + fake usage.
    await prisma.customerSubscription.update({
      where: { id: subId },
      data: {
        currentPeriodStart: new Date(Date.now() - 45 * 86_400_000),
        currentPeriodEnd: new Date(Date.now() - 15 * 86_400_000),
        bookingsThisMonth: 2,
      },
    });

    const { renewed, expired } = await renewDueSubscriptions();
    expect(renewed).toBeGreaterThanOrEqual(1);
    expect(expired).toBe(0);

    const after = await prisma.customerSubscription.findUniqueOrThrow({ where: { id: subId } });
    expect(after.status).toBe('ACTIVE');
    expect(after.currentPeriodEnd.getTime()).toBeGreaterThan(Date.now());
    expect(after.bookingsThisMonth).toBe(0);
  });

  it('expires an autoRenew=false subscription past its period', async () => {
    const c = await authCaller(customer);
    const plans = await c.subscriptionBoxes.plans();
    const yearly = plans.find((p: any) => p.interval === 'YEARLY');

    const subId = await setActiveSub(yearly.id, false);
    await prisma.customerSubscription.update({
      where: { id: subId },
      data: {
        currentPeriodStart: new Date(Date.now() - 400 * 86_400_000),
        currentPeriodEnd: new Date(Date.now() - 35 * 86_400_000),
      },
    });

    const { expired } = await renewDueSubscriptions();
    expect(expired).toBeGreaterThanOrEqual(1);

    const after = await prisma.customerSubscription.findUniqueOrThrow({ where: { id: subId } });
    expect(after.status).toBe('EXPIRED');
  });

  it('reminds subscriptions renewing within 3 days', async () => {
    const c = await authCaller(customer);
    const plans = await c.subscriptionBoxes.plans();
    const monthly = plans.find(
      (p: any) => p.interval === 'MONTHLY' && JSON.stringify(p.nameJson).includes('Premium'),
    );

    const subId = await setActiveSub(monthly.id);
    await prisma.customerSubscription.update({
      where: { id: subId },
      data: { currentPeriodEnd: new Date(Date.now() + 2 * 86_400_000) },
    });

    const reminded = await sendRenewalReminders();
    expect(reminded).toBeGreaterThanOrEqual(1);
  });
});

describe('bookings.create enforcement (2.2 SUB-2)', () => {
  it('discounts additional services beyond the plan allowance', async () => {
    const c = await authCaller(customer);
    const plans = await c.subscriptionBoxes.plans();
    const basic = plans.find(
      (p: any) => p.interval === 'MONTHLY' && JSON.stringify(p.nameJson).includes('Basic'),
    );

    const subId = await setActiveSub(basic.id);
    // 2 bookings already used → the next one is an "additional service".
    await prisma.customerSubscription.update({
      where: { id: subId },
      data: { bookingsThisMonth: 2 },
    });

    const total = await bookOne(new Date(Date.now() + 3 * 86_400_000));
    expect(total).toBe(90); // 100 - 10%

    const after = await prisma.customerSubscription.findUniqueOrThrow({ where: { id: subId } });
    expect(after.bookingsThisMonth).toBe(3);
  });

  it('does not discount within the plan allowance', async () => {
    const c = await authCaller(customer);
    const plans = await c.subscriptionBoxes.plans();
    const basic = plans.find(
      (p: any) => p.interval === 'MONTHLY' && JSON.stringify(p.nameJson).includes('Basic'),
    );

    await setActiveSub(basic.id);

    const total = await bookOne(new Date(Date.now() + 4 * 86_400_000));
    expect(total).toBe(100);
  });

  it('blocks bookings beyond the VIP cap', async () => {
    const c = await authCaller(customer);
    const plans = await c.subscriptionBoxes.plans();
    const vip = plans.find(
      (p: any) => p.interval === 'MONTHLY' && JSON.stringify(p.nameJson).includes('VIP'),
    );

    const subId = await setActiveSub(vip.id);
    await prisma.customerSubscription.update({
      where: { id: subId },
      data: { bookingsThisMonth: 8 },
    });

    await expect(bookOne(new Date(Date.now() + 5 * 86_400_000))).rejects.toThrow(
      /Monthly subscription limit/,
    );
  });
});
