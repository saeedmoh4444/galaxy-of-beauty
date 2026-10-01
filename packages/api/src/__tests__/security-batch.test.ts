/**
 * Security-batch regression tests (2026-09-30 audit, API items 5-14).
 * Pins: authenticated+atomic flash-deal claims, honest BNPL, SMS fail-closed,
 * payouts staying in PROCESSING, booking idempotency ownership, gift-card
 * code shape, and the platform fee written on booking create.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';
import { prisma } from '@galaxy/db';
import type { JwtPayload } from '../lib/jwt';
import { buildUser, buildBooking } from './factories';
import { sendSms } from '../lib/sms';

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
let otherCustomerId: number;
let adminCaller: any;
const cleanupUserIds: number[] = [];

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

  const other = await prisma.user.create({ data: buildUser() });
  otherCustomerId = other.id;
  cleanupUserIds.push(other.id);
}, 15000);

afterAll(async () => {
  try {
    await prisma.user.deleteMany({ where: { id: { in: cleanupUserIds } } });
  } catch {
    // best effort
  }
});

describe('flashDeals.claim — authenticated, atomic, deduplicated', () => {
  it('rejects anonymous claims', async () => {
    const anon = await anonCaller();
    await expect(anon.flashDeals.claim({ dealId: 1 })).rejects.toThrow();
  });

  it('allows one claim per user and rejects the second', async () => {
    const deal = await prisma.flashDeal.create({
      data: {
        serviceId: (await prisma.service.findFirst())!.id,
        discountPercent: 40,
        originalPrice: 100,
        dealPrice: 60,
        discountValue: 40,
        maxRedemptions: 10,
        currentRedemptions: 0,
        startsAt: new Date(Date.now() - 86_400_000),
        endsAt: new Date(Date.now() + 86_400_000),
        isActive: true,
      },
    });

    try {
      const first = await customerCaller.flashDeals.claim({ dealId: deal.id });
      expect(first.dealPrice).toBe(60);
      await expect(customerCaller.flashDeals.claim({ dealId: deal.id })).rejects.toThrow();

      const after = await prisma.flashDeal.findUniqueOrThrow({ where: { id: deal.id } });
      // One redemption only — the duplicate claim rolled its increment back.
      expect(after.currentRedemptions).toBe(1);
    } finally {
      await prisma.flashDealClaim.deleteMany({ where: { dealId: deal.id } });
      await prisma.flashDeal.deleteMany({ where: { id: deal.id } });
    }
  });
});

describe('bnpl — no fabricated approval', () => {
  it('reports the provider as not configured', async () => {
    const eligibility = await customerCaller.bnpl.eligibility();
    expect(eligibility.eligible).toBe(false);
  });

  it('creates plans as PENDING_PROVIDER with approved:false', async () => {
    const result = await customerCaller.bnpl.createPlan({
      amount: 400,
      provider: 'tabby',
      installments: 4,
    });
    expect(result.approved).toBe(false);
    expect(result.status).toBe('PENDING_PROVIDER');

    try {
      const plan = await prisma.bnplPlan.findUniqueOrThrow({ where: { id: result.planId } });
      expect(plan.status).toBe('PENDING_PROVIDER');
    } finally {
      await prisma.bnplPlan.deleteMany({ where: { id: result.planId } });
    }
  });
});

describe('sms — fail closed when unconfigured', () => {
  it('returns false instead of claiming success', async () => {
    const originalSid = process.env['TWILIO_ACCOUNT_SID'];
    delete process.env['TWILIO_ACCOUNT_SID'];
    const sent = await sendSms('+966500000000', 'secret code 123456');
    if (originalSid) process.env['TWILIO_ACCOUNT_SID'] = originalSid;
    expect(sent).toBe(false);
  });
});

describe('payouts.process — never fabricates a transfer', () => {
  it('leaves the payout in PROCESSING', async () => {
    const tech = await prisma.technician.findFirst();
    const payout = await prisma.payout.create({
      data: {
        technicianId: tech!.userId,
        amount: 50,
        status: 'PENDING',
        periodStart: new Date(Date.now() - 7 * 86_400_000),
        periodEnd: new Date(),
      },
    });

    try {
      const result = await adminCaller.payouts.process({ payoutId: payout.id });
      expect(result.status).toBe('PROCESSING');
      expect(result.reference).toBeFalsy();
    } finally {
      await prisma.payout.deleteMany({ where: { id: payout.id } });
    }
  });
});

describe('bookings.create — idempotency ownership', () => {
  it('does not leak a foreign booking when the key collides', async () => {
    const service = await prisma.service.findFirst();
    const tech = await prisma.technician.findFirst();
    const techUserId = tech!.userId;
    const address = await prisma.address.findFirst({ where: { userId: customerId } });
    const key = `sb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const created = await customerCaller.bookings.create({
      serviceId: service!.id,
      technicianId: techUserId,
      addressId: address?.id ?? 1,
      startAt: new Date(Date.now() + 7 * 86_400_000).toISOString(),
      endAt: new Date(Date.now() + 7 * 86_400_000 + 3_600_000).toISOString(),
      idempotencyKey: key,
    });

    try {
      const otherCaller = await authCaller({
        id: otherCustomerId,
        role: 'CUSTOMER',
        email: 'other@x.test',
      });
      await expect(
        otherCaller.bookings.create({
          serviceId: service!.id,
          technicianId: techUserId,
          addressId: address?.id ?? 1,
          startAt: new Date(Date.now() + 7 * 86_400_000).toISOString(),
          endAt: new Date(Date.now() + 7 * 86_400_000 + 3_600_000).toISOString(),
          idempotencyKey: key,
        }),
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    } finally {
      await prisma.booking.deleteMany({ where: { id: created.id } });
    }
  });

  it('writes the platform fee instead of zero', async () => {
    const service = await prisma.service.findFirst();
    const tech = await prisma.technician.findFirst();
    const techUserId = tech!.userId;
    const address = await prisma.address.findFirst({ where: { userId: customerId } });
    const created = await customerCaller.bookings.create({
      serviceId: service!.id,
      technicianId: techUserId,
      addressId: address?.id ?? 1,
      startAt: new Date(Date.now() + 8 * 86_400_000).toISOString(),
      endAt: new Date(Date.now() + 8 * 86_400_000 + 3_600_000).toISOString(),
      idempotencyKey: `sb_fee_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    });

    try {
      const row = await prisma.booking.findUniqueOrThrow({ where: { id: created.id } });
      expect(Number(row.platformFee)).toBeGreaterThan(0);
    } finally {
      await prisma.booking.deleteMany({ where: { id: created.id } });
    }
  });
});

describe('giftCards — code shape', () => {
  it('generates GIFT-XXXX-XXXX codes', async () => {
    const result = await customerCaller.giftCards.purchase({
      amount: 100,
      recipientName: 'Test',
      message: '',
    });
    expect(result.code ?? result.giftCard?.code).toMatch(/^GIFT-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  });
});
