/**
 * C3 — vendor pricing rules (Wave C): CRUD with the uplift-only guardrail,
 * the per-product change log (with/without-rule deltas), the admin
 * override precedence, and the storefront effective price.
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

let owner: JwtPayload;
let outsider: JwtPayload;
let ownerVendorId: number;
let lowProduct: number; // below threshold → lowstock rules fire
let healthyProduct: number; // above threshold

const ADMIN: JwtPayload = { id: 0, role: 'ADMIN', email: 'admin@galaxyofbeauty.sa' };

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

beforeAll(async () => {
  const users = await Promise.all(
    [owner, outsider].map(() => prisma.user.create({ data: buildUser() })),
  );
  createdUserIds.push(...users.map((u) => u.id));
  [owner, outsider] = users.map((u) => ({ id: u.id, role: 'CUSTOMER', email: u.email }));

  const slugBase = `c3-${Date.now()}`;
  const ownerV = await prisma.vendor.create({
    data: {
      userId: owner.id,
      storeName: 'V c3 owner',
      storeSlug: `${slugBase}-o`,
      isVerified: true,
    },
  });
  const outsiderV = await prisma.vendor.create({
    data: { userId: outsider.id, storeName: 'V c3 outsider', storeSlug: `${slugBase}-x` },
  });
  createdVendorIds.push(ownerV.id, outsiderV.id);
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
}, 30000);

afterAll(async () => {
  await prisma.productPriceLog.deleteMany({ where: { productId: { in: createdProductIds } } });
  await prisma.vendorPriceRule.deleteMany({ where: { id: { in: createdRuleIds } } });
  await prisma.product.deleteMany({ where: { id: { in: createdProductIds } } });
  await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
}, 30000);

describe('C3 — vendor pricing rules', () => {
  it('addPriceRule creates a rule and logs every affected product (with/without delta)', async () => {
    const c = await caller(owner);
    const rule = await c.vendorPortal.addPriceRule({
      ruleType: 'lowstock_floor',
      multiplier: 1.15,
    });
    createdRuleIds.push(rule.id);

    const listed = await c.vendorPortal.priceRules();
    expect(listed.some((r: { id: number }) => r.id === rule.id)).toBe(true);

    const logs = await prisma.productPriceLog.findMany({
      where: { ruleId: rule.id },
      orderBy: { productId: 'asc' },
    });
    expect(logs).toHaveLength(2); // both products logged
    const lowLog = logs.find((l) => l.productId === lowProduct)!;
    // lowstock fires for the below-threshold product only.
    expect(Number(lowLog.oldPrice)).toBe(100);
    expect(Number(lowLog.newPrice)).toBe(115);
    const healthyLog = logs.find((l) => l.productId === healthyProduct)!;
    expect(Number(healthyLog.newPrice)).toBe(100); // rule does not fire

    // Deactivate so later tests evaluate their own rules in isolation.
    await c.vendorPortal.updatePriceRule({ ruleId: rule.id, isActive: false });
  });

  it('rejects multipliers below 1.0 (uplift-only guardrail)', async () => {
    const c = await caller(owner);
    await expect(
      c.vendorPortal.addPriceRule({ ruleType: 'weekend_uplift', dayOfWeek: 5, multiplier: 0.8 }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });

  it('rejects a foreign productId with NOT_FOUND', async () => {
    const c = await caller(owner);
    const foreign = await prisma.product.create({
      data: {
        vendorId: (await prisma.vendor.findFirst({ where: { userId: outsider.id } }))!.id,
        categoryId: (await prisma.productCategory.findFirst({ orderBy: { sortOrder: 'asc' } }))!.id,
        nameJson: { ar: 'F', en: 'F' },
        descriptionJson: { ar: '', en: '' },
        price: 10,
        stock: 1,
        sales: 0,
        emoji: '🧴',
        images: [],
        isActive: true,
      },
    });
    createdProductIds.push(foreign.id);
    await expect(
      c.vendorPortal.addPriceRule({
        productId: foreign.id,
        ruleType: 'lowstock_floor',
        multiplier: 1.1,
      }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('deactivation logs a DECREASE (effective with-rule → without-rule)', async () => {
    const c = await caller(owner);
    const rule = await c.vendorPortal.addPriceRule({
      productId: lowProduct,
      ruleType: 'lowstock_floor',
      multiplier: 1.2,
    });
    createdRuleIds.push(rule.id);

    await c.vendorPortal.updatePriceRule({ ruleId: rule.id, isActive: false });
    const logs = await prisma.productPriceLog.findMany({
      where: { ruleId: rule.id },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });
    expect(Number(logs[0]!.oldPrice)).toBe(120);
    expect(Number(logs[0]!.newPrice)).toBe(100);
  });

  it('admin override wins in the storefront effective price, clearing restores', async () => {
    const c = await caller(owner);
    const rule = await c.vendorPortal.addPriceRule({
      productId: lowProduct,
      ruleType: 'lowstock_floor',
      multiplier: 1.2,
    });
    createdRuleIds.push(rule.id);

    const admin = await caller(ADMIN);
    await admin.pricingAdmin.overrideVendorRule({ ruleId: rule.id, multiplier: 1.05 });

    const vendor = await prisma.vendor.findUniqueOrThrow({ where: { id: ownerVendorId } });
    const detail = await (await caller(null)).marketplace.vendorDetail({ slug: vendor.storeSlug });
    const low = (detail.products as Array<{ id: number; effectivePrice: number }>).find(
      (p) => p.id === lowProduct,
    );
    expect(low!.effectivePrice).toBe(105); // 100 × 1.05 (override, not 1.2)

    await admin.pricingAdmin.overrideVendorRule({ ruleId: rule.id, multiplier: null });
    const detail2 = await (await caller(null)).marketplace.vendorDetail({ slug: vendor.storeSlug });
    const low2 = (detail2.products as Array<{ id: number; effectivePrice: number }>).find(
      (p) => p.id === lowProduct,
    );
    expect(low2!.effectivePrice).toBe(120); // vendor multiplier restored
  });

  it('priceLog is ownership-guarded', async () => {
    const c = await caller(outsider);
    await expect(c.vendorPortal.priceLog({ productId: lowProduct })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });
});
