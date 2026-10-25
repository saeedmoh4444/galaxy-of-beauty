/**
 * F5 — Post-fulfillment review requests (VENDOR_DASHBOARD_ENHANCEMENT_PLAN
 * Wave 6). Fulfilling an order requests a review from the customer for each
 * purchased product — once per customer-product pair (ReviewRequest unique
 * key); an existing review suppresses the request.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];
const createdCategoryIds: number[] = [];
const createdProductIds: number[] = [];
const createdOrderIds: number[] = [];
const createdItemIds: number[] = [];
const createdReviewIds: number[] = [];
const createdTemplateIds: number[] = [];

let owner: JwtPayload;
let buyer: JwtPayload;

let vendorId: number;
let productAId: number;
let productBId: number;

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

async function fulfillableOrder(items: Array<{ productId: number; price: number }>) {
  const order = await prisma.storeOrder.create({
    data: {
      vendorId,
      customerId: buyer.id,
      totalAmount: items.reduce((s, i) => s + i.price, 0),
      itemCount: items.length,
      status: 'PENDING_FULFILLMENT',
    },
  });
  createdOrderIds.push(order.id);
  await prisma.storeOrderItem.createMany({
    data: items.map((i, idx) => ({
      orderId: order.id,
      productId: i.productId,
      nameSnapshot: { ar: `منتج ${idx}` },
      priceSnapshot: i.price,
      quantity: 1,
    })),
  });
  return order;
}

beforeAll(async () => {
  const t = await prisma.notificationTemplate.upsert({
    where: { key: 'store_review_request' },
    update: {},
    create: {
      key: 'store_review_request',
      category: 'bookingReminders',
      channels: ['in_app'],
      titleJson: { ar: 'قيّمي مشترياتك', en: 'Rate Your Purchase' },
      bodyJson: { ar: '{{productName}}', en: '{{productName}}' },
    },
  });
  createdTemplateIds.push(t.id);

  const ownerU = await prisma.user.create({ data: buildUser() });
  const buyerU = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(ownerU.id, buyerU.id);
  owner = { id: ownerU.id, role: 'CUSTOMER', email: ownerU.email };
  buyer = { id: buyerU.id, role: 'CUSTOMER', email: buyerU.email };

  const vendor = await prisma.vendor.create({
    data: { userId: ownerU.id, storeName: 'Review Store', storeSlug: `fr-${Date.now()}` },
  });
  createdVendorIds.push(vendor.id);
  vendorId = vendor.id;

  const cat = await prisma.productCategory.create({
    data: { nameJson: { ar: 'أساسي', en: 'Core' }, slug: `fr-cat-${Date.now()}` },
  });
  createdCategoryIds.push(cat.id);

  const a = await prisma.product.create({
    data: {
      vendorId: vendor.id,
      categoryId: cat.id,
      nameJson: { ar: 'سيروم', en: 'Serum' },
      descriptionJson: { ar: '', en: '' },
      price: 100,
      stock: 50,
    },
  });
  const b = await prisma.product.create({
    data: {
      vendorId: vendor.id,
      categoryId: cat.id,
      nameJson: { ar: 'كريم', en: 'Cream' },
      descriptionJson: { ar: '', en: '' },
      price: 60,
      stock: 50,
    },
  });
  createdProductIds.push(a.id, b.id);
  productAId = a.id;
  productBId = b.id;
}, 15000);

afterAll(async () => {
  await prisma.notification.deleteMany({ where: { userId: { in: createdUserIds } } });
  await prisma.reviewRequest.deleteMany({ where: { productId: { in: createdProductIds } } });
  await prisma.productReview.deleteMany({ where: { id: { in: createdReviewIds } } });
  await prisma.payout.deleteMany({ where: { vendorId: { in: createdVendorIds } } });
  await prisma.storeOrderItem.deleteMany({ where: { id: { in: createdItemIds } } });
  await prisma.storeOrder.deleteMany({ where: { id: { in: createdOrderIds } } });
  await prisma.product.deleteMany({ where: { id: { in: createdProductIds } } });
  await prisma.productCategory.deleteMany({ where: { id: { in: createdCategoryIds } } });
  await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
  await prisma.notificationTemplate.deleteMany({ where: { id: { in: createdTemplateIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

describe('F5 — post-fulfillment review requests', () => {
  it('fulfilling an order requests one review per purchased product', async () => {
    const order = await fulfillableOrder([
      { productId: productAId, price: 100 },
      { productId: productBId, price: 60 },
    ]);
    const c = await caller(owner);
    await c.vendorPortal.fulfillOrder({ orderId: order.id });

    const requests = await prisma.reviewRequest.findMany({
      where: { productId: { in: [productAId, productBId] } },
    });
    expect(requests).toHaveLength(2);
    const notifs = await prisma.notification.findMany({
      where: { userId: buyer.id, type: 'store_review_request' },
    });
    expect(notifs).toHaveLength(2);
  });

  it('never re-requests the same customer-product pair', async () => {
    const order = await fulfillableOrder([{ productId: productAId, price: 100 }]);
    const c = await caller(owner);
    await c.vendorPortal.fulfillOrder({ orderId: order.id });

    const requests = await prisma.reviewRequest.findMany({
      where: { customerId: buyer.id, productId: productAId },
    });
    expect(requests).toHaveLength(1);
    const notifs = await prisma.notification.findMany({
      where: { userId: buyer.id, type: 'store_review_request' },
    });
    const forA = notifs.filter((n) => ((n.bodyJson as { ar: string }).ar ?? '').includes('سيروم'));
    expect(forA).toHaveLength(1);
  });

  it('suppresses the request when the customer already reviewed the product', async () => {
    const review = await prisma.productReview.create({
      data: { productId: productBId, userId: buyer.id, rating: 5 },
    });
    createdReviewIds.push(review.id);

    const requestsBefore = await prisma.reviewRequest.count({
      where: { customerId: buyer.id, productId: productBId },
    });
    const notifsBefore = await prisma.notification.count({
      where: { userId: buyer.id, type: 'store_review_request' },
    });

    const order = await fulfillableOrder([{ productId: productBId, price: 60 }]);
    const c = await caller(owner);
    await c.vendorPortal.fulfillOrder({ orderId: order.id });

    // No NEW request/notification for the already-reviewed product.
    expect(
      await prisma.reviewRequest.count({
        where: { customerId: buyer.id, productId: productBId },
      }),
    ).toBe(requestsBefore);
    expect(
      await prisma.notification.count({
        where: { userId: buyer.id, type: 'store_review_request' },
      }),
    ).toBe(notifsBefore);
  });
});
