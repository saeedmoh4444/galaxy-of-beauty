/**
 * Money-path race guards (audit 2026-11-11, W1):
 *  1. bookings.transition `complete` — concurrent/duplicate completes must
 *     credit technician stats, referral rewards and influencer commissions
 *     exactly once (conditional status-guarded update + rollback).
 *  2. payments.refund — double refund must be impossible; cashback is
 *     reversed once and the customer's wallet is credited once.
 *  3. payouts.approveRequest — an approval that cannot fully cover its
 *     amount (or races another approval for the same rows) must fail
 *     inside the transaction; no APPROVED request may leave rows
 *     uncovered.
 *  4. handleWalletJob — idempotency-key replay must be a no-op.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';
import type { JwtPayload } from '../lib/jwt';
import { handleWalletJob } from '../workers/handlers';
import { safeFutureDate } from './factories';

const CSRF = 'a'.repeat(64);

async function authCaller(user: JwtPayload) {
  const ctx = await createTRPCContext({ user, csrfCookie: CSRF, csrfHeader: CSRF });
  return (
    appRouter as never as { createCaller: (c: unknown) => Record<string, unknown> }
  ).createCaller(ctx) as Record<string, unknown>;
}

let customer: JwtPayload;
let technician: JwtPayload;
let referrer: JwtPayload;
let serviceId: number;
let addressId: number;
let technicianUserId: number;
let technicianRecordId: number;

const createdBookingIds: number[] = [];
const createdPaymentIds: number[] = [];
const createdReferralIds: number[] = [];
const createdInfluencerIds: number[] = [];
const createdPayoutIds: number[] = [];
const createdRequestIds: number[] = [];
const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];
const createdWalletIds: number[] = [];

let uid = 0;
const newIdemKey = () => `money_race_${Date.now()}_${uid++}`;

async function createBooking(opts?: { slotId?: number }) {
  const caller = (await authCaller(customer)) as {
    bookings: { create: (i: unknown) => Promise<{ id: number }> };
  };
  const start = safeFutureDate(1);
  const slotId =
    opts?.slotId ??
    (
      await prisma.availabilitySlot.create({
        data: {
          technicianId: technicianRecordId,
          startAt: start,
          endAt: new Date(start.getTime() + 3600000),
          isBooked: false,
        },
      })
    ).id;
  const booking = await caller.bookings.create({
    serviceId,
    technicianId: technicianUserId,
    addressId,
    slotId,
    startAt: start.toISOString(),
    endAt: new Date(start.getTime() + 3600000).toISOString(),
    idempotencyKey: newIdemKey(),
  });
  createdBookingIds.push(booking.id);
  return booking.id;
}

async function capturePaymentFor(bookingId: number): Promise<number> {
  const payment = await prisma.payment.create({
    data: {
      bookingId,
      amount: 300,
      currency: 'SAR',
      intent: 'CAPTURE',
      status: 'CAPTURED',
      commission: 0,
      idempotencyKey: newIdemKey(),
    },
  });
  createdPaymentIds.push(payment.id);
  return payment.id;
}

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

  const other = await prisma.user.findFirst({
    where: { role: 'CUSTOMER', id: { not: customer.id } },
  });
  if (!other) throw new Error('No second customer in seed data');
  referrer = { id: other.id, role: 'CUSTOMER', email: other.email };

  const service = await prisma.service.findFirst({ orderBy: { id: 'asc' } });
  if (!service) throw new Error('No service in seed data');
  serviceId = service.id;

  const address = await prisma.address.create({
    data: {
      userId: customer.id,
      label: 'race-test',
      city: 'الرياض',
      area: 'تجريبي',
      street: 'شارع الاختبار',
    },
  });
  addressId = address.id;
}, 60000);

afterAll(async () => {
  await prisma.payment.deleteMany({ where: { id: { in: createdPaymentIds } } });
  await prisma.booking.deleteMany({ where: { id: { in: createdBookingIds } } });
  await prisma.walletTransaction.deleteMany({ where: { walletId: { in: createdWalletIds } } });
  await prisma.referral.deleteMany({ where: { id: { in: createdReferralIds } } });
  await prisma.influencer.deleteMany({ where: { id: { in: createdInfluencerIds } } });
  await prisma.payoutRequest.deleteMany({ where: { id: { in: createdRequestIds } } });
  await prisma.payout.deleteMany({ where: { id: { in: createdPayoutIds } } });
  await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
  await prisma.address.deleteMany({ where: { id: addressId } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

describe('W1 money races', () => {
  it('complete: duplicate transitions credit side effects exactly once', async () => {
    const bookingId = await createBooking();
    const techCaller = (await authCaller(technician)) as {
      bookings: { transition: (i: unknown) => Promise<{ status: string }> };
    };
    await techCaller.bookings.transition({ id: bookingId, action: 'accept' });
    await techCaller.bookings.transition({ id: bookingId, action: 'start' });
    await capturePaymentFor(bookingId);

    const influencer = await prisma.influencer.create({
      data: { code: `RACE-${uid++}`, name: 'race-influencer', commissionRate: 10, isActive: true },
    });
    createdInfluencerIds.push(influencer.id);
    await prisma.booking.update({
      where: { id: bookingId },
      data: { influencerCode: influencer.code },
    });

    // The credit loop skips wallets that don't exist ("wallets are created
    // at registration") — make sure the referrer has one so both sides of
    // the referral credit are exercised exactly once.
    let referrerWallet = await prisma.wallet.findUnique({ where: { userId: referrer.id } });
    if (!referrerWallet) {
      referrerWallet = await prisma.wallet.create({
        data: { userId: referrer.id, balance: 0, bonusBalance: 0 },
      });
      createdWalletIds.push(referrerWallet.id);
    }

    const referral = await prisma.referral.create({
      data: {
        referralCode: `RACE-${uid++}`,
        referrerId: referrer.id,
        referredId: customer.id,
        status: 'PENDING',
        rewardCredited: false,
        referredReward: 50,
      },
    });
    createdReferralIds.push(referral.id);

    const techBefore = await prisma.technician.findUniqueOrThrow({
      where: { id: technicianRecordId },
    });

    const results = await Promise.allSettled([
      techCaller.bookings.transition({ id: bookingId, action: 'complete' }),
      techCaller.bookings.transition({ id: bookingId, action: 'complete' }),
    ]);

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');
    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);

    const techAfter = await prisma.technician.findUniqueOrThrow({
      where: { id: technicianRecordId },
    });
    expect(techAfter.completedBookings).toBe(techBefore.completedBookings + 1);

    const refAfter = await prisma.referral.findUniqueOrThrow({ where: { id: referral.id } });
    expect(refAfter.status).toBe('COMPLETED');
    expect(refAfter.rewardCredited).toBe(true);

    // Referral wallet credits exactly once per party.
    const refTxns = await prisma.walletTransaction.findMany({
      where: { referenceId: `referral_${referral.id}` },
    });
    expect(refTxns).toHaveLength(2); // referrer + referred

    const infAfter = await prisma.influencer.findUniqueOrThrow({ where: { id: influencer.id } });
    expect(infAfter.totalBookings).toBe(1);
  });

  it('refund: double refund is impossible and the wallet credit happens once', async () => {
    const bookingId = await createBooking();
    await capturePaymentFor(bookingId);

    const customerWallet = await prisma.wallet.findUniqueOrThrow({
      where: { userId: customer.id },
    });
    createdWalletIds.push(customerWallet.id);

    // Fabricate the capture-time cashback credit the refund should reverse.
    await prisma.wallet.update({
      where: { id: customerWallet.id },
      data: { bonusBalance: { increment: 10 } },
    });
    await prisma.walletTransaction.create({
      data: {
        walletId: customerWallet.id,
        type: 'CREDIT',
        source: 'CASHBACK',
        amount: 10,
        description: 'cashback',
        referenceId: `capture_${bookingId}`,
        idempotencyKey: newIdemKey(),
      },
    });

    const adminUser = await prisma.user.findFirstOrThrow({ where: { role: 'ADMIN' } });
    const adminCaller = (await authCaller({
      id: adminUser.id,
      role: 'ADMIN',
      email: adminUser.email,
    })) as { payments: { refund: (i: unknown) => Promise<unknown> } };

    const balanceBefore = (
      await prisma.wallet.findUniqueOrThrow({ where: { id: customerWallet.id } })
    ).bonusBalance;

    const results = await Promise.allSettled([
      adminCaller.payments.refund({ bookingId }),
      adminCaller.payments.refund({ bookingId }),
    ]);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter((r) => r.status === 'rejected')).toHaveLength(1);

    const payment = await prisma.payment.findUniqueOrThrow({ where: { bookingId } });
    expect(payment.status).toBe('REFUNDED');

    // Cashback reversed (10 back out) + the refund itself credited once.
    const refundTxns = await prisma.walletTransaction.findMany({
      where: { referenceId: String(bookingId), source: 'REFUND' },
    });
    expect(refundTxns).toHaveLength(1);

    const balanceAfter = (
      await prisma.wallet.findUniqueOrThrow({ where: { id: customerWallet.id } })
    ).bonusBalance;
    // balanceBefore already included the fabricated +10 cashback; the net
    // after one refund = balanceBefore - 10 (cashback reversal) + 300 (refund credit).
    expect(Number(balanceAfter)).toBe(Number(balanceBefore) - 10 + 300);
  });

  it('approveRequest: concurrent approvals cannot under-cover, and each row is claimed once', async () => {
    const vendorUser = await prisma.user.create({
      data: {
        email: `race-vendor-${uid++}@example.com`,
        phone: `+96659${String(10000000 + (uid % 89999999))}`,
        passwordHash: 'x',
        role: 'CUSTOMER',
        name: 'race',
      },
    });
    createdUserIds.push(vendorUser.id);
    const vendor = await prisma.vendor.create({
      data: {
        userId: vendorUser.id,
        storeName: `race-store-${uid++}`,
        storeSlug: `race-store-${uid}`,
      },
    });
    createdVendorIds.push(vendor.id);

    // 200 SAR accrued across two PENDING rows; two requests of 150 each —
    // only one can be covered.
    const rowA = await prisma.payout.create({
      data: {
        vendorId: vendor.id,
        amount: 100,
        fee: 0,
        periodStart: new Date(Date.now() - 86400000),
        periodEnd: new Date(),
        status: 'PENDING',
      },
    });
    const rowB = await prisma.payout.create({
      data: {
        vendorId: vendor.id,
        amount: 100,
        fee: 0,
        periodStart: new Date(Date.now() - 86400000),
        periodEnd: new Date(),
        status: 'PENDING',
      },
    });
    createdPayoutIds.push(rowA.id, rowB.id);

    const req1 = await prisma.payoutRequest.create({
      data: { vendorId: vendor.id, amount: 150, idempotencyKey: newIdemKey(), status: 'PENDING' },
    });
    const req2 = await prisma.payoutRequest.create({
      data: { vendorId: vendor.id, amount: 150, idempotencyKey: newIdemKey(), status: 'PENDING' },
    });
    createdRequestIds.push(req1.id, req2.id);

    const adminUser = await prisma.user.findFirstOrThrow({ where: { role: 'ADMIN' } });
    const adminCaller = (await authCaller({
      id: adminUser.id,
      role: 'ADMIN',
      email: adminUser.email,
    })) as { payouts: { approveRequest: (i: unknown) => Promise<unknown> } };

    const results = await Promise.allSettled([
      adminCaller.payouts.approveRequest({ requestId: req1.id }),
      adminCaller.payouts.approveRequest({ requestId: req2.id }),
    ]);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter((r) => r.status === 'rejected')).toHaveLength(1);

    const req1After = await prisma.payoutRequest.findUniqueOrThrow({ where: { id: req1.id } });
    const req2After = await prisma.payoutRequest.findUniqueOrThrow({ where: { id: req2.id } });
    const approved = [req1After, req2After].filter((r) => r.status === 'APPROVED');
    expect(approved).toHaveLength(1);

    // The winner legitimately covers 150 with both 100-SAR rows; the loser
    // rolled everything back. Every claimed row must carry the winner's
    // MANUAL reference — none may belong to the rejected request.
    const claimed = await prisma.payout.findMany({
      where: { id: { in: [rowA.id, rowB.id] }, status: 'COMPLETED' },
    });
    expect(claimed).toHaveLength(2);
    const approvedReq = approved[0]!;
    for (const row of claimed) {
      expect(row.reference).toBe(`MANUAL-${approvedReq.id}`);
    }
  });

  it('handleWalletJob: idempotency-key replay is a no-op', async () => {
    const wallet = await prisma.wallet.findUniqueOrThrow({ where: { userId: customer.id } });
    createdWalletIds.push(wallet.id);
    const key = newIdemKey();
    const before = Number(wallet.bonusBalance);

    const job = {
      data: { userId: customer.id, bookingId: -1, amount: 25, idempotencyKey: key },
    } as never;
    await handleWalletJob(job);
    await handleWalletJob(job);

    const after = await prisma.wallet.findUniqueOrThrow({ where: { id: wallet.id } });
    expect(Number(after.bonusBalance)).toBe(before + 25);
    const txns = await prisma.walletTransaction.findMany({ where: { idempotencyKey: key } });
    expect(txns).toHaveLength(1);
  });
});
