/**
 * W2-7 (audit 2026-11-11) — womensServices.book / kidsServices.book pick
 * the first technician by id (no technician↔service mapping), skip the
 * address-ownership guard and have no familyMemberId support. These tests
 * pin the parity contract with the main bookings.create flow.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import crypto from 'crypto';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser, buildCategory, buildService, safeFutureDate } from './factories';
import { WOMENS_SERVICES } from '@galaxy/shared/catalog/womens';

let customerA: JwtPayload;
let customerB: JwtPayload;
let techUserId: number;
let womensServiceId: number;
let kidsServiceId: number;
let addressAId: number;
let addressBId: number;
let memberAId: number;
let memberBId: number;

const createdUserIds: number[] = [];
const createdBookingIds: number[] = [];
const createdTechIds: number[] = [];
const createdTechServiceIds: number[] = [];
const createdServiceIds: number[] = [];
const createdCategoryIds: number[] = [];
const createdMappingIds: number[] = [];
const createdMemberIds: number[] = [];
let categoryId: number;
let addressA: number;
let addressB: number;

const WOMENS_CATEGORY = Object.keys(WOMENS_SERVICES)[0]!;
const WOMENS_FACADE =
  WOMENS_SERVICES[WOMENS_CATEGORY as keyof typeof WOMENS_SERVICES]!.subServices[0]!;

const KIDS_CATEGORY = 'baby';
const KIDS_SERVICE = 'bb1'; // First Haircut

async function caller(user: JwtPayload) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

function womensInput(extra: Record<string, unknown>) {
  const start = safeFutureDate(3);
  return {
    serviceId: WOMENS_FACADE.id,
    category: WOMENS_CATEGORY,
    addressId: addressAId,
    startAt: start.toISOString(),
    endAt: new Date(start.getTime() + 3_600_000).toISOString(),
    idempotencyKey: crypto.randomUUID(),
    ...extra,
  };
}

function kidsInput(extra: Record<string, unknown>) {
  const start = safeFutureDate(4);
  return {
    serviceId: KIDS_SERVICE,
    category: KIDS_CATEGORY,
    childName: 'ليان',
    childAge: 5,
    addressId: addressAId,
    startAt: start.toISOString(),
    endAt: new Date(start.getTime() + 3_600_000).toISOString(),
    idempotencyKey: crypto.randomUUID(),
    ...extra,
  };
}

describe('womensServices.book / kidsServices.book parity (W2-7)', () => {
  beforeAll(async () => {
    const [a, b, techUser] = await Promise.all([
      prisma.user.create({ data: buildUser() }),
      prisma.user.create({ data: buildUser() }),
      prisma.user.create({ data: buildUser({ role: 'TECHNICIAN' }) }),
    ]);
    createdUserIds.push(a.id, b.id, techUser.id);
    customerA = { id: a.id, role: 'CUSTOMER', email: a.email };
    customerB = { id: b.id, role: 'CUSTOMER', email: b.email };
    techUserId = techUser.id;

    const tech = await prisma.technician.create({
      data: { userId: techUser.id, city: 'الرياض' },
    });
    createdTechIds.push(tech.id);

    const cat = await prisma.category.create({ data: buildCategory() });
    categoryId = cat.id;
    createdCategoryIds.push(cat.id);

    // ── Women: resolve through the mapping table (or the seeded one).
    const existingMapping = await prisma.womensServiceMapping.findUnique({
      where: { categoryKey_facadeId: { categoryKey: WOMENS_CATEGORY, facadeId: WOMENS_FACADE.id } },
    });
    if (existingMapping) {
      womensServiceId = existingMapping.serviceId;
    } else {
      const svc = await prisma.service.create({
        data: buildService({ categoryId: cat.id, basePrice: 150, durationMin: 60 }),
      });
      womensServiceId = svc.id;
      createdServiceIds.push(svc.id);
      const mapping = await prisma.womensServiceMapping.create({
        data: { categoryKey: WOMENS_CATEGORY, facadeId: WOMENS_FACADE.id, serviceId: svc.id },
      });
      createdMappingIds.push(mapping.id);
    }

    // ── Kids: exact titleJson.en match on the seeded facade name.
    // Long-lived dev DBs drift (e.g. 'First Haircut Package') — create the
    // exact-name row only when the seed guarantees it (CI-fresh). The
    // fixture goes under the real kids-care category: W2-11 scopes the
    // kidsServices.book lookup to kids-care.
    const kidsService = await prisma.service.findFirst({
      where: { titleJson: { path: ['en'], equals: 'First Haircut' }, isActive: true },
    });
    if (kidsService) {
      kidsServiceId = kidsService.id;
    } else {
      const kidsCat =
        (await prisma.category.findFirst({ where: { slug: 'kids-care' } })) ??
        (await prisma.category.create({ data: buildCategory({ slug: 'kids-care' }) }));
      if (kidsCat.id !== categoryId) createdCategoryIds.push(kidsCat.id);
      const fixture = await prisma.service.create({
        data: buildService({
          categoryId: kidsCat.id,
          basePrice: 80,
          durationMin: 15,
          titleJson: { ar: 'قص شعر أول مرة', en: 'First Haircut' },
        }),
      });
      kidsServiceId = fixture.id;
      createdServiceIds.push(fixture.id);
    }

    // ── Technician mappings for both resolved services.
    for (const serviceId of new Set([womensServiceId, kidsServiceId])) {
      const row = await prisma.technicianService.create({
        data: { technicianId: tech.id, serviceId, isActive: true },
      });
      createdTechServiceIds.push(row.id);
    }

    // ── Addresses + family members.
    const [addrA, addrB, memberA, memberB] = await Promise.all([
      prisma.address.create({
        data: { userId: a.id, label: 'المنزل', city: 'الرياض', area: 'الملز', street: 'شارع أ' },
      }),
      prisma.address.create({
        data: { userId: b.id, label: 'العمل', city: 'الرياض', area: 'العليا', street: 'شارع ب' },
      }),
      prisma.familyMember.create({
        data: {
          userId: a.id,
          name: 'ليان',
          relationship: 'child',
          ageGroup: 'child',
          preferences: [],
        },
      }),
      prisma.familyMember.create({
        data: {
          userId: b.id,
          name: 'ريم',
          relationship: 'child',
          ageGroup: 'child',
          preferences: [],
        },
      }),
    ]);
    addressAId = addrA.id;
    addressA = addrA.id;
    addressBId = addrB.id;
    addressB = addrB.id;
    memberAId = memberA.id;
    memberBId = memberB.id;
    createdMemberIds.push(memberA.id, memberB.id);
  }, 40_000);

  afterAll(async () => {
    try {
      await prisma.booking.deleteMany({ where: { id: { in: createdBookingIds } } });
    } catch {}
    try {
      await prisma.familyMember.deleteMany({ where: { id: { in: createdMemberIds } } });
    } catch {}
    try {
      await prisma.address.deleteMany({ where: { id: { in: [addressA, addressB] } } });
    } catch {}
    try {
      await prisma.womensServiceMapping.deleteMany({ where: { id: { in: createdMappingIds } } });
    } catch {}
    try {
      await prisma.technicianService.deleteMany({ where: { id: { in: createdTechServiceIds } } });
    } catch {}
    try {
      await prisma.service.deleteMany({ where: { id: { in: createdServiceIds } } });
    } catch {}
    try {
      await prisma.category.deleteMany({ where: { id: categoryId } });
    } catch {}
    try {
      await prisma.technician.deleteMany({ where: { id: { in: createdTechIds } } });
    } catch {}
    try {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    } catch {}
  });

  it('womens book assigns a technician mapped to the resolved service', async () => {
    const res = await (await caller(customerA)).womensServices.book(womensInput({}));
    expect(res.booked).toBe(true);
    createdBookingIds.push(res.bookingId);

    const booking = await prisma.booking.findUniqueOrThrow({ where: { id: res.bookingId } });
    expect(booking.serviceId).toBe(womensServiceId);
    const mapping = await prisma.technicianService.findFirst({
      where: { technician: { userId: booking.technicianId }, serviceId: booking.serviceId },
    });
    expect(mapping).toBeTruthy();
  });

  it('kids book assigns a technician mapped to the resolved service', async () => {
    const res = await (await caller(customerA)).kidsServices.book(kidsInput({}));
    expect(res.booked).toBe(true);
    createdBookingIds.push(res.bookingId);

    const booking = await prisma.booking.findUniqueOrThrow({ where: { id: res.bookingId } });
    expect(booking.serviceId).toBe(kidsServiceId);
    const mapping = await prisma.technicianService.findFirst({
      where: { technician: { userId: booking.technicianId }, serviceId: booking.serviceId },
    });
    expect(mapping).toBeTruthy();
  });

  it('rejects another customer’s address (womens)', async () => {
    await expect(
      (await caller(customerA)).womensServices.book(
        womensInput({ addressId: addressBId, idempotencyKey: crypto.randomUUID() }),
      ),
    ).rejects.toThrow(/belongs|آخر|ملك/);
  });

  it('rejects another customer’s address (kids)', async () => {
    await expect(
      (await caller(customerA)).kidsServices.book(
        kidsInput({ addressId: addressBId, idempotencyKey: crypto.randomUUID() }),
      ),
    ).rejects.toThrow(/belongs|آخر|ملك/);
  });

  it('rejects another customer’s family member (womens)', async () => {
    await expect(
      (await caller(customerA)).womensServices.book(
        womensInput({ familyMemberId: memberBId, idempotencyKey: crypto.randomUUID() }),
      ),
    ).rejects.toThrow(/belongs|آخر|ملك/);
  });

  it('stores an owned family member on the booking (kids)', async () => {
    const res = await (
      await caller(customerA)
    ).kidsServices.book(kidsInput({ familyMemberId: memberAId }));
    expect(res.booked).toBe(true);
    createdBookingIds.push(res.bookingId);
    const booking = await prisma.booking.findUniqueOrThrow({ where: { id: res.bookingId } });
    expect(booking.familyMemberId).toBe(memberAId);
  });
});
