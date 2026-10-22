/**
 * C4 — Store coupon codes: a vendor proposes a store-scoped promo code via
 * the provider-submission queue (kind 'store_coupon'), admin approval
 * materializes the PromoCode with vendorId, redemption is store-scoped
 * (cross-store rejection), and vendors deactivate their own codes.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

const createdUserIds: number[] = [];
const createdSubmissionIds: number[] = [];
let owner: JwtPayload;
let outsider: JwtPayload;
let admin: JwtPayload;
let ownerVendorId: number;
let outsiderVendorId: number;

function callerFor(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

beforeAll(async () => {
  const ownerU = await prisma.user.create({ data: buildUser() });
  const outsiderU = await prisma.user.create({ data: buildUser() });
  const adminU = await prisma.user.create({ data: buildUser({ role: 'ADMIN' }) });
  createdUserIds.push(ownerU.id, outsiderU.id, adminU.id);
  owner = { id: ownerU.id, role: 'CUSTOMER', email: ownerU.email };
  outsider = { id: outsiderU.id, role: 'CUSTOMER', email: outsiderU.email };
  admin = { id: adminU.id, role: 'ADMIN', email: adminU.email };

  const v1 = await prisma.vendor.create({
    data: { userId: ownerU.id, storeName: 'Coupon Store', storeSlug: `c4-${Date.now()}` },
  });
  ownerVendorId = v1.id;
  const v2 = await prisma.vendor.create({
    data: { userId: outsiderU.id, storeName: 'Other Store', storeSlug: `c4o-${Date.now()}` },
  });
  outsiderVendorId = v2.id;
}, 15000);

afterAll(async () => {
  await prisma.promoCode.deleteMany({
    where: { OR: [{ vendorId: { in: [ownerVendorId, outsiderVendorId] } }, { code: 'TAKEN10' }] },
  });
  await prisma.providerSubmission.deleteMany({ where: { id: { in: createdSubmissionIds } } });
  await prisma.vendor.deleteMany({ where: { userId: { in: createdUserIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

describe('C4 — propose a store coupon', () => {
  it('creates a PENDING_REVIEW store_coupon submission', async () => {
    const c = callerFor(owner);
    const sub = await c.vendorPortal.createCoupon({
      code: 'SAVE20',
      discountType: 'percent',
      discountValue: 20,
      minOrderAmount: 100,
      maxUses: 50,
    });
    createdSubmissionIds.push(sub.id);

    expect(sub.kind).toBe('store_coupon');
    expect(sub.status).toBe('PENDING_REVIEW');
    const payload = sub.payload as Record<string, unknown>;
    expect(payload.code).toBe('SAVE20');
    expect(payload.vendorId).toBe(ownerVendorId);
  });

  it('rejects a code that is already live', async () => {
    const a = callerFor(admin);
    await a.promo.create({ code: 'TAKEN10', discountType: 'percent', discountValue: 10 });
    const c = callerFor(owner);
    await expect(
      c.vendorPortal.createCoupon({ code: 'TAKEN10', discountType: 'percent', discountValue: 10 }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });
});

describe('C4 — approval materializes the store-scoped promo', () => {
  it('admin approve → live PromoCode bound to the store', async () => {
    const sub = await prisma.providerSubmission.findFirstOrThrow({
      where: { providerId: owner.id, kind: 'store_coupon' },
    });
    const a = callerFor(admin);
    await a.providerReview.decide({ id: sub.id, approve: true });

    const promo = await prisma.promoCode.findUnique({ where: { code: 'SAVE20' } });
    expect(promo).not.toBeNull();
    expect(promo!.vendorId).toBe(ownerVendorId);
    expect(promo!.isActive).toBe(true);

    const c = callerFor(owner);
    const mine = await c.vendorPortal.listCoupons();
    expect(mine.some((p: { code: string }) => p.code === 'SAVE20')).toBe(true);
  });

  it('the outsider does not see the owner store coupon', async () => {
    const other = callerFor(outsider);
    const mine = await other.vendorPortal.listCoupons();
    expect(mine.some((p: { code: string }) => p.code === 'SAVE20')).toBe(false);
  });
});

describe('C4 — store-scoped redemption', () => {
  it('validates against the owning store', async () => {
    const anon = callerFor(null);
    const res = await anon.promo.validate({
      code: 'SAVE20',
      orderAmount: 200,
      vendorId: ownerVendorId,
    });
    expect(res.valid).toBe(true);
    expect(res.discountAmount).toBe(40); // 20% of 200
  });

  it('rejects the code for another store (cross-store)', async () => {
    const anon = callerFor(null);
    await expect(
      anon.promo.validate({ code: 'SAVE20', orderAmount: 200, vendorId: outsiderVendorId }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('rejects the store coupon without store context', async () => {
    const anon = callerFor(null);
    await expect(anon.promo.validate({ code: 'SAVE20', orderAmount: 200 })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('keeps platform codes store-agnostic (regression)', async () => {
    const anon = callerFor(null);
    const res = await anon.promo.validate({ code: 'TAKEN10', orderAmount: 100 });
    expect(res.valid).toBe(true);
  });
});

describe('C4 — vendor deactivates their own coupon', () => {
  it('the owner deactivates; a non-owner is forbidden', async () => {
    const promo = await prisma.promoCode.findUniqueOrThrow({ where: { code: 'SAVE20' } });

    const other = callerFor(outsider);
    await expect(other.vendorPortal.deactivateCoupon({ id: promo.id })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });

    const c = callerFor(owner);
    await c.vendorPortal.deactivateCoupon({ id: promo.id });
    const after = await prisma.promoCode.findUnique({ where: { code: 'SAVE20' } });
    expect(after!.isActive).toBe(false);

    // Deactivated code no longer validates.
    const anon = callerFor(null);
    await expect(
      anon.promo.validate({ code: 'SAVE20', orderAmount: 200, vendorId: ownerVendorId }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});
