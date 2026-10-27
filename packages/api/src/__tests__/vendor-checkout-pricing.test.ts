/**
 * C3c — checkout-time pricing (Wave C): the C3a uplift rules apply to the
 * actual cart/checkout math, not just the storefront display. The cart
 * query and readCartForCheckout both price lines through
 * evaluateVendorRules (variant deltas add BEFORE multipliers).
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];
const createdProductIds: number[] = [];
const createdRuleIds: number[] = [];
const createdOrderIds: number[] = [];

let owner: JwtPayload;
let customer: JwtPayload;
let ownerVendorId: number;
let lowProduct: number; // below threshold → the rule fires
let healthyProduct: number;

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

beforeAll(async () => {
  const users = await Promise.all(
    [owner, customer].map(() => prisma.user.create({ data: buildUser() })),
  );
  createdUserIds.push(...users.map((u) => u.id));
  [owner, customer] = users.map((u) => ({ id: u.id, role: 'CUSTOMER', email: u.email }));

  const slugBase = `c3c-${Date.now()}`;
  const ownerV = await prisma.vendor.create({
    data: { userId: owner.id, storeName: 'V c3c', storeSlug: `${slugBase}-o`, isVerified: true },
  });
  createdVendorIds.push(ownerV.id);
  ownerVendorId = ownerV.id;

  const cat = await prisma.productCategory.findFirst({ orderBy: { sortOrder: 'asc' } });
  const mk = async (name: string, stock: number, threshold: number) =>
    prisma.product.create({
      data: {
        vendorId: ownerVendorId,
        categoryId: cat!.id,
        nameJson: { ar: name, en: name },
        descriptionJson: { ar: '', en: '' },
        price: 100,
        stock,
        lowStockThreshold: threshold,
        sales: 0,
        emoji: '🧴',
        images: [],
        isActive: true,
      },
    });
  lowProduct = (await mk('Low', 3, 5)).id;
  healthyProduct = (await mk('Healthy', 20, 5)).id;
  createdProductIds.push(lowProduct, healthyProduct);

  // A low-stock floor of 1.1 on the vendor's products.
  const rule = await prisma.vendorPriceRule.create({
    data: {
      vendorId: ownerVendorId,
      productId: null,
      ruleType: 'lowstock_floor',
      dayOfWeek: null,
      multiplier: 1.1,
    },
  });
  createdRuleIds.push(rule.id);
}, 30000);

afterAll(async () => {
  await prisma.notification.deleteMany({ where: { userId: { in: createdUserIds } } });
  await prisma.cartItem.deleteMany({ where: { userId: { in: createdUserIds } } });
  await prisma.storeOrderItem.deleteMany({ where: { orderId: { in: createdOrderIds } } });
  await prisma.storeOrder.deleteMany({ where: { id: { in: createdOrderIds } } });
  await prisma.productPriceLog.deleteMany({ where: { productId: { in: createdProductIds } } });
  await prisma.vendorPriceRule.deleteMany({ where: { id: { in: createdRuleIds } } });
  await prisma.product.deleteMany({ where: { id: { in: createdProductIds } } });
  await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
}, 30000);

describe('C3c — checkout-time pricing', () => {
  it('the cart query prices a below-threshold line through the rule', async () => {
    const c = await caller(customer);
    await c.marketplace.addToCart({ productId: lowProduct, quantity: 1 });
    const cart = await c.marketplace.cart();
    const line = cart.find((i: { productId: number }) => i.productId === lowProduct);
    expect(Number(line.effectivePrice)).toBe(110); // 100 × 1.1
    await c.marketplace.removeFromCart({ productId: lowProduct });
  });

  it('buyCart charges the effective price for the below-threshold product', async () => {
    const c = await caller(customer);
    await c.marketplace.addToCart({ productId: lowProduct, quantity: 2 });
    await c.marketplace.addToCart({ productId: healthyProduct, quantity: 1 });
    await c.marketplace.buyCart({});

    const order = await prisma.storeOrder.findFirst({
      where: { vendorId: ownerVendorId },
      orderBy: { id: 'desc' },
    });
    createdOrderIds.push(order!.id);
    // 2 × 110 (rule fires) + 1 × 100 (rule does not) = 320.
    expect(Number(order!.totalAmount)).toBe(320);
  });

  it('variant deltas add BEFORE the multiplier', async () => {
    const variant = await prisma.productVariant.create({
      data: {
        productId: lowProduct,
        nameJson: { ar: 'كبير', en: 'Large' },
        priceDelta: 20,
        stock: 3,
        lowStockThreshold: 5,
      },
    });
    const c = await caller(customer);
    await c.marketplace.addToCart({ productId: lowProduct, variantId: variant.id, quantity: 1 });
    const cart = await c.marketplace.cart();
    const line = cart.find((i: { variantId: number | null }) => i.variantId === variant.id);
    // (100 + 20) × 1.1 = 132.
    expect(Number(line.effectivePrice)).toBe(132);
  });
});
