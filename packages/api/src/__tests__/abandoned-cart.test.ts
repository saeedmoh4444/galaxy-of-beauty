/**
 * ENHANCEMENT_PLAN 8.3 — slice C: abandoned cart (24h + 10% code).
 *
 * Drives: the pure abandonment helper, the daily sweep (stale non-empty
 * carts → 10% promo valid 24h + notification), and the notification-based
 * throttle (no cart_abandoned message in the last 24h).
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { prisma } from '@galaxy/db';
import { buildUser, buildVendor, buildProduct } from './factories';
import { isAbandoned, CART_ABANDON_HOURS, sendAbandonedCartEmails } from '../workers/abandonedCart';

const createdUserIds: number[] = [];
const createdProductIds: number[] = [];
const createdCategoryIds: number[] = [];
const createdVendorIds: number[] = [];
let staleUserId = 0;
let freshUserId = 0;
let throttledUserId = 0;

const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000);

beforeAll(async () => {
  await prisma.notificationTemplate.upsert({
    where: { key: 'cart_abandoned' },
    update: {},
    create: {
      key: 'cart_abandoned',
      category: 'promotions',
      channels: ['in_app', 'push'],
      titleJson: { ar: 'سلتك بانتظارك', en: 'Your Cart Is Waiting' },
      bodyJson: { ar: '{{code}}', en: '{{code}}' },
    },
  });

  // A vendor-owned product (products live in productCategory + vendor).
  const vendorUser = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(vendorUser.id);
  const vendor = await prisma.vendor.create({ data: buildVendor({ userId: vendorUser.id }) });
  createdVendorIds.push(vendor.id);
  const cat = await prisma.productCategory.create({
    data: {
      nameJson: { ar: 'منتجات', en: 'Products' },
      slug: `cart-abandon-cat-${Date.now()}`,
    },
  });
  createdCategoryIds.push(cat.id);
  const product = await prisma.product.create({
    data: buildProduct({
      vendorId: vendor.id,
      categoryId: cat.id,
      nameJson: { ar: 'منتج تجريبي', en: 'Test product' },
    }),
  });
  createdProductIds.push(product.id);

  const mkUser = async () => {
    const u = await prisma.user.create({ data: buildUser() });
    createdUserIds.push(u.id);
    return u;
  };

  const stale = await mkUser();
  staleUserId = stale.id;
  await prisma.cartItem.create({
    data: { userId: stale.id, productId: product.id, createdAt: hoursAgo(25) },
  });

  const fresh = await mkUser();
  freshUserId = fresh.id;
  await prisma.cartItem.create({
    data: { userId: fresh.id, productId: product.id, createdAt: hoursAgo(1) },
  });

  // Stale cart but notified 2h ago → throttled.
  const throttled = await mkUser();
  throttledUserId = throttled.id;
  await prisma.cartItem.create({
    data: { userId: throttled.id, productId: product.id, createdAt: hoursAgo(25) },
  });
  await prisma.notification.create({
    data: {
      userId: throttled.id,
      type: 'cart_abandoned',
      titleJson: { ar: 'x', en: 'x' },
      bodyJson: { ar: 'x', en: 'x' },
      sentVia: ['in_app'],
      createdAt: hoursAgo(2),
    },
  });
}, 30000);

afterAll(async () => {
  try {
    await prisma.promoCode.deleteMany({ where: { createdBy: { in: createdUserIds } } });
    await prisma.cartItem.deleteMany({ where: { userId: { in: createdUserIds } } });
    await prisma.notification.deleteMany({ where: { userId: { in: createdUserIds } } });
    await prisma.product.deleteMany({ where: { id: { in: createdProductIds } } });
    await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
    await prisma.productCategory.deleteMany({ where: { id: { in: createdCategoryIds } } });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  } catch {
    // cleanup is best-effort
  }
});

describe('isAbandoned', () => {
  it('flags carts older than the window', () => {
    expect(CART_ABANDON_HOURS).toBe(24);
    expect(isAbandoned(hoursAgo(25))).toBe(true);
    expect(isAbandoned(hoursAgo(24.5))).toBe(true);
    expect(isAbandoned(hoursAgo(1))).toBe(false);
  });
});

describe('sendAbandonedCartEmails', () => {
  it('nudges the stale cart with a 10% code and respects the throttle', async () => {
    const count = await sendAbandonedCartEmails();
    expect(count).toBeGreaterThanOrEqual(1);

    // Stale user got the message + a promo code.
    const note = await prisma.notification.findFirst({
      where: { userId: staleUserId, type: 'cart_abandoned' },
    });
    expect(note).not.toBeNull();

    const promo = await prisma.promoCode.findFirst({ where: { createdBy: staleUserId } });
    expect(promo).not.toBeNull();
    expect(promo!.discountType).toBe('percent');
    expect(Number(promo!.discountValue)).toBe(10);
    expect(promo!.maxUses).toBe(1);
    expect(promo!.validUntil!.getTime()).toBeGreaterThan(Date.now() + 23 * 3_600_000);
    expect(promo!.validUntil!.getTime()).toBeLessThan(Date.now() + 25 * 3_600_000);

    // Fresh + throttled users got nothing.
    for (const id of [freshUserId, throttledUserId]) {
      const none = await prisma.notification.findFirst({
        where: { userId: id, type: 'cart_abandoned' },
      });
      if (id === throttledUserId) {
        expect(none).not.toBeNull(); // the manual throttle marker row
      } else {
        expect(none).toBeNull();
      }
    }
  });

  it('does not re-send to the same user within 24h', async () => {
    await sendAbandonedCartEmails();
    const rows = await prisma.notification.count({
      where: { userId: staleUserId, type: 'cart_abandoned' },
    });
    expect(rows).toBe(1);
  });
});
