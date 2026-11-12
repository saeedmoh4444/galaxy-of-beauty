/**
 * W1 money flows (audit 2026-11-11) — wallet top-up, withdraw replay
 * scoping, dispute 409, flash-deal counter integrity, capture cashback
 * exactly-once, subscription conditional debit.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';
import type { JwtPayload } from '../lib/jwt';
import { safeFutureDate } from './factories';

const CSRF = 'a'.repeat(64);

async function authCaller(user: JwtPayload | null) {
  const ctx = await createTRPCContext({
    user: user ?? undefined,
    csrfCookie: CSRF,
    csrfHeader: CSRF,
  });
  return (
    appRouter as never as { createCaller: (c: unknown) => Record<string, unknown> }
  ).createCaller(ctx) as Record<string, unknown>;
}

let customer: JwtPayload;
let technician: JwtPayload;
let technicianUserId: number;
let technicianRecordId: number;
let serviceId: number;
let addressId: number;

const createdBookingIds: number[] = [];
const createdPaymentIds: number[] = [];
const createdDisputeIds: number[] = [];
const createdDealIds: number[] = [];

let uid = 0;
const newIdemKey = () => `money_flow_${Date.now()}_${uid++}`;

beforeAll(async () => {
  const anonCtx = await createTRPCContext({ csrfCookie: CSRF, csrfHeader: CSRF });
  const anon = (
    appRouter as never as { createCaller: (c: unknown) => Record<string, unknown> }
  ).createCaller(anonCtx) as Record<string, unknown>;
  const login = await (
    anon.auth as {
      login: (i: unknown) => Promise<{ user: { id: number; role: string; email: string } }>;
    }
  ).login({
    email: 'customer@test.com',
    password: 'Admin@123456',
  });
  customer = { id: login.user.id, role: login.user.role, email: login.user.email };

  const tech = await prisma.technician.findFirst({
    include: { user: true },
    where: { user: { role: 'TECHNICIAN' } },
  });
  if (!tech) throw new Error('No technician in seed data');
  technician = { id: tech.userId, role: 'TECHNICIAN', email: tech.user.email };
  technicianUserId = tech.userId;
  technicianRecordId = tech.id;

  const service = await prisma.service.findFirst({ orderBy: { id: 'asc' } });
  if (!service) throw new Error('No service in seed data');
  serviceId = service.id;

  const address = await prisma.address.create({
    data: {
      userId: customer.id,
      label: 'flow-test',
      city: 'الرياض',
      area: 'تجريبي',
      street: 'شارع الاختبار',
    },
  });
  addressId = address.id;
}, 60000);

afterAll(async () => {
  await prisma.payment.deleteMany({ where: { id: { in: createdPaymentIds } } });
  await prisma.dispute.deleteMany({ where: { id: { in: createdDisputeIds } } });
  await prisma.booking.deleteMany({ where: { id: { in: createdBookingIds } } });
  await prisma.flashDeal.deleteMany({ where: { id: { in: createdDealIds } } });
  await prisma.address.deleteMany({ where: { id: addressId } });
});

describe('W1 money flows', () => {
  it('topUp: simulate mode completes the credit; replay is idempotent', async () => {
    const caller = (await authCaller(customer)) as {
      wallet: { topUp: (i: unknown) => Promise<{ balance: number; status: string }> };
    };
    const wallet = await prisma.wallet.findUniqueOrThrow({ where: { userId: customer.id } });
    const before = Number(wallet.balance);
    const key = newIdemKey();

    const first = await caller.wallet.topUp({ amount: 50, idempotencyKey: key });
    expect(first.status).toBe('COMPLETED');

    const after = await prisma.wallet.findUniqueOrThrow({ where: { id: wallet.id } });
    expect(Number(after.balance)).toBe(before + 50);
    const txn = await prisma.walletTransaction.findUniqueOrThrow({
      where: { idempotencyKey: key },
    });
    expect(txn.source).toBe('TOP_UP');
    expect(txn.status).toBe('COMPLETED');

    // Replay: same key returns COMPLETED without another credit.
    const second = await caller.wallet.topUp({ amount: 50, idempotencyKey: key });
    expect(second.status).toBe('COMPLETED');
    const afterReplay = await prisma.wallet.findUniqueOrThrow({ where: { id: wallet.id } });
    expect(Number(afterReplay.balance)).toBe(before + 50);
  });

  it('withdraw: a foreign idempotency key is rejected without leaking data', async () => {
    // withdraw is technician-tier: technician A replays a key that belongs
    // to technician B's transaction — must CONFLICT, not return the txn.
    const techB = await prisma.technician.findFirst({
      where: { userId: { not: technicianUserId } },
      include: { user: true },
    });
    if (!techB) throw new Error('No second technician in seed data');

    const techBWallet = await prisma.wallet.findUnique({ where: { userId: techB.userId } });
    expect(techBWallet).not.toBeNull();
    const key = newIdemKey();
    await prisma.walletTransaction.create({
      data: {
        walletId: techBWallet!.id,
        type: 'DEBIT',
        source: 'WITHDRAWAL',
        amount: 100,
        idempotencyKey: key,
      },
    });

    const techACaller = (await authCaller(technician)) as {
      wallet: { withdraw: (i: unknown) => Promise<unknown> };
    };
    await expect(
      techACaller.wallet.withdraw({ amount: 100, idempotencyKey: key }),
    ).rejects.toMatchObject({ code: 'CONFLICT' });
  });

  it('disputes: a duplicate dispute returns 409 CONFLICT, not a raw 500', async () => {
    const caller = (await authCaller(customer)) as {
      bookings: { create: (i: unknown) => Promise<{ id: number }> };
      disputes: { create: (i: unknown) => Promise<{ id: number }> };
    };
    const start = safeFutureDate(1);
    const slot = await prisma.availabilitySlot.create({
      data: {
        technicianId: technicianRecordId,
        startAt: start,
        endAt: new Date(start.getTime() + 3600000),
        isBooked: false,
      },
    });
    const booking = await caller.bookings.create({
      serviceId,
      technicianId: technicianUserId,
      addressId,
      slotId: slot.id,
      startAt: start.toISOString(),
      endAt: new Date(start.getTime() + 3600000).toISOString(),
      idempotencyKey: newIdemKey(),
    });
    createdBookingIds.push(booking.id);

    const input = { bookingId: booking.id, reason: 'service', description: 'race test' };
    const first = await caller.disputes.create(input);
    createdDisputeIds.push(first.id);

    await expect(caller.disputes.create(input)).rejects.toMatchObject({ code: 'CONFLICT' });
  });

  it('flashDeals: a duplicate claim rolls the counter back exactly once', async () => {
    const deal = await prisma.flashDeal.create({
      data: {
        titleAr: 'flow-deal',
        serviceId,
        dealPrice: 50,
        originalPrice: 100,
        discountPercent: 50,
        discountValue: 50,
        maxRedemptions: 5,
        currentRedemptions: 0,
        startsAt: new Date(Date.now() - 3600000),
        endsAt: new Date(Date.now() + 3600000),
        isActive: true,
      },
    });
    createdDealIds.push(deal.id);

    const caller = (await authCaller(customer)) as {
      flashDeals: { claim: (i: unknown) => Promise<unknown> };
    };
    await caller.flashDeals.claim({ dealId: deal.id });
    await expect(caller.flashDeals.claim({ dealId: deal.id })).rejects.toMatchObject({
      code: 'CONFLICT',
    });

    const after = await prisma.flashDeal.findUniqueOrThrow({ where: { id: deal.id } });
    expect(after.currentRedemptions).toBe(1); // not 0, not 2
  });

  it('capture: concurrent captures credit cashback exactly once', async () => {
    const caller = (await authCaller(customer)) as {
      bookings: { create: (i: unknown) => Promise<{ id: number }> };
      payments: { authorize: (i: unknown) => Promise<unknown> };
    };
    const techCaller = (await authCaller(technician)) as {
      bookings: { transition: (i: unknown) => Promise<unknown> };
      payments: { capture: (i: unknown) => Promise<unknown> };
    };
    const start = safeFutureDate(1);
    const slot = await prisma.availabilitySlot.create({
      data: {
        technicianId: technicianRecordId,
        startAt: start,
        endAt: new Date(start.getTime() + 3600000),
        isBooked: false,
      },
    });
    const booking = await caller.bookings.create({
      serviceId,
      technicianId: technicianUserId,
      addressId,
      slotId: slot.id,
      startAt: start.toISOString(),
      endAt: new Date(start.getTime() + 3600000).toISOString(),
      idempotencyKey: newIdemKey(),
    });
    createdBookingIds.push(booking.id);
    await techCaller.bookings.transition({ id: booking.id, action: 'accept' });
    await caller.payments.authorize({ bookingId: booking.id, idempotencyKey: crypto.randomUUID() });
    const payment = await prisma.payment.findUniqueOrThrow({ where: { bookingId: booking.id } });
    createdPaymentIds.push(payment.id);

    const wallet = await prisma.wallet.findUniqueOrThrow({ where: { userId: customer.id } });
    const before = Number(wallet.bonusBalance);

    const results = await Promise.allSettled([
      techCaller.payments.capture({ bookingId: booking.id, idempotencyKey: crypto.randomUUID() }),
      techCaller.payments.capture({ bookingId: booking.id, idempotencyKey: crypto.randomUUID() }),
    ]);
    // Exactly one capture wins (the second is refused — the payment is
    // already CAPTURED); the cashback must move exactly once either way.
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter((r) => r.status === 'rejected')).toHaveLength(1);

    const cashbackTxns = await prisma.walletTransaction.findMany({
      where: { referenceId: `capture_${booking.id}`, source: 'CASHBACK' },
    });
    expect(cashbackTxns).toHaveLength(1);
    const after = await prisma.wallet.findUniqueOrThrow({ where: { id: wallet.id } });
    expect(Number(after.bonusBalance)).toBe(before + Number(cashbackTxns[0]!.amount));
  });

  it('subscriptions.purchase: a concurrent second purchase cannot drive the balance negative', async () => {
    const plan = await prisma.aiSubscriptionPlan.findFirst({ where: { isActive: true } });
    if (!plan) throw new Error('No active AI plan in seed');
    const price = plan.priceMonthly.toNumber();

    const wallet = await prisma.wallet.findUniqueOrThrow({ where: { userId: customer.id } });
    // Set the balance to exactly one plan price so only one purchase can win.
    await prisma.wallet.update({ where: { id: wallet.id }, data: { balance: price } });

    const existing = await prisma.customerAiSubscription.findUnique({
      where: { userId: customer.id },
    });
    if (existing) {
      await prisma.customerAiSubscription.delete({ where: { id: existing.id } });
    }

    const caller = (await authCaller(customer)) as {
      subscriptions: { purchase: (i: unknown) => Promise<unknown> };
    };
    const results = await Promise.allSettled([
      caller.subscriptions.purchase({ planId: plan.id, autoRenew: false }),
      caller.subscriptions.purchase({ planId: plan.id, autoRenew: false }),
    ]);

    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter((r) => r.status === 'rejected')).toHaveLength(1);

    const after = await prisma.wallet.findUniqueOrThrow({ where: { id: wallet.id } });
    expect(Number(after.balance)).toBe(0); // never negative

    const subs = await prisma.customerAiSubscription.findUnique({ where: { userId: customer.id } });
    expect(subs).not.toBeNull();
  });
});
