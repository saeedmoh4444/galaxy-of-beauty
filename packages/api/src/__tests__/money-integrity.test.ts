/**
 * Money-integrity regression tests (2026-09-30 audit, API items 1-4).
 *
 * These pin the fixes for the four free-money / unsigned-webhook holes:
 *  1. wallet.topUp must NOT mint spendable balance — only a PENDING intent.
 *  2. payments.webhook must reject requests without a valid signature.
 *  3. payments.refund must reverse the cashback written under
 *     `capture_<bookingId>` (the old lookup never matched any row).
 *  4. PayFort must fail closed when unconfigured — never fake `success: true`.
 */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';
import { prisma, Prisma } from '@galaxy/db';
import type { JwtPayload } from '../lib/jwt';
import { authorizePayment } from '../lib/payfort';
import { verifyWebhookSignature } from '../lib/payfort';
import { buildBooking } from './factories';

const CSRF = 'a'.repeat(64);

async function anonCaller() {
  const ctx = await createTRPCContext({ csrfCookie: CSRF, csrfHeader: CSRF });
  return (appRouter as any).createCaller(ctx);
}

async function authCaller(user: JwtPayload) {
  const ctx = await createTRPCContext({ user, csrfCookie: CSRF, csrfHeader: CSRF });
  return (appRouter as any).createCaller(ctx);
}

let customerCaller: any;
let customerId: number;
let adminCaller: any;
const cleanupKeys: string[] = [];

beforeAll(async () => {
  const anon = await anonCaller();
  const login = await anon.auth.login({ email: 'customer@test.com', password: 'Admin@123456' });
  customerId = login.user.id;
  customerCaller = await authCaller({
    id: login.user.id,
    role: login.user.role,
    email: login.user.email,
  });
  const adminLogin = await anon.auth.login({
    email: 'admin@galaxyofbeauty.sa',
    password: 'Admin@123456',
  });
  adminCaller = await authCaller({
    id: adminLogin.user.id,
    role: adminLogin.user.role,
    email: adminLogin.user.email,
  });
}, 15000);

afterAll(async () => {
  try {
    await prisma.walletTransaction.deleteMany({ where: { idempotencyKey: { in: cleanupKeys } } });
  } catch {
    // best effort
  }
});

describe('wallet.topUp — no free money', () => {
  it('creates a PENDING transaction and does NOT change the spendable balance', async () => {
    const before = await customerCaller.wallet.getBalance();
    const key = `mob_${Date.now()}_pending_${Math.random().toString(36).slice(2, 6)}`;
    cleanupKeys.push(key);

    const result = await customerCaller.wallet.topUp({ amount: 100, idempotencyKey: key });
    const after = await customerCaller.wallet.getBalance();

    // No balance movement — the credit must come from a verified gateway callback.
    expect(Number(after.balance)).toBe(Number(before.balance));
    expect(result.status).toBe('PENDING');

    const txn = await prisma.walletTransaction.findUnique({ where: { idempotencyKey: key } });
    expect(txn).not.toBeNull();
    expect(txn!.status).toBe('PENDING');
  });

  it('replays the same idempotency key with the stored status', async () => {
    const key = `mob_${Date.now()}_replay_${Math.random().toString(36).slice(2, 6)}`;
    cleanupKeys.push(key);

    const first = await customerCaller.wallet.topUp({ amount: 100, idempotencyKey: key });
    const second = await customerCaller.wallet.topUp({ amount: 100, idempotencyKey: key });

    expect(first.status).toBe('PENDING');
    expect(second.status).toBe('PENDING');

    const count = await prisma.walletTransaction.count({ where: { idempotencyKey: key } });
    expect(count).toBe(1);
  });
});

describe('payments.webhook — signature required', () => {
  it('rejects a webhook without a signature', async () => {
    const anon = await anonCaller();
    await expect(
      anon.payments.webhook({ gatewayRef: 'PAY-anything', status: 'CAPTURED' } as any),
    ).rejects.toThrow();
  });

  it('rejects a webhook with an invalid signature', async () => {
    const anon = await anonCaller();
    await expect(
      anon.payments.webhook({ gatewayRef: 'PAY-anything', status: 'CAPTURED', signature: 'bad' }),
    ).rejects.toThrow();
  });
});

