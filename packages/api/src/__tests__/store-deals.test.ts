/**
 * Store plan Phase 4b — store-proposed product deals through the shared
 * provider-submission queue. Stores discount their OWN products; admin
 * approval materializes a StoreDeal + sets comparePrice for the listing.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

let admin: JwtPayload;
let merchant: JwtPayload;
let otherMerchant: JwtPayload;
let ownProductId: number;
let foreignProductId: number;

const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];
const createdProductIds: number[] = [];
const createdSubmissionIds: number[] = [];
const createdDealIds: number[] = [];
let categoryId: number;

function callerFor(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

async function makeVendorWithProduct(userId: number, slugPrefix: string, price = 100) {
  const vendor = await prisma.vendor.create({
    data: {
      userId,
      storeName: `متجر ${slugPrefix}`,
      storeSlug: `${slugPrefix}-${Date.now()}`,
      isVerified: true,
      isActive: true,
    },
  });
  createdVendorIds.push(vendor.id);
  const product = await prisma.product.create({
    data: {
      vendorId: vendor.id,
      categoryId,
      nameJson: { ar: `منتج ${slugPrefix}`, en: `Product ${slugPrefix}` },
      descriptionJson: { ar: '', en: '' },
      price,
      stock: 10,
    },
  });
  createdProductIds.push(product.id);
  return { vendor, product };
}

const validDeal = (productId: number) => ({
  productId,
  dealPrice: 50, // 50% of 100 — above the 40% floor
  startsAt: new Date(Date.now() + 3_600_000).toISOString(),
  endsAt: new Date(Date.now() + 3 * 86_400_000).toISOString(),
});

describe('store deals (Store Phase 4b)', () => {
  beforeAll(async () => {
    const adminUser = await prisma.user.findFirstOrThrow({ where: { role: 'ADMIN' } });
    admin = { id: adminUser.id, role: 'ADMIN', email: adminUser.email };

    const u1 = await prisma.user.create({ data: buildUser() });
    merchant = { id: u1.id, role: 'CUSTOMER', email: u1.email };
    const u2 = await prisma.user.create({ data: buildUser() });
    otherMerchant = { id: u2.id, role: 'CUSTOMER', email: u2.email };
    createdUserIds.push(u1.id, u2.id);

    const cat = await prisma.productCategory.findUnique({ where: { slug: 'general' } });
    categoryId = cat!.id;

    const mine = await makeVendorWithProduct(u1.id, 'mine');
    ownProductId = mine.product.id;
    const theirs = await makeVendorWithProduct(u2.id, 'theirs');
    foreignProductId = theirs.product.id;
  }, 15000);

  afterAll(async () => {
    try {
      await prisma.storeDeal.deleteMany({ where: { id: { in: createdDealIds } } });
    } catch {}
    try {
      await prisma.providerSubmission.deleteMany({ where: { id: { in: createdSubmissionIds } } });
    } catch {}
    try {
      await prisma.notification.deleteMany({ where: { userId: { in: createdUserIds } } });
    } catch {}
    try {
      await prisma.product.deleteMany({ where: { id: { in: createdProductIds } } });
    } catch {}
    try {
      await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
    } catch {}
    try {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    } catch {}
  });

  it('rejects anonymous proposals', async () => {
    const anon = callerFor(null);
    await expect(anon.vendorPortal.proposeDeal(validDeal(ownProductId))).rejects.toThrow();
  });

  it('enforces the own-product rule and the discount floor', async () => {
    const c = callerFor(merchant);

    await expect(c.vendorPortal.proposeDeal(validDeal(foreignProductId))).rejects.toThrow(
      /own product/,
    );
    await expect(
      c.vendorPortal.proposeDeal({ ...validDeal(ownProductId), dealPrice: 30 }),
    ).rejects.toThrow(/floor/);
    await expect(
      c.vendorPortal.proposeDeal({
        ...validDeal(ownProductId),
        endsAt: new Date(Date.now() + 1000).toISOString(),
      }),
    ).rejects.toThrow(/after/);
  });

  it('proposes a deal → PENDING_REVIEW submission kind store_promotion', async () => {
    const c = callerFor(merchant);
    const sub = await c.vendorPortal.proposeDeal(validDeal(ownProductId));
    createdSubmissionIds.push(sub.id);

    expect(sub.kind).toBe('store_promotion');
    expect(sub.status).toBe('PENDING_REVIEW');
    const payload = sub.payload as Record<string, unknown>;
    expect(payload.productId).toBe(ownProductId);
    expect(payload.originalPrice).toBe(100);
    expect(payload.dealPrice).toBe(50);

    const mine = await c.vendorPortal.myDeals();
    expect(mine.length).toBe(1);
  });

  it('admin approve → StoreDeal row + comparePrice surfaced + provider notified', async () => {
    const submission = await prisma.providerSubmission.findFirstOrThrow({
      where: { providerId: merchant.id, kind: 'store_promotion' },
    });

    const a = callerFor(admin);
    await a.providerReview.decide({ id: submission.id, approve: true });

    const deal = await prisma.storeDeal.findFirst({ where: { productId: ownProductId } });
    expect(deal).not.toBeNull();
    expect(Number(deal!.originalPrice)).toBe(100);
    expect(Number(deal!.dealPrice)).toBe(50);
    expect(deal!.isActive).toBe(true);
    createdDealIds.push(deal!.id);

    const product = await prisma.product.findUniqueOrThrow({ where: { id: ownProductId } });
    expect(Number(product.comparePrice)).toBe(100);

    // Public listing surfaces the active deal — move the window into the
    // past (the proposal started in 1 hour).
    await prisma.storeDeal.update({
      where: { id: deal!.id },
      data: { startsAt: new Date(Date.now() - 3_600_000) },
    });
    const anon = callerFor(null);
    const listing = await anon.marketplace.products({ page: 1, limit: 50 });
    const item = listing.items.find((p: { id: number }) => p.id === ownProductId);
    expect(item).toBeDefined();
    expect(item.activeDeal).not.toBeNull();
    expect(Number(item.activeDeal.dealPrice)).toBe(50);

    const notif = await prisma.notification.findFirst({
      where: { userId: merchant.id, type: 'submission_approved' },
    });
    expect(notif).not.toBeNull();
  });

  it('admin reject → no deal created + rejection notification', async () => {
    const c = callerFor(merchant);
    const sub = await c.vendorPortal.proposeDeal({
      ...validDeal(ownProductId),
      dealPrice: 60,
    });
    createdSubmissionIds.push(sub.id);

    const a = callerFor(admin);
    await a.providerReview.decide({ id: sub.id, approve: false, notes: 'السعر غير مناسب' });

    const deals = await prisma.storeDeal.findMany({ where: { productId: ownProductId } });
    expect(deals.length).toBe(1); // only the approved one

    const notif = await prisma.notification.findFirst({
      where: { userId: merchant.id, type: 'submission_rejected' },
    });
    expect(notif).not.toBeNull();
  });

  it('dashboard returns top products by sales (analytics P1)', async () => {
    await prisma.product.update({ where: { id: ownProductId }, data: { sales: 7 } });
    const c = callerFor(merchant);
    const dash = await c.vendorPortal.dashboard();
    expect(dash.topProducts).toBeDefined();
    expect(dash.topProducts.length).toBeGreaterThanOrEqual(1);
    expect(dash.topProducts[0].id).toBe(ownProductId);
    expect(dash.topProducts[0].sales).toBe(7);
  });
});
