/**
 * W2-6 (audit 2026-11-11) — flash-deal price never applied to booking
 * totals. bookings.create must accept an optional dealId: validate the
 * deal (active window, same service, claimed by this customer) and price
 * the booking at dealPrice instead of the service base price.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser, buildCategory, buildService, safeFutureDate } from './factories';

let customer: JwtPayload;
let techUserId: number;
let serviceId: number;
let otherServiceId: number;
let addressId: number;

let dealActiveId: number;
let dealExpiredId: number;
let dealOtherServiceId: number;
let dealUnclaimedId: number;
let addonServiceId: number;

const createdUserIds: number[] = [];
const createdBookingIds: number[] = [];
const createdDealIds: number[] = [];
const createdClaimIds: number[] = [];
const createdServiceIds: number[] = [];
const createdCategoryIds: number[] = [];
const createdTechIds: number[] = [];
const createdTechServiceIds: number[] = [];
const createdAddonLinkIds: number[] = [];
let categoryId: number;
let addressRowId: number;

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

async function makeDeal(opts: { serviceId: number; dealPrice: number; active: boolean }) {
  const now = new Date();
  const deal = await prisma.flashDeal.create({
    data: {
      serviceId: opts.serviceId,
      discountPercent: 40,
      originalPrice: 200,
      dealPrice: opts.dealPrice,
      discountValue: 80,
      maxRedemptions: 5,
      currentRedemptions: 0,
      startsAt: opts.active
        ? new Date(now.getTime() - 3_600_000)
        : new Date(now.getTime() - 72 * 3_600_000),
      endsAt: opts.active
        ? new Date(now.getTime() + 24 * 3_600_000)
        : new Date(now.getTime() - 3_600_000),
      isActive: true,
    },
  });
  createdDealIds.push(deal.id);
  return deal;
}

function createInput(extra: Record<string, unknown>) {
  const start = safeFutureDate(3);
  return {
    serviceId,
    technicianId: techUserId,
    addressId,
    startAt: start.toISOString(),
    endAt: new Date(start.getTime() + 3_600_000).toISOString(),
    idempotencyKey: `fl-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    ...extra,
  };
}

describe('bookings.create × flash deals (W2-6)', () => {
  beforeAll(async () => {
    const u1 = await prisma.user.create({ data: buildUser() });
    customer = { id: u1.id, role: 'CUSTOMER', email: u1.email };
    const techUser = await prisma.user.create({ data: buildUser({ role: 'TECHNICIAN' }) });
    createdUserIds.push(u1.id, techUser.id);
    techUserId = techUser.id;

    const tech = await prisma.technician.create({
      data: { userId: techUser.id, city: 'الرياض' },
    });
    createdTechIds.push(tech.id);

    const cat = await prisma.category.create({ data: buildCategory() });
    categoryId = cat.id;
    createdCategoryIds.push(cat.id);

    const svc = await prisma.service.create({
      data: buildService({ categoryId: cat.id, basePrice: 200, durationMin: 60 }),
    });
    serviceId = svc.id;
    createdServiceIds.push(svc.id);

    const other = await prisma.service.create({
      data: buildService({ categoryId: cat.id, basePrice: 300, durationMin: 60 }),
    });
    otherServiceId = other.id;
    createdServiceIds.push(other.id);

    // Technician↔service mapping (W2-5 guard reads it).
    const map = await prisma.technicianService.create({
      data: { technicianId: tech.id, serviceId: svc.id },
    });
    createdTechServiceIds.push(map.id);

    const addr = await prisma.address.create({
      data: { userId: u1.id, label: 'المنزل', city: 'الرياض', area: 'الملز', street: 'طريق الملك' },
    });
    addressId = addr.id;
    addressRowId = addr.id;

    // Deals: active/expired/other-service/unclaimed.
    const active = await makeDeal({ serviceId: svc.id, dealPrice: 120, active: true });
    dealActiveId = active.id;
    const expired = await makeDeal({ serviceId: svc.id, dealPrice: 100, active: false });
    dealExpiredId = expired.id;
    const otherDeal = await makeDeal({ serviceId: other.id, dealPrice: 180, active: true });
    dealOtherServiceId = otherDeal.id;
    const unclaimed = await makeDeal({ serviceId: svc.id, dealPrice: 90, active: true });
    dealUnclaimedId = unclaimed.id;

    // Customer claimed active/expired/other-service deals (not unclaimed).
    for (const dealId of [dealActiveId, dealExpiredId, dealOtherServiceId]) {
      const claim = await prisma.flashDealClaim.create({
        data: { dealId, userId: u1.id },
      });
      createdClaimIds.push(claim.id);
    }

    // Add-on linked to the main service, priced at 50 × 0.9 = 45.
    const addon = await prisma.service.create({
      data: buildService({ categoryId: cat.id, basePrice: 50, durationMin: 30 }),
    });
    addonServiceId = addon.id;
    createdServiceIds.push(addon.id);
    const link = await prisma.serviceAddon.create({
      data: { serviceId: svc.id, addonId: addon.id, bundleDiscountPercent: 10, isActive: true },
    });
    createdAddonLinkIds.push(link.id);
  }, 30_000);

  afterAll(async () => {
    try {
      await prisma.booking.deleteMany({ where: { id: { in: createdBookingIds } } });
    } catch {}
    try {
      await prisma.flashDealClaim.deleteMany({ where: { id: { in: createdClaimIds } } });
    } catch {}
    try {
      await prisma.flashDeal.deleteMany({ where: { id: { in: createdDealIds } } });
    } catch {}
    try {
      await prisma.serviceAddon.deleteMany({ where: { id: { in: createdAddonLinkIds } } });
    } catch {}
    try {
      await prisma.technicianService.deleteMany({ where: { id: { in: createdTechServiceIds } } });
    } catch {}
    try {
      await prisma.service.deleteMany({ where: { id: { in: createdServiceIds } } });
    } catch {}
    try {
      await prisma.address.deleteMany({ where: { id: addressRowId } });
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

  it('prices the booking at dealPrice when the customer claims an active deal', async () => {
    const booking = await (
      await caller(customer)
    ).bookings.create(createInput({ dealId: dealActiveId }));
    createdBookingIds.push(booking.id);
    expect(Number(booking.totalAmount)).toBe(120);

    const row = await prisma.booking.findUniqueOrThrow({ where: { id: booking.id } });
    expect(Number(row.totalAmount)).toBe(120);
    const breakdown = row.pricingBreakdown as { type?: string; dealPrice?: number } | null;
    expect(breakdown?.type).toBe('flash_deal');
    expect(breakdown?.dealPrice).toBe(120);
  });

  it('rejects a deal the customer never claimed', async () => {
    await expect(
      (await caller(customer)).bookings.create(createInput({ dealId: dealUnclaimedId })),
    ).rejects.toThrow(/claim|العرض/);
  });

  it('rejects an expired deal', async () => {
    await expect(
      (await caller(customer)).bookings.create(createInput({ dealId: dealExpiredId })),
    ).rejects.toThrow(/العرض|deal/i);
  });

  it('rejects a deal for a different service than the one being booked', async () => {
    await expect(
      (await caller(customer)).bookings.create(createInput({ dealId: dealOtherServiceId })),
    ).rejects.toThrow(/Service|خدمة/);
  });

  it('adds add-ons on top of the deal price', async () => {
    const booking = await (
      await caller(customer)
    ).bookings.create(createInput({ dealId: dealActiveId, addonIds: [addonServiceId] }));
    createdBookingIds.push(booking.id);
    // 120 (deal) + 45 (addon at 10% bundle discount) = 165
    expect(Number(booking.totalAmount)).toBe(165);
  });
});
