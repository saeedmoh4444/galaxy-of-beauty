/**
 * promo router tests — live router over the seeded DB.
 * Coverage for B.2 (promo chain on booking): validate → create booking →
 * redeemOnBooking, plus the hardening of redeemOnBooking (expiry, maxUses,
 * minOrder, duplicate redemption).
 * (Coverage ratchet target: src/routers/promo.ts)
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser, buildBooking } from './factories';

let admin: JwtPayload;
let customer: JwtPayload;
let otherCustomer: JwtPayload;

const createdUserIds: number[] = [];
const createdTechIds: number[] = [];
const createdPromoIds: number[] = [];
const createdBookingIds: number[] = [];
let techUserId: number;
let serviceId: number;
let categoryId: number;
let addressId: number;

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

async function makePromoCode(overrides: {
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  maxUses?: number;
  validUntil?: Date;
  isActive?: boolean;
}) {
  const promo = await prisma.promoCode.create({
    data: {
      code: overrides.code,
      discountType: overrides.discountType,
      discountValue: overrides.discountValue,
      minOrderAmount: overrides.minOrderAmount,
      maxDiscount: overrides.maxDiscount,
      maxUses: overrides.maxUses,
      validUntil: overrides.validUntil,
      isActive: overrides.isActive ?? true,
      createdBy: admin.id,
    },
  });
  createdPromoIds.push(promo.id);
  return promo;
}

async function makeBooking(userId: number) {
  const booking = await prisma.booking.create({
    data: {
      ...buildBooking({
        customerId: userId,
        // bookings.technicianId references User.id, not Technician.id.
        technicianId: techUserId,
        serviceId,
        status: 'COMPLETED',
        totalAmount: 200,
        startAt: new Date(Date.now() + 3 * 86_400_000),
        endAt: new Date(Date.now() + 3 * 86_400_000 + 3_600_000),
      }),
      addressId,
    },
  });
  createdBookingIds.push(booking.id);
  return booking;
}

describe('promo router (B.2 booking chain)', () => {
  beforeAll(async () => {
    const adminUser = await prisma.user.findFirstOrThrow({ where: { role: 'ADMIN' } });
    admin = { id: adminUser.id, role: 'ADMIN', email: adminUser.email };

    const u1 = await prisma.user.create({ data: buildUser() });
    customer = { id: u1.id, role: 'CUSTOMER', email: u1.email };
    const u2 = await prisma.user.create({ data: buildUser() });
    otherCustomer = { id: u2.id, role: 'CUSTOMER', email: u2.email };
    const techUser = await prisma.user.create({ data: buildUser({ role: 'TECHNICIAN' }) });
    createdUserIds.push(u1.id, u2.id, techUser.id);

    const tech = await prisma.technician.create({
      data: { userId: techUser.id, city: 'الرياض' },
    });
    createdTechIds.push(tech.id);
    techUserId = techUser.id;

    const cat = await prisma.category.create({
      data: {
        nameJson: { ar: 'تصنيف البرومو', en: 'Promo Category' },
        slug: `promo-test-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
        iconUrl: '',
      },
    });
    categoryId = cat.id;
    const svc = await prisma.service.create({
      data: {
        categoryId: cat.id,
        titleJson: { ar: 'خدمة البرومو', en: 'Promo Service' },
        descriptionJson: { ar: 'وصف', en: 'Description' },
        basePrice: 200,
        durationMin: 60,
        isActive: true,
      },
    });
    serviceId = svc.id;

    const addr = await prisma.address.create({
      data: {
        userId: u1.id,
        label: 'المنزل',
        city: 'الرياض',
        area: 'النخيل',
        street: 'طريق الملك',
      },
    });
    addressId = addr.id;
  }, 20000);

  afterAll(async () => {
    try {
      await prisma.promoUsage.deleteMany({ where: { promoCodeId: { in: createdPromoIds } } });
    } catch {}
    try {
      await prisma.promoCode.deleteMany({ where: { id: { in: createdPromoIds } } });
    } catch {}
    try {
      await prisma.booking.deleteMany({ where: { id: { in: createdBookingIds } } });
    } catch {}
    try {
      await prisma.service.deleteMany({ where: { id: serviceId } });
    } catch {}
    try {
      await prisma.address.deleteMany({ where: { id: addressId } });
    } catch {}
    try {
      await prisma.category.deleteMany({ where: { id: categoryId } });
    } catch {}
    try {
      await prisma.technician.deleteMany({ where: { id: { in: createdTechIds } } });
    } catch {}
    try {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    } catch {}
  });

  describe('validate', () => {
    it('computes percent discount with maxDiscount cap', async () => {
      await makePromoCode({
        code: 'PROMO-PCT-CAP',
        discountType: 'percent',
        discountValue: 50,
        maxDiscount: 30,
      });
      const anon = await caller(null);
      const res = await anon.promo.validate({ code: 'promo-pct-cap', orderAmount: 200 });
      expect(res.valid).toBe(true);
      expect(res.discountAmount).toBe(30); // capped at 30, not 100
      expect(res.finalAmount).toBe(170);
    });

    it('computes fixed discount', async () => {
      await makePromoCode({ code: 'PROMO-FIXED', discountType: 'fixed', discountValue: 25 });
      const anon = await caller(null);
      const res = await anon.promo.validate({ code: 'PROMO-FIXED', orderAmount: 200 });
      expect(res.discountAmount).toBe(25);
      expect(res.finalAmount).toBe(175);
    });

    it('rejects invalid, min-order, expired, and exhausted codes', async () => {
      const anon = await caller(null);
      await expect(anon.promo.validate({ code: 'NOPE-NOPE', orderAmount: 200 })).rejects.toThrow(
        /Invalid or expired/,
      );

      await makePromoCode({
        code: 'PROMO-MIN',
        discountType: 'fixed',
        discountValue: 10,
        minOrderAmount: 500,
      });
      await expect(anon.promo.validate({ code: 'PROMO-MIN', orderAmount: 200 })).rejects.toThrow(
        /Minimum order amount/,
      );

      await makePromoCode({
        code: 'PROMO-EXPIRED',
        discountType: 'fixed',
        discountValue: 10,
        validUntil: new Date(Date.now() - 86_400_000),
      });
      await expect(
        anon.promo.validate({ code: 'PROMO-EXPIRED', orderAmount: 200 }),
      ).rejects.toThrow(/expired/);

      const exhausted = await makePromoCode({
        code: 'PROMO-EXHAUSTED',
        discountType: 'fixed',
        discountValue: 10,
        maxUses: 1,
      });
      await prisma.promoCode.update({
        where: { id: exhausted.id },
        data: { currentUses: 1 },
      });
      await expect(
        anon.promo.validate({ code: 'PROMO-EXHAUSTED', orderAmount: 200 }),
      ).rejects.toThrow(/usage limit/);
    });
  });

  describe('redeemOnBooking', () => {
    it('decrements the booking total, records usage, and increments uses', async () => {
      await makePromoCode({ code: 'PROMO-REDEEM', discountType: 'percent', discountValue: 20 });
      const booking = await makeBooking(customer.id);
      const c = await caller(customer);

      const res = await c.promo.redeemOnBooking({ code: 'promo-redeem', bookingId: booking.id });
      expect(res.success).toBe(true);
      expect(res.discount).toBe(40);
      expect(res.newTotal).toBe(160);

      const stored = await prisma.booking.findUniqueOrThrow({ where: { id: booking.id } });
      expect(Number(stored.totalAmount)).toBe(160);

      const usage = await prisma.promoUsage.findFirst({
        where: { bookingId: booking.id, userId: customer.id },
      });
      expect(usage).not.toBeNull();
      expect(Number(usage!.discountAmount)).toBe(40);

      const promo = await prisma.promoCode.findUniqueOrThrow({
        where: { code: 'PROMO-REDEEM' },
      });
      expect(promo.currentUses).toBe(1);
    });

    it('rejects redemption by a different customer', async () => {
      await makePromoCode({ code: 'PROMO-OWNER', discountType: 'fixed', discountValue: 10 });
      const booking = await makeBooking(customer.id);
      const other = await caller(otherCustomer);

      await expect(
        other.promo.redeemOnBooking({ code: 'PROMO-OWNER', bookingId: booking.id }),
      ).rejects.toThrow(/NOT_FOUND|not found/i);
    });

    it('enforces expiry, usage limit, and min order on redemption', async () => {
      const c = await caller(customer);

      await makePromoCode({
        code: 'PROMO-REDEEM-EXPIRED',
        discountType: 'fixed',
        discountValue: 10,
        validUntil: new Date(Date.now() - 86_400_000),
      });
      const b1 = await makeBooking(customer.id);
      await expect(
        c.promo.redeemOnBooking({ code: 'PROMO-REDEEM-EXPIRED', bookingId: b1.id }),
      ).rejects.toThrow(/expired/);

      const exhausted = await makePromoCode({
        code: 'PROMO-REDEEM-USED',
        discountType: 'fixed',
        discountValue: 10,
        maxUses: 1,
      });
      await prisma.promoCode.update({
        where: { id: exhausted.id },
        data: { currentUses: 1 },
      });
      const b2 = await makeBooking(customer.id);
      await expect(
        c.promo.redeemOnBooking({ code: 'PROMO-REDEEM-USED', bookingId: b2.id }),
      ).rejects.toThrow(/usage limit/);

      await makePromoCode({
        code: 'PROMO-REDEEM-MIN',
        discountType: 'fixed',
        discountValue: 10,
        minOrderAmount: 500,
      });
      const b3 = await makeBooking(customer.id);
      await expect(
        c.promo.redeemOnBooking({ code: 'PROMO-REDEEM-MIN', bookingId: b3.id }),
      ).rejects.toThrow(/Minimum order amount/);
    });

    it('rejects double redemption of the same code on the same booking', async () => {
      await makePromoCode({ code: 'PROMO-ONCE', discountType: 'fixed', discountValue: 10 });
      const booking = await makeBooking(customer.id);
      const c = await caller(customer);

      const first = await c.promo.redeemOnBooking({ code: 'PROMO-ONCE', bookingId: booking.id });
      expect(first.success).toBe(true);

      await expect(
        c.promo.redeemOnBooking({ code: 'PROMO-ONCE', bookingId: booking.id }),
      ).rejects.toThrow(/already applied/);
    });
  });
});