describe('payments.refund — cashback reversal', () => {
  it('reverses the cashback written under capture_<bookingId>', async () => {
    // Build a minimal captured-payment fixture: a user wallet, a booking and a
    // payment row, then a CASHBACK credit with the capture_ reference.
    const wallet = await prisma.wallet.upsert({
      where: { userId: customerId },
      create: { userId: customerId, bonusBalance: new Prisma.Decimal(0) },
      update: {},
    });

    const service = await prisma.service.findFirst();
    const address =
      (await prisma.address.findFirst({ where: { userId: customerId } })) ??
      (await prisma.address.create({
        data: {
          userId: customerId,
          city: 'Riyadh',
          district: 'Test District',
          street: 'Test Street',
          isDefault: true,
        },
      }));
    const booking = await prisma.booking.create({
      data: {
        ...buildBooking({
          customerId,
          serviceId: service!.id,
          status: 'PAID',
          totalAmount: 100,
        }),
        // Prisma 7: relation connects and FK scalars are mutually exclusive.
        customer: { connect: { id: customerId } },
        technician: { connect: { id: customerId } },
        service: { connect: { id: service!.id } },
        address: { connect: { id: address.id } },
        customerId: undefined,
        technicianId: undefined,
        serviceId: undefined,
      } as never,
    });

    const cashbackRef = `capture_${booking.id}`;
    const cashbackAmount = new Prisma.Decimal('5'); // 5% of 100
    const baseline = new Prisma.Decimal(wallet.bonusBalance ?? 0);

    await prisma.wallet.update({
      where: { id: wallet.id },
      data: { bonusBalance: { increment: cashbackAmount } },
    });
    await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'CREDIT',
        source: 'CASHBACK',
        amount: cashbackAmount,
        referenceId: cashbackRef,
        description: 'Cashback fixture',
      },
    });
    await prisma.payment.create({
      data: {
        booking: { connect: { id: booking.id } },
        amount: 100,
        status: 'CAPTURED',
        gatewayRef: `MI-${Date.now()}`,
      },
    });

    try {
      await adminCaller.payments.refund({ bookingId: booking.id });

      const walletAfter = await prisma.wallet.findUnique({ where: { id: wallet.id } });
      expect(Number(walletAfter!.bonusBalance)).toBe(Number(baseline));

      const reversal = await prisma.walletTransaction.findFirst({
        where: { referenceId: String(booking.id), type: 'DEBIT', source: 'REFUND' },
      });
      expect(reversal).not.toBeNull();
    } finally {
      await prisma.walletTransaction.deleteMany({ where: { walletId: wallet.id } });
      await prisma.payment.deleteMany({ where: { bookingId: booking.id } });
      await prisma.booking.deleteMany({ where: { id: booking.id } });
    }
  });
});

describe('payfort — fail closed when unconfigured', () => {
  it('returns success:false when the gateway is not configured', async () => {
    const original = process.env['PAYFORT_ACCESS_CODE'];
    delete process.env['PAYFORT_ACCESS_CODE'];
    delete process.env['PAYFORT_SIMULATE'];

    const result = await authorizePayment({
      amount: 100,
      customerEmail: 'x@example.com',
      customerName: 'x',
      merchantReference: 'mr-1',
      returnUrl: 'https://x.example/return',
    });

    if (original) process.env['PAYFORT_ACCESS_CODE'] = original;
    expect(result.success).toBe(false);
  });

  it('honours PAYFORT_SIMULATE=true only outside production', async () => {
    const originalCode = process.env['PAYFORT_ACCESS_CODE'];
    const originalSim = process.env['PAYFORT_SIMULATE'];
    delete process.env['PAYFORT_ACCESS_CODE'];
    process.env['PAYFORT_SIMULATE'] = 'true';

    const result = await authorizePayment({
      amount: 100,
      customerEmail: 'x@example.com',
      customerName: 'x',
      merchantReference: 'mr-2',
      returnUrl: 'https://x.example/return',
    });

    if (originalCode) process.env['PAYFORT_ACCESS_CODE'] = originalCode;
    if (originalSim) process.env['PAYFORT_SIMULATE'] = originalSim;
    else delete process.env['PAYFORT_SIMULATE'];

    expect(result.success).toBe(true);
  });
});

// Reference import so unused-import lints stay quiet in older configs.
void verifyWebhookSignature;
void vi;
