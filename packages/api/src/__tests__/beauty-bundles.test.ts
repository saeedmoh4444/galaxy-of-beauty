/**
 * ENHANCEMENT_PLAN 1.2 — Service Bundles (Slice 1): router behaviors.
 *
 * Drives: beautyBundles.get (hydrated services), admin update + soft
 * delete, and the public quote procedure (progressive custom-bundle pricing).
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';
import { generateCsrfToken } from '../lib/csrf';
import { buildUser } from './factories';
import type { JwtPayload } from '../lib/jwt';

const CSRF = generateCsrfToken();
const ADMIN: JwtPayload = { id: 3, role: 'ADMIN', email: 'admin@galaxyofbeauty.sa' };

async function authCaller(user: JwtPayload | null) {
  const ctx = await createTRPCContext({ user, csrfCookie: CSRF, csrfHeader: CSRF });
  return (appRouter as any).createCaller(ctx);
}

const SUFFIX = Date.now();
const createdServiceIds: number[] = [];
const createdBundleIds: number[] = [];
const createdCategoryIds: number[] = [];
const createdUserIds: number[] = [];
let bundleId = 0;
let customer: JwtPayload;
let prices: { id: number; basePrice: number }[] = [];

beforeAll(async () => {
  const [cat, user] = await Promise.all([
    prisma.category.create({
      data: {
        nameJson: { ar: `تصنيف باقات ${SUFFIX}`, en: `Bundle category ${SUFFIX}` },
        slug: `bundle-cat-${SUFFIX}`,
      },
    }),
    prisma.user.create({ data: buildUser() }),
  ]);
  createdCategoryIds.push(cat.id);
  createdUserIds.push(user.id);
  customer = { id: user.id, role: 'CUSTOMER', email: user.email };

  const defs = [
    { ar: 'قص شعر أساسي', en: 'Basic Haircut', basePrice: 80, slug: `bundle-hair-${SUFFIX}` },
    { ar: 'تصفيف بلو دراي', en: 'Blow-dry', basePrice: 60, slug: `bundle-blow-${SUFFIX}` },
    { ar: 'حمام زيت', en: 'Oil treatment', basePrice: 45, slug: `bundle-oil-${SUFFIX}` },
  ];
  for (const d of defs) {
    const svc = await prisma.service.create({
      data: {
        categoryId: cat.id,
        titleJson: { ar: d.ar, en: d.en },
        descriptionJson: { ar: 'x', en: 'x' },
        basePrice: d.basePrice,
        durationMin: 30,
        slug: d.slug,
        sortOrder: 998,
      },
    });
    createdServiceIds.push(svc.id);
    prices.push({ id: svc.id, basePrice: d.basePrice });
  }

  const bundle = await prisma.beautyBundle.create({
    data: {
      titleJson: { ar: 'باقة التجديد', en: 'Refresh Package' },
      descriptionJson: { ar: 'ثلاث خدمات', en: 'Three services' },
      serviceIds: createdServiceIds,
      discountPct: 10,
      originalPrice: 185,
      totalPrice: 166.5,
      sortOrder: 1,
    },
  });
  createdBundleIds.push(bundle.id);
  bundleId = bundle.id;
}, 30000);

afterAll(async () => {
  try {
    await prisma.beautyBundle.deleteMany({ where: { id: { in: createdBundleIds } } });
    await prisma.service.deleteMany({ where: { id: { in: createdServiceIds } } });
    await prisma.category.deleteMany({ where: { id: { in: createdCategoryIds } } });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  } catch {
    // cleanup is best-effort; the DB is re-seeded per run
  }
});

describe('beautyBundles.get', () => {
  it('hydrates serviceIds into full services', async () => {
    const caller = await authCaller(null);
    const bundle = await caller.beautyBundles.get({ id: bundleId });

    expect(bundle.id).toBe(bundleId);
    expect(bundle.titleJson).toEqual({ ar: 'باقة التجديد', en: 'Refresh Package' });
    expect(bundle.discountPct).toBe(10);
    expect(bundle.services).toHaveLength(3);
    for (const svc of bundle.services) {
      expect(Number(svc.basePrice)).toBe(prices.find((p) => p.id === svc.id)?.basePrice);
      expect(svc.titleJson.en).toBeTruthy();
      expect(svc.durationMin).toBe(30);
    }
  });

  it('rejects unknown id', async () => {
    const caller = await authCaller(null);
    await expect(caller.beautyBundles.get({ id: 999_999 })).rejects.toThrow();
  });
});

describe('beautyBundles admin CRUD', () => {
  it('blocks customers from update', async () => {
    const caller = await authCaller(customer);
    await expect(caller.beautyBundles.update({ id: bundleId, discountPct: 20 })).rejects.toThrow();
  });

  it('admin can update a bundle', async () => {
    const caller = await authCaller(ADMIN);
    const updated = await caller.beautyBundles.update({
      id: bundleId,
      discountPct: 15,
      totalPrice: 157.25,
      originalPrice: 185,
    });
    expect(updated.discountPct).toBe(15);
  });

  it('admin delete soft-deletes (isActive=false)', async () => {
    const caller = await authCaller(ADMIN);
    await caller.beautyBundles.delete({ id: bundleId });

    const listed = await caller.beautyBundles.list();
    expect(listed.some((b: { id: number }) => b.id === bundleId)).toBe(false);

    const detail = await caller.beautyBundles.get({ id: bundleId });
    expect(detail.isActive).toBe(false);
  });
});

describe('beautyBundles.quote', () => {
  it('quotes a 3-service custom bundle at 10%', async () => {
    const caller = await authCaller(null);
    const quote = await caller.beautyBundles.quote({
      serviceIds: createdServiceIds,
    });
    expect(quote.originalPrice).toBe(185);
    expect(quote.discountPct).toBe(10);
    expect(quote.totalPrice).toBe(166.5);
    expect(quote.savings).toBe(18.5);
  });

  it('rejects fewer than 3 services', async () => {
    const caller = await authCaller(null);
    await expect(
      caller.beautyBundles.quote({ serviceIds: createdServiceIds.slice(0, 2) }),
    ).rejects.toThrow();
  });

  it('rejects unknown service ids', async () => {
    const caller = await authCaller(null);
    await expect(
      caller.beautyBundles.quote({
        serviceIds: [createdServiceIds[0], createdServiceIds[1], 999_999],
      }),
    ).rejects.toThrow();
  });
});
