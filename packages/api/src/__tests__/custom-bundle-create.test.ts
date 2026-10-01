/**
 * Audit stage 12 — mobile custom-bundle wizard. The web wizard tiers
 * (2=10%, 3=15%, 4=20%, 5=25%) had no persistence path, so the CTA was
 * a dead link. createCustom persists the selection as a BeautyBundle +
 * bundle_services rows with SERVER-computed prices (money integrity:
 * the client never supplies price math), and booking create picks it up
 * via ?beautyBundleId=.
 */
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { buildUser } from './factories';
import type { JwtPayload } from '../lib/jwt';

const SUFFIX = Date.now();
const createdServiceIds: number[] = [];
const createdBundleIds: number[] = [];
const createdCategoryIds: number[] = [];
const createdUserIds: number[] = [];
let customer: JwtPayload;

async function authCaller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

beforeAll(async () => {
  const [cat, user] = await Promise.all([
    prisma.category.create({
      data: {
        nameJson: { ar: `تصنيف باقة مخصصة ${SUFFIX}`, en: `Custom bundle cat ${SUFFIX}` },
        slug: `custom-cat-${SUFFIX}`,
      },
    }),
    prisma.user.create({ data: buildUser() }),
  ]);
  createdCategoryIds.push(cat.id);
  createdUserIds.push(user.id);
  customer = { id: user.id, role: 'CUSTOMER', email: user.email };

  const defs = [
    { ar: 'أ', en: 'A', basePrice: 100, slug: `custom-a-${SUFFIX}` },
    { ar: 'ب', en: 'B', basePrice: 50, slug: `custom-b-${SUFFIX}` },
    { ar: 'ج', en: 'C', basePrice: 40, slug: `custom-c-${SUFFIX}` },
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
  }
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

describe('beautyBundles.createCustom — mobile wizard (stage 12)', () => {
  it('persists a 3-service bundle at 15% with server-computed prices', async () => {
    const caller = await authCaller(customer);
    const result = await caller.beautyBundles.createCustom({
      serviceIds: [...createdServiceIds],
    });
    createdBundleIds.push(result.bundleId as number);

    expect(result.quote.originalPrice).toBe(190);
    expect(result.quote.discountPct).toBe(15);
    expect(result.quote.totalPrice).toBe(161.5);
    expect(result.quote.savings).toBe(28.5);

    const bundle = await prisma.beautyBundle.findUnique({
      where: { id: result.bundleId as number },
      include: { services: { orderBy: { sortOrder: 'asc' } } },
    });
    expect(bundle).not.toBeNull();
    expect(bundle!.discountPct).toBe(15);
    expect(Number(bundle!.originalPrice)).toBe(190);
    expect(Number(bundle!.totalPrice)).toBe(161.5);
    expect(bundle!.services.map((s) => s.serviceId)).toEqual(createdServiceIds);
  });

  it('rejects fewer than 2 services', async () => {
    const caller = await authCaller(customer);
    await expect(
      caller.beautyBundles.createCustom({ serviceIds: [createdServiceIds[0]] }),
    ).rejects.toThrow();
  });

  it('rejects more than 5 services', async () => {
    const caller = await authCaller(customer);
    await expect(
      caller.beautyBundles.createCustom({
        serviceIds: [...createdServiceIds, ...createdServiceIds, ...createdServiceIds].slice(0, 6),
      }),
    ).rejects.toThrow();
  });

  it('rejects duplicate service ids', async () => {
    const caller = await authCaller(customer);
    await expect(
      caller.beautyBundles.createCustom({
        serviceIds: [createdServiceIds[0], createdServiceIds[0]],
      }),
    ).rejects.toThrow();
  });

  it('rejects unknown service ids', async () => {
    const caller = await authCaller(customer);
    await expect(
      caller.beautyBundles.createCustom({
        serviceIds: [createdServiceIds[0], 999_999],
      }),
    ).rejects.toThrow();
  });

  it('rejects anonymous callers', async () => {
    const caller = await authCaller(null);
    await expect(
      caller.beautyBundles.createCustom({ serviceIds: [...createdServiceIds] }),
    ).rejects.toThrow();
  });
});
