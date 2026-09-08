/**
 * E5 — barberettes ride the technician engine (catalog + VERIFIED badge,
 * zero new infrastructure), and at-home salons: homeService requests get
 * assigned to verified ATHOME providers covering the city.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

let customer: JwtPayload;
let athomeOwner: JwtPayload;
const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];
const createdTechIds: number[] = [];

async function caller(u: JwtPayload | null) {
  return (appRouter as any).createCaller({ user: u, ip: '127.0.0.1' });
}

describe('barberettes + at-home salon assignment (E5)', () => {
  beforeAll(async () => {
    const c = await prisma.user.create({ data: buildUser() });
    const o = await prisma.user.create({ data: buildUser() });
    const techUser = await prisma.user.create({ data: buildUser() });
    customer = { id: c.id, role: 'CUSTOMER', email: c.email };
    athomeOwner = { id: o.id, role: 'CUSTOMER', email: o.email };
    createdUserIds.push(c.id, o.id, techUser.id);

    // Verified barberette technician with a barberette-category service.
    const category = await prisma.category.findFirstOrThrow({ where: { slug: 'barberette' } });
    const service = await prisma.service.findFirstOrThrow({
      where: { categoryId: category.id },
    });
    const tech = await prisma.technician.create({
      data: {
        userId: techUser.id,
        city: 'الرياض',
        kycStatus: 'VERIFIED',
        bioJson: { ar: 'باربيريت محترفة', en: 'Professional barberette' },
      },
    });
    createdTechIds.push(tech.id);
    await prisma.technicianService.create({
      data: { technicianId: tech.id, serviceId: service.id, isActive: true },
    });

    // Verified ATHOME provider covering Riyadh.
    const vendor = await prisma.vendor.create({
      data: {
        userId: o.id,
        storeName: 'صالون منزلي الرياض',
        storeSlug: 'athome-riyadh-e5',
        type: 'ATHOME',
        homeCity: 'الرياض',
        homeAddress: 'تغطية شمال الرياض',
        isVerified: true,
      },
    });
    createdVendorIds.push(vendor.id);
  }, 15000);

  afterAll(async () => {
    try {
      await prisma.homeServiceRequest.deleteMany({ where: { userId: { in: createdUserIds } } });
    } catch {}
    try {
      await prisma.technicianService.deleteMany({
        where: { technicianId: { in: createdTechIds } },
      });
    } catch {}
    try {
      await prisma.technician.deleteMany({ where: { id: { in: createdTechIds } } });
    } catch {}
    try {
      await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
    } catch {}
    try {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    } catch {}
  });

  it('technicians.barberettes returns verified techs with barberette services only', async () => {
    const c = await caller(customer);
    const barberettes = await c.technicians.barberettes();
    expect(barberettes.some((t: any) => t.id === createdTechIds[0])).toBe(true);
    expect(barberettes.every((t: any) => t.kycStatus === 'VERIFIED')).toBe(true);
  });

  it('homeService.request assigns a verified ATHOME provider in the city', async () => {
    const c = await caller(customer);
    const service = await prisma.service.findFirstOrThrow({ where: { slug: 'clean-fade' } });
    const req = await c.homeService.request({
      serviceId: service.id,
      city: 'الرياض',
      address: 'حي النرجس — فيلا ١٢',
      preferredDate: '2026-09-20',
      preferredTime: 'مساء',
    });

    expect(req.assigned).toBe(true);
    expect(req.vendorId).toBe(createdVendorIds[0]);

    const stored = await prisma.homeServiceRequest.findFirstOrThrow({
      where: { id: Number(String(req.requestId).replace('HOME-', '')) },
    });
    expect(stored.vendorId).toBe(createdVendorIds[0]);
    expect(stored.assignedAt).toBeTruthy();
  });

  it('requests stay unassigned when no ATHOME provider covers the city', async () => {
    const c = await caller(customer);
    const service = await prisma.service.findFirstOrThrow({ where: { slug: 'clean-fade' } });
    const req = await c.homeService.request({
      serviceId: service.id,
      city: 'الدمام',
      address: 'حي الشاطئ — برج ٥',
      preferredDate: '2026-09-21',
      preferredTime: 'صباحاً',
    });

    expect(req.assigned).toBe(false);
    expect(req.vendorId).toBeUndefined();
  });

  it('the ATHOME provider sees only their assigned requests and can complete them', async () => {
    const c = await caller(athomeOwner);
    const mine = await c.vendorPortal['homeRequests.list']();
    expect(mine.length).toBe(1);
    expect(mine[0].city).toBe('الرياض');
    expect(mine[0].status).toBe('PENDING');

    const done = await c.vendorPortal['homeRequests.complete']({ requestId: mine[0].id });
    expect(done.status).toBe('COMPLETED');

    const customerC = await caller(customer);
    const others = await customerC.vendorPortal['homeRequests.list']();
    // The customer owns no ATHOME vendor → empty (or rejected).
    expect(Array.isArray(others) ? others.length : 0).toBe(0);
  });
});
