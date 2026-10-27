/**
 * C5a — hybrid store-services (H2): vendor-owned bookable services.
 * Covers: service CRUD ownership, the hidden pseudo-technician row
 * (generated non-login User + storeVendorId marker), and isolation —
 * store services never appear in the general browse and pseudo
 * technicians never appear in the technician browse.
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
let otherOwner: JwtPayload;
let serviceId: number;

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

beforeAll(async () => {
  const users = await Promise.all(
    [owner, otherOwner].map(() => prisma.user.create({ data: buildUser() })),
  );
  createdUserIds.push(...users.map((u) => u.id));
  [owner, otherOwner] = users.map((u) => ({ id: u.id, role: 'CUSTOMER', email: u.email }));

  // Two vendors: the service owner and a stranger for the guard tests.
  const slugA = `c5a-${Date.now()}`;
  const slugB = `c5a-b-${Date.now()}`;
  const [vA, vB] = await Promise.all([
    prisma.vendor.create({
      data: { userId: owner.id, storeName: 'Store A c5a', storeSlug: slugA },
    }),
    prisma.vendor.create({
      data: { userId: otherOwner.id, storeName: 'Store B c5a', storeSlug: slugB },
    }),
  ]);
  createdVendorIds.push(vA.id, vB.id);
});

afterAll(async () => {
  // Pseudo technicians + their hidden users ride the vendor/user cleanup
  // (Technician.userId cascades from User; storeVendorId sets NULL).
  await prisma.service.deleteMany({ where: { id: { in: createdServiceIds } } });
  await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

describe('vendorPortal store services (C5a)', () => {
  it('addService creates a store service linked to a hidden pseudo-technician', async () => {
    const c = await caller(owner);
    const created = await c.vendorPortal.addService({
      titleAr: 'قص شعر للسيدات',
      titleEn: 'Women haircut',
      descriptionAr: 'قص وتصفيف',
      basePrice: 120,
      durationMin: 45,
    });

    serviceId = created.id;
    createdServiceIds.push(created.id);

    expect(created.titleAr).toBe('قص شعر للسيدات');
    expect(created.basePrice).toBe(120);
    expect(created.active).toBe(true);

    const row = await prisma.service.findUniqueOrThrow({
      where: { id: created.id },
      include: { vendor: true },
    });
    expect(row.isStoreService).toBe(true);
    expect(row.vendorId).toBe(createdVendorIds[0]);
    expect(row.vendor?.id).toBe(createdVendorIds[0]);

    // One hidden Technician row per store with a generated non-login User.
    const tech = await prisma.technician.findUniqueOrThrow({
      where: { storeVendorId: createdVendorIds[0] },
      include: { user: true },
    });
    expect(tech.city).toBe('RIYADH'); // documented placeholder — stores have no city
    expect(tech.kycStatus).toBe('PENDING');
    expect(tech.user.isActive).toBe(false);
    expect(tech.user.email).toMatch(/^store-tech-\d+@galaxyofbeauty\.sa$/);

    // The service is linked so availability queries can see it.
    const link = await prisma.technicianService.findUniqueOrThrow({
      where: { technicianId_serviceId: { technicianId: tech.id, serviceId: created.id } },
    });
    expect(link.isActive).toBe(true);
  });

  it('provisions the pseudo-technician only once per store', async () => {
    const c = await caller(owner);
    const second = await c.vendorPortal.addService({
      titleAr: 'صبغة شعر',
      basePrice: 200,
      durationMin: 60,
    });
    createdServiceIds.push(second.id);

    const techs = await prisma.technician.findMany({
      where: { storeVendorId: createdVendorIds[0] },
    });
    expect(techs.length).toBe(1);
  });

  it('services list returns only the store’s own services', async () => {
    const c = await caller(owner);
    const mine = await c.vendorPortal.services({});
    expect(mine.total).toBeGreaterThanOrEqual(2);
    expect(mine.items.every((s: { id: number }) => createdServiceIds.includes(s.id))).toBe(true);

    // The stranger's list is empty.
    const other = await caller(otherOwner);
    const theirs = await other.vendorPortal.services({});
    expect(theirs.total).toBe(0);
  });

  it('updateService edits fields; a stranger gets NOT_FOUND', async () => {
    const c = await caller(owner);
    const updated = await c.vendorPortal.updateService({
      id: serviceId,
      basePrice: 150,
      durationMin: 50,
    });
    expect(updated.basePrice).toBe(150);
    expect(updated.durationMin).toBe(50);
    // Untouched fields stay put.
    expect(updated.titleAr).toBe('قص شعر للسيدات');

    const stranger = await caller(otherOwner);
    await expect(
      stranger.vendorPortal.updateService({ id: serviceId, basePrice: 1 }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('deactivateService soft-deletes and unlinks from availability', async () => {
    const c = await caller(owner);
    const res = await c.vendorPortal.deactivateService({ id: serviceId });
    expect(res.isActive).toBe(false);

    const row = await prisma.service.findUniqueOrThrow({ where: { id: serviceId } });
    expect(row.isActive).toBe(false);

    const links = await prisma.technicianService.findMany({ where: { serviceId } });
    expect(links.every((l) => l.isActive === false)).toBe(true);

    // A stranger cannot deactivate it either.
    const stranger = await caller(otherOwner);
    await expect(stranger.vendorPortal.deactivateService({ id: serviceId })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('store services stay out of the general browse and pseudo technicians out of the tech list', async () => {
    const c = await caller(owner);
    const svc = await c.vendorPortal.addService({
      titleAr: 'مكياج عروس',
      basePrice: 300,
      durationMin: 90,
    });
    createdServiceIds.push(svc.id);

    // General browse excludes store services (platform services only).
    const browse = await (await caller(null)).services.list({ page: 1, limit: 100 });
    expect(browse.items.some((s: { id: number }) => s.id === svc.id)).toBe(false);

    // Technician browse excludes the pseudo row (storeVendorId guard).
    const techs = await (await caller(null)).technicians.list({ page: 1, limit: 50 });
    expect(techs.items.every((t: { id: number }) => t.id !== undefined)).toBe(true);
    const pseudoIds = (
      await prisma.technician.findMany({
        where: { storeVendorId: { in: createdVendorIds } },
        select: { id: true },
      })
    ).map((t) => t.id);
    expect(techs.items.some((t: { id: number }) => pseudoIds.includes(t.id))).toBe(false);
  });
});
