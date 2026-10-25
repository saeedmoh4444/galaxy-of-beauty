/**
 * F1 — Vendor inbox (VENDOR_DASHBOARD_ENHANCEMENT_PLAN Wave 6).
 * The vendor business moments that emit in-app notifications: new store
 * order, product review left, payout processing, dispute resolved. The
 * inbox list/mark-read surface reuses the notifications domain as-is.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';
import { placeStoreOrders, notifyOrderPlaced } from '../lib/storeCheckout';

const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];
const createdCategoryIds: number[] = [];
const createdProductIds: number[] = [];
const createdCheckoutIds: number[] = [];
const createdOrderIds: number[] = [];
const createdPayoutIds: number[] = [];
const createdDisputeIds: number[] = [];
const createdTemplateIds: number[] = [];

let owner: JwtPayload;
let buyer: JwtPayload;
let admin: JwtPayload;

let vendorId: number;
let productId: number;

const DAY = 86_400_000;

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

async function seedTemplate(key: string, titleAr: string, bodyAr: string) {
  const t = await prisma.notificationTemplate.upsert({
    where: { key },
    update: {},
    create: {
      key,
      category: 'provider',
      channels: ['in_app'],
      titleJson: { ar: titleAr, en: titleAr },
      bodyJson: { ar: bodyAr, en: bodyAr },
    },
  });
  createdTemplateIds.push(t.id);
  return t;
}

async function notifsOf(userId: number, type: string) {
  return prisma.notification.findMany({
    where: { userId, type },
    orderBy: { id: 'desc' },
  });
}

beforeAll(async () => {
  await seedTemplate('store_order_placed', 'طلب جديد', 'طلب #{{orderId}} بقيمة {{total}}');
  await seedTemplate('store_review_left', 'تقييم جديد', '{{rating}}★ على {{productName}}');
  await seedTemplate('payout_processing', 'دفعة قيد المعالجة', '{{amount}} ر.س');
  await seedTemplate('dispute_resolved', 'قرار الإدارة بشأن نزاع', '{{resolution}}');

  const ownerU = await prisma.user.create({ data: buildUser() });
  const buyerU = await prisma.user.create({ data: buildUser() });
  const adminU = await prisma.user.create({ data: buildUser({ role: 'ADMIN' }) });
  createdUserIds.push(ownerU.id, buyerU.id, adminU.id);
  owner = { id: ownerU.id, role: 'CUSTOMER', email: ownerU.email };
  buyer = { id: buyerU.id, role: 'CUSTOMER', email: buyerU.email };
  admin = { id: adminU.id, role: 'ADMIN', email: adminU.email };

  const vendor = await prisma.vendor.create({
    data: { userId: ownerU.id, storeName: 'Inbox Store', storeSlug: `fb-${Date.now()}` },
  });
  createdVendorIds.push(vendor.id);
  vendorId = vendor.id;

  const cat = await prisma.productCategory.create({
    data: { nameJson: { ar: 'أساسي', en: 'Core' }, slug: `fb-cat-${Date.now()}` },
  });
  createdCategoryIds.push(cat.id);

  const p = await prisma.product.create({
    data: {
      vendorId: vendor.id,
      categoryId: cat.id,
      nameJson: { ar: 'سيروم', en: 'Serum' },
      descriptionJson: { ar: '', en: '' },
      price: 100,
      stock: 50,
      lowStockThreshold: 5,
    },
  });
  createdProductIds.push(p.id);
  productId = p.id;
}, 15000);

afterAll(async () => {
  await prisma.notification.deleteMany({ where: { userId: { in: createdUserIds } } });
  await prisma.dispute.deleteMany({ where: { id: { in: createdDisputeIds } } });
  await prisma.payout.deleteMany({ where: { id: { in: createdPayoutIds } } });
  await prisma.storeOrder.deleteMany({ where: { id: { in: createdOrderIds } } });
  await prisma.storeCheckout.deleteMany({ where: { id: { in: createdCheckoutIds } } });
  await prisma.productReview.deleteMany({ where: { productId: { in: createdProductIds } } });
  await prisma.product.deleteMany({ where: { id: { in: createdProductIds } } });
  await prisma.productCategory.deleteMany({ where: { id: { in: createdCategoryIds } } });
  await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
  await prisma.notificationTemplate.deleteMany({ where: { id: { in: createdTemplateIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

describe('F1 — store_order_placed emission', () => {
  it('notifies the vendor once per order after checkout', async () => {
    const placed = await prisma.$transaction(async (tx) => {
      return placeStoreOrders(tx, buyer.id, [
        {
          productId,
          vendorId,
          name: 'سيروم',
          nameJson: { ar: 'سيروم' },
          quantity: 2,
          stock: 50,
          unitPrice: 100,
          lowStockThreshold: 5,
        },
      ]);
    });
    createdOrderIds.push(...placed.orders.map((o) => o.id));
    await notifyOrderPlaced(placed.orders);

    const rows = await notifsOf(owner.id, 'store_order_placed');
    expect(rows).toHaveLength(1);
    expect((rows[0].bodyJson as { ar: string }).ar).toContain('200');
    expect(rows[0].link).toBe('/store?tab=orders');
  });
});

describe('F1 — store_review_left emission', () => {
  it('notifies the product vendor when a customer leaves a review', async () => {
    const c = await caller(buyer);
    await c.marketplace.addReview({ productId, rating: 4, comment: 'رائع' });

    const rows = await notifsOf(owner.id, 'store_review_left');
    expect(rows).toHaveLength(1);
    expect((rows[0].bodyJson as { ar: string }).ar).toContain('4');
    expect(rows[0].link).toBe('/store?tab=reviews');
  });
});

describe('F1 — payout_processing emission', () => {
  it('notifies the vendor owner when admin processes a store payout', async () => {
    const payout = await prisma.payout.create({
      data: {
        vendorId,
        periodStart: new Date(Date.now() - 7 * DAY),
        periodEnd: new Date(),
        amount: 500,
        status: 'PENDING',
      },
    });
    createdPayoutIds.push(payout.id);

    const a = await caller(admin);
    await a.payouts.process({ payoutId: payout.id });

    const rows = await notifsOf(owner.id, 'payout_processing');
    expect(rows).toHaveLength(1);
    expect((rows[0].bodyJson as { ar: string }).ar).toContain('500');
  });
});

describe('F1 — dispute_resolved emission', () => {
  it('notifies the store vendor when admin resolves their order dispute', async () => {
    const order = await prisma.storeOrder.create({
      data: {
        vendorId,
        customerId: buyer.id,
        totalAmount: 100,
        itemCount: 1,
        status: 'FULFILLED',
      },
    });
    createdOrderIds.push(order.id);
    const dispute = await prisma.dispute.create({
      data: { raisedBy: buyer.id, storeOrderId: order.id, reason: 'لم يصل الطلب', status: 'OPEN' },
    });
    createdDisputeIds.push(dispute.id);

    const a = await caller(admin);
    await a.disputes.resolve({
      disputeId: dispute.id,
      resolution: 'تم الحكم لصالح العميلة',
      status: 'RESOLVED_CUSTOMER',
    });

    const rows = await notifsOf(owner.id, 'dispute_resolved');
    expect(rows).toHaveLength(1);
    expect((rows[0].bodyJson as { ar: string }).ar).toContain('لصالح العميلة');
  });
});
