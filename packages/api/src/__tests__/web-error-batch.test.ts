/**
 * Web error batch contracts (audit 2026-09-30, W1/W8/W9).
 *
 * W1: AI-subscription procedures are CUSTOMER-gated (the customer pages
 * call them and were getting FORBIDDEN under technicianProcedure).
 * W8: the admin cashback rate is persisted, and info reflects it.
 * W9: event tickets are really persisted; capacity is enforced;
 * myTickets returns real rows.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';
import type { JwtPayload } from '../lib/jwt';
import { buildUser, safeFutureDate } from './factories';

const CSRF = 'a'.repeat(64);

async function caller(user?: JwtPayload) {
  const ctx = await createTRPCContext({ user, csrfCookie: CSRF, csrfHeader: CSRF });
  return (appRouter as any).createCaller(ctx);
}

let customer: JwtPayload;
const createdUserIds: number[] = [];

beforeAll(async () => {
  const u = await prisma.user.create({ data: buildUser() });
  customer = { id: u.id, role: 'CUSTOMER', email: u.email };
  createdUserIds.push(u.id);
}, 15000);

afterAll(async () => {
  try {
    await prisma.customerAiSubscription.deleteMany({ where: { userId: { in: createdUserIds } } });
  } catch {}
  try {
    await prisma.eventTicket.deleteMany({ where: { userId: { in: createdUserIds } } });
  } catch {}
  try {
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  } catch {}
});

describe('subscriptions — customer-tier access (W1)', () => {
  it('purchase, getMySubscription, getUsage, and cancelAutoRenew work for CUSTOMER', async () => {
    const c = await caller(customer);
    const plans = await c.subscriptions.getPlans();
    expect(plans.length).toBeGreaterThan(0);
    const plan = plans[0] as { id: number };

    const bought = await c.subscriptions.purchase({ planId: plan.id });
    expect(bought.status).toBe('ACTIVE');
    expect(bought.planId).toBe(plan.id);

    const mine = await c.subscriptions.getMySubscription();
    expect(mine.plan.id).toBe(plan.id);
    expect(mine.status).toBe('ACTIVE');

    const usage = await c.subscriptions.getUsage();
    expect(usage.subscriptionId).toBe(mine.id);

    const cancelled = await c.subscriptions.cancelAutoRenew();
    expect(cancelled.autoRenew).toBe(false);
  });
});

describe('cashback — persisted rate (W8)', () => {
  it('setRate persists to PlatformConfig and info returns the configured rate', async () => {
    const admin = await caller({ id: 1, role: 'ADMIN', email: 'admin@test.local' });
    const c = await caller(customer);

    await admin.cashback.setRate({ rate: 7 });
    const cfg = await prisma.platformConfig.findUnique({ where: { key: 'cashback_rate' } });
    expect(cfg?.value).toBe('7');

    const info = await c.cashback.info();
    expect(info.rate).toBe(7);

    // Restore the default so money-integrity flows keep the 5% fallback.
    await admin.cashback.setRate({ rate: 5 });
    const restored = await c.cashback.info();
    expect(restored.rate).toBe(5);
  });
});

describe('eventTickets — real persistence (W9)', () => {
  let eventId: number;

  beforeAll(async () => {
    const start = safeFutureDate(3);
    const ev = await prisma.beautyEvent.create({
      data: {
        nameJson: { ar: 'فعالية اختبار', en: 'Test Event' },
        eventType: 'workshop',
        startsAt: start,
        endsAt: new Date(start.getTime() + 3_600_000),
        isPublished: true,
        maxAttendees: 2,
      },
    });
    eventId = ev.id;
  }, 15000);

  afterAll(async () => {
    try {
      await prisma.eventTicket.deleteMany({ where: { eventId } });
    } catch {}
    try {
      await prisma.beautyEvent.deleteMany({ where: { id: eventId } });
    } catch {}
  });

  it('reserve persists a RESERVED ticket and myTickets lists it', async () => {
    const c = await caller(customer);
    const r = await c.eventTickets.reserve({ eventId, attendeeName: 'نورة' });
    expect(r.status).toBe('RESERVED');
    expect(r.ticketId).toBeTruthy();

    const row = await prisma.eventTicket.findUnique({ where: { id: Number(r.ticketId) } });
    expect(row).not.toBeNull();
    expect(row!.userId).toBe(customer.id);
    expect(row!.eventId).toBe(eventId);
    expect(row!.attendeeName).toBe('نورة');

    const mine = await c.eventTickets.myTickets();
    expect(mine.tickets.some((t: { id: number }) => t.id === Number(r.ticketId))).toBe(true);
  });

  it('enforces maxAttendees capacity', async () => {
    const c = await caller(customer);
    await c.eventTickets.reserve({ eventId, attendeeName: 'حصة' }); // fills to 2/2
    await expect(c.eventTickets.reserve({ eventId, attendeeName: 'سارة' })).rejects.toThrow();
  });

  it('rejects an unknown event', async () => {
    const c = await caller(customer);
    await expect(c.eventTickets.reserve({ eventId: 999999, attendeeName: 'x' })).rejects.toThrow(
      'الفعالية غير موجودة',
    );
  });
});
