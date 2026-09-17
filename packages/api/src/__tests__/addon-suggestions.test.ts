/**
 * ENHANCEMENT_PLAN 1.3 — Service Add-Ons Marketplace (AO-1).
 *
 * Drives: the ServiceAddon join table's popularity/suggested/bundle-
 * discount fields, getById's addon ordering, and the admin link inputs.
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
const createdCategoryIds: number[] = [];
const createdBookingIds: number[] = [];
const createdUserIds: number[] = [];
let customer: JwtPayload;
let techUserId = 0;
let addressId = 0;

beforeAll(async () => {
  const [cat, address, tech, user] = await Promise.all([
    prisma.category.create({
      data: {
        nameJson: { ar: `تصنيف إضافات ${SUFFIX}`, en: `Addon category ${SUFFIX}` },
        slug: `addon-cat-${SUFFIX}`,
      },
    }),
    prisma.address.findFirst({ select: { id: true } }),
    prisma.technician.findFirst({ select: { userId: true } }),
    prisma.user.create({ data: buildUser() }),
  ]);
  createdCategoryIds.push(cat.id);
  createdUserIds.push(user.id);
  addressId = address?.id ?? 1;
  techUserId = tech?.userId ?? 1;
  customer = { id: user.id, role: 'CUSTOMER', email: user.email };

  const main = await prisma.service.create({
    data: {
      categoryId: cat.id,
      titleJson: { ar: 'قص شعر أساسي', en: 'Basic Haircut' },
      descriptionJson: { ar: 'x', en: 'x' },
      basePrice: 80,
      durationMin: 40,
      slug: `addon-main-${SUFFIX}`,
      sortOrder: 998,
    },
  });
  createdServiceIds.push(main.id);

  const addonA = await prisma.service.create({
    data: {
      categoryId: cat.id,
      titleJson: { ar: 'تصفيف بلو دراي', en: 'Blow-dry' },
      descriptionJson: { ar: 'x', en: 'x' },
      basePrice: 60,
      durationMin: 30,
      slug: `addon-blowdry-${SUFFIX}`,
      sortOrder: 998,
    },
  });
  createdServiceIds.push(addonA.id);

  const addonB = await prisma.service.create({
    data: {
      categoryId: cat.id,
      titleJson: { ar: 'حمام زيت', en: 'Oil treatment' },
      descriptionJson: { ar: 'x', en: 'x' },
      basePrice: 45,
      durationMin: 20,
      slug: `addon-oil-${SUFFIX}`,
      sortOrder: 998,
    },
  });
  createdServiceIds.push(addonB.id);

  // Unlinked — used by the admin link/unlink test.
  const addonC = await prisma.service.create({
    data: {
      categoryId: cat.id,
      titleJson: { ar: 'ماسك شعر', en: 'Hair mask' },
      descriptionJson: { ar: 'x', en: 'x' },
      basePrice: 55,
      durationMin: 25,
      slug: `addon-mask-${SUFFIX}`,
      sortOrder: 998,
    },
  });
  createdServiceIds.push(addonC.id);

  // Link both; blow-dry is the suggested popular one.
  await prisma.serviceAddon.createMany({
    data: [
      {
        serviceId: main.id,
        addonId: addonA.id,
        popularityScore: 95,
        isSuggested: true,
        bundleDiscountPercent: 15,
      },
      { serviceId: main.id, addonId: addonB.id, popularityScore: 40 },
    ],
  });
}, 30000);

afterAll(async () => {
  try {
    await prisma.booking.deleteMany({ where: { id: { in: createdBookingIds } } });
  } catch {}
  try {
    await prisma.serviceAddon.deleteMany({ where: { serviceId: { in: createdServiceIds } } });
  } catch {}
  try {
    await prisma.service.deleteMany({ where: { id: { in: createdServiceIds } } });
  } catch {}
  try {
    await prisma.category.deleteMany({ where: { id: { in: createdCategoryIds } } });
  } catch {}
  try {
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  } catch {}
});

describe('service add-ons catalog (1.3 AO-1)', () => {
  it('getById returns addons ordered by popularity with discount + suggested flags', async () => {
    const anon = await authCaller(null);
    const svc = await anon.services.getById({ id: createdServiceIds[0] });

    const addons = svc.servicesWithAddon ?? [];
    expect(addons.length).toBeGreaterThanOrEqual(2);
    expect(addons[0].popularityScore).toBeGreaterThan(addons[1].popularityScore);
    expect(addons[0].isSuggested).toBe(true);
    expect(addons[0].bundleDiscountPercent).toBe(15);
    expect(addons[0].addon.titleJson).toBeDefined();
  });

  it('admin addAddon accepts popularity/suggested/discount and removeAddon unlinks', async () => {
    const admin = await authCaller(ADMIN);
    const link = await admin.services.addAddon({
      serviceId: createdServiceIds[0],
      addonId: createdServiceIds[3],
      popularityScore: 70,
      isSuggested: false,
      bundleDiscountPercent: 10,
    });
    expect(link.popularityScore).toBe(70);
    expect(link.bundleDiscountPercent).toBe(10);

    const svc = await (await authCaller(null)).services.getById({ id: createdServiceIds[0] });
    const linked = svc.servicesWithAddon.find((a: any) => a.addonId === createdServiceIds[3]);
    expect(linked).toBeDefined();

    await admin.services.removeAddon({
      serviceId: createdServiceIds[0],
      addonId: createdServiceIds[3],
    });
    const after = await (await authCaller(null)).services.getById({ id: createdServiceIds[0] });
    expect(after.servicesWithAddon.some((a: any) => a.addonId === createdServiceIds[3])).toBe(
      false,
    );
  });

  it('rejects duplicate addon links', async () => {
    const admin = await authCaller(ADMIN);
    await expect(
      admin.services.addAddon({
        serviceId: createdServiceIds[0],
        addonId: createdServiceIds[1],
      }),
    ).rejects.toThrow(/already linked/);
  });

  it('rejects non-admin linkers', async () => {
    const anon = await authCaller(null);
    await expect(
      anon.services.addAddon({ serviceId: createdServiceIds[0], addonId: createdServiceIds[3] }),
    ).rejects.toThrow();
  });
});

describe('bookings.create add-ons (1.3 AO-2)', () => {
  it('prices addons with the bundle discount and stores addonsJson', async () => {
    const c = await authCaller(customer);
    const booking = await c.bookings.create({
      technicianId: techUserId,
      serviceId: createdServiceIds[0], // main 80 SAR
      addonIds: [createdServiceIds[1]], // blow-dry 60 SAR, 15% bundle discount
      addressId,
      startAt: new Date(Date.now() + 3 * 86_400_000).toISOString(),
      endAt: new Date(Date.now() + 3 * 86_400_000 + 3_600_000).toISOString(),
      idempotencyKey: `ao-bk-${Date.now()}`,
    });
    createdBookingIds.push(booking.id);

    // 80 + 60 × 0.85 = 131
    expect(Number(booking.totalAmount)).toBe(131);
    expect(booking.addonsJson).toMatchObject([
      { id: createdServiceIds[1], price: 51, titleJson: { ar: 'تصفيف بلو دراي' } },
    ]);
  });

  it('rejects an addon not linked to the service', async () => {
    const c = await authCaller(customer);
    await expect(
      c.bookings.create({
        technicianId: techUserId,
        serviceId: createdServiceIds[0],
        addonIds: [createdServiceIds[3]], // hair mask — never linked
        addressId,
        startAt: new Date(Date.now() + 4 * 86_400_000).toISOString(),
        endAt: new Date(Date.now() + 4 * 86_400_000 + 3_600_000).toISOString(),
        idempotencyKey: `ao-bk-${Date.now()}-2`,
      }),
    ).rejects.toThrow(/not linked|addon/i);
  });
});
