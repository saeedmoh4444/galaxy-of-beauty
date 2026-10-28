/**
 * C5d — storefront data for the Services tab: vendorDetail exposes the
 * store's ACTIVE services (deactivated ones stay hidden) and the service
 * detail resolves the store's pseudo provider for the booking create page.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];
const createdServiceIds: number[] = [];

let owner: JwtPayload;
let slug: string;
let serviceId: number;

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

beforeAll(async () => {
  const users = await Promise.all([owner].map(() => prisma.user.create({ data: buildUser() })));
  createdUserIds.push(...users.map((u) => u.id));
  [owner] = users.map((u) => ({ id: u.id, role: 'CUSTOMER', email: u.email }));

  slug = `c5d-${Date.now()}`;
  const vendor = await prisma.vendor.create({
    data: { userId: owner.id, storeName: 'Store c5d', storeSlug: slug, isVerified: true },
  });
  createdVendorIds.push(vendor.id);
});

afterAll(async () => {
  await prisma.service.deleteMany({ where: { id: { in: createdServiceIds } } });
  await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

describe('storefront services data (C5d)', () => {
  it('vendorDetail exposes the active store services only', async () => {
    const oc = await caller(owner);
    const svc = await oc.vendorPortal.addService({
      titleAr: 'قص شعر',
      titleEn: 'Haircut',
      basePrice: 90,
      durationMin: 40,
    });
    serviceId = svc.id;
    createdServiceIds.push(svc.id);

    const detail = await (await caller(null)).marketplace.vendorDetail({ slug });
    const services = (detail.services ?? []) as Array<{ id: number; titleJson: unknown }>;
    expect(services.some((s) => s.id === svc.id)).toBe(true);

    // Deactivate → gone from the public detail.
    await oc.vendorPortal.deactivateService({ id: svc.id });
    const after = await (await caller(null)).marketplace.vendorDetail({ slug });
    const afterServices = (after.services ?? []) as Array<{ id: number }>;
    expect(afterServices.some((s) => s.id === svc.id)).toBe(false);
  });

  it('service detail resolves the store pseudo provider for the booking flow', async () => {
    const oc = await caller(owner);
    const svc = await oc.vendorPortal.addService({
      titleAr: 'مكياج',
      basePrice: 150,
      durationMin: 60,
    });
    createdServiceIds.push(svc.id);

    const detail = await (await caller(null)).services.getById({ id: svc.id });
    const links = (detail.technicianServices ?? []) as Array<{
      technician?: { user?: { id?: number } };
    }>;
    // Exactly one provider: the store's pseudo-technician (the booking
    // create page auto-assigns the first — techs[0].technician.userId).
    expect(links.length).toBe(1);
    const pseudoUser = await prisma.technician.findUniqueOrThrow({
      where: { storeVendorId: createdVendorIds[0] },
      select: { userId: true },
    });
    expect(links[0]?.technician?.user?.id).toBe(pseudoUser.userId);
  });
});
