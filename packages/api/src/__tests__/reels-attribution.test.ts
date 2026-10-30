/**
 * Q3 Phase 3 (REELS_SHOPPABLE_PLAN) — reel → order conversion
 * attribution. The D1 materializer credits a store order to a reel when
 * the customer tapped a shoppable tag on the ordered product within the
 * 7-day attribution window BEFORE the order. VendorDailyStat gains
 * reelOrders/reelRevenue; a per-reel ReelDailyStat row carries the same
 * numbers so the portal can rank reels by conversion. Re-runs stay
 * idempotent (upserts). Each scenario uses its own customer — the
 * attribution matches ANY prior tap by that customer, so sharing one
 * would bleed expectations across tests.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Job } from 'bullmq';
import { prisma } from '@galaxy/db';
import { handleDailyStatsJob, noonUtcDay, type DailyStatsJob } from '../workers/handlers';
import { buildUser } from './factories';

const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];
const createdCategoryIds: number[] = [];
const createdProductIds: number[] = [];
const createdShortIds: number[] = [];
const createdTagIds: number[] = [];
const createdClickIds: number[] = [];
const createdOrderIds: number[] = [];

let vendorId: number;
let productId: number;
let otherProductId: number;
let shortId: number;
let tagId: number;

// A fixed KSA business date: 2026-10-20 (bucket 2026-10-20T00:00:00Z).
const DAY = noonUtcDay('2026-10-20');
const IN_BUCKET = new Date(DAY.getTime() + 14 * 3600_000); // 14:00Z — inside the noon→noon bucket

async function makeCustomer() {
  const u = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(u.id);
  return u.id;
}

async function makeOrder(
  customerId: number,
  total: number,
  createdAt: Date,
  product: number = productId,
) {
  const order = await prisma.storeOrder.create({
    data: {
      vendorId,
      customerId,
      totalAmount: total,
      itemCount: 1,
      status: 'FULFILLED',
      createdAt,
    },
  });
  createdOrderIds.push(order.id);
  await prisma.storeOrderItem.create({
    data: {
      orderId: order.id,
      productId: product,
      nameSnapshot: { ar: 'منتج' },
      priceSnapshot: total,
      quantity: 1,
      createdAt,
    },
  });
  return order;
}

async function makeClick(customerId: number, clickedAt: Date, product: number = productId) {
  const click = await prisma.shortTagClick.create({
    data: { tagId, shortId, productId: product, userId: customerId, clickedAt },
  });
  createdClickIds.push(click.id);
  return click;
}

async function runJob(date = '2026-10-20') {
  await handleDailyStatsJob({ data: { date } } as Job<DailyStatsJob>);
}

beforeAll(async () => {
  const stamp = Date.now().toString(36);
  const vendorU = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(vendorU.id);

  const v = await prisma.vendor.create({
    data: { userId: vendorU.id, storeName: 'Attrib Store', storeSlug: `attrib-${stamp}` },
  });
  createdVendorIds.push(v.id);
  vendorId = v.id;

  const pcat = await prisma.productCategory.create({
    data: { nameJson: { ar: 'عناية', en: 'Care' }, slug: `attrib-pcat-${stamp}` },
  });
  createdCategoryIds.push(pcat.id);

  const p = await prisma.product.create({
    data: {
      vendorId,
      categoryId: pcat.id,
      nameJson: { ar: 'سيروم', en: 'Serum' },
      descriptionJson: { ar: '', en: '' },
      price: 120,
      stock: 10,
    },
  });
  const p2 = await prisma.product.create({
    data: {
      vendorId,
      categoryId: pcat.id,
      nameJson: { ar: 'كريم', en: 'Cream' },
      descriptionJson: { ar: '', en: '' },
      price: 50,
      stock: 10,
    },
  });
  createdProductIds.push(p.id, p2.id);
  productId = p.id;
  otherProductId = p2.id;

  const s = await prisma.short.create({
    data: {
      type: 'reel',
      titleJson: { ar: 'ريل الإسناد', en: 'Attributed reel' },
      consentGiven: true,
      faceBlurred: true,
      vendorId,
      isApproved: true,
      isActive: true,
      durationSec: 30,
      category: 'skincare',
    },
  });
  createdShortIds.push(s.id);
  shortId = s.id;

  const t = await prisma.shortTag.create({
    data: { shortId, productId, labelJson: { ar: 'اشترِ الآن', en: 'Shop now' } },
  });
  createdTagIds.push(t.id);
  tagId = t.id;
}, 30000);

afterAll(async () => {
  try {
    await prisma.storeOrderItem.deleteMany({ where: { orderId: { in: createdOrderIds } } });
  } catch {}
  try {
    await prisma.storeOrder.deleteMany({ where: { id: { in: createdOrderIds } } });
  } catch {}
  try {
    await prisma.reelDailyStat.deleteMany({ where: { shortId: { in: createdShortIds } } });
  } catch {}
  try {
    await prisma.vendorDailyStat.deleteMany({ where: { vendorId } });
  } catch {}
  try {
    await prisma.shortTagClick.deleteMany({ where: { id: { in: createdClickIds } } });
  } catch {}
  try {
    await prisma.shortTag.deleteMany({ where: { id: { in: createdTagIds } } });
  } catch {}
  try {
    await prisma.short.deleteMany({ where: { id: { in: createdShortIds } } });
  } catch {}
  try {
    await prisma.product.deleteMany({ where: { id: { in: createdProductIds } } });
  } catch {}
  try {
    await prisma.productCategory.deleteMany({ where: { id: { in: createdCategoryIds } } });
  } catch {}
  try {
    await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
  } catch {}
  try {
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  } catch {}
});

describe('reel conversion attribution (Q3)', () => {
  it('credits an order whose customer tapped the product tag within 7 days', async () => {
    const c = await makeCustomer();
    await makeClick(c, new Date(IN_BUCKET.getTime() - 86_400_000)); // 1 day before
    await makeOrder(c, 120, IN_BUCKET);

    await runJob();

    const stat = await prisma.vendorDailyStat.findUnique({
      where: { vendorId_day: { vendorId, day: DAY } },
    });
    expect(stat?.reelOrders).toBe(1);
    expect(Number(stat?.reelRevenue)).toBe(120);

    const reel = await prisma.reelDailyStat.findUnique({
      where: { shortId_day: { shortId, day: DAY } },
    });
    expect(reel?.orders).toBe(1);
    expect(Number(reel?.revenue)).toBe(120);
  });

  it('does not attribute a click that happens AFTER the order', async () => {
    const c = await makeCustomer();
    await makeClick(c, new Date(IN_BUCKET.getTime() + 3 * 3600_000)); // after
    await makeOrder(c, 90, new Date(IN_BUCKET.getTime() + 2 * 3600_000));

    await runJob();

    const stat = await prisma.vendorDailyStat.findUnique({
      where: { vendorId_day: { vendorId, day: DAY } },
    });
    // Only the first case's order is attributed.
    expect(stat?.reelOrders).toBe(1);
  });

  it('does not attribute clicks on a different product', async () => {
    const c = await makeCustomer();
    await makeClick(c, new Date(IN_BUCKET.getTime() - 3600_000), productId);
    await makeOrder(c, 60, IN_BUCKET, otherProductId);

    await runJob();

    const reel = await prisma.reelDailyStat.findUnique({
      where: { shortId_day: { shortId, day: DAY } },
    });
    expect(reel?.orders).toBe(1);
  });

  it('is idempotent on re-runs (same values, one row)', async () => {
    await runJob();
    await runJob();

    const stat = await prisma.vendorDailyStat.findUnique({
      where: { vendorId_day: { vendorId, day: DAY } },
    });
    expect(stat?.reelOrders).toBe(1);
    const rows = await prisma.reelDailyStat.count({
      where: { shortId, day: DAY },
    });
    expect(rows).toBe(1);
  });

  it('counts no attribution for clicks older than the 7-day window', async () => {
    const c = await makeCustomer();
    await makeClick(c, new Date(IN_BUCKET.getTime() - 8 * 86_400_000)); // 8 days before
    await makeOrder(c, 70, IN_BUCKET);

    await runJob();

    const stat = await prisma.vendorDailyStat.findUnique({
      where: { vendorId_day: { vendorId, day: DAY } },
    });
    expect(stat?.reelOrders).toBe(1);
  });
});
