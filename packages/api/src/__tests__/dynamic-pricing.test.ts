/**
 * ENHANCEMENT_PLAN 1.1 — Dynamic Service Pricing.
 *
 * Drives: the pricing engine (tier × peak-rule × surge multipliers, opt-in
 * per service via dynamicPricingEnabled) and its integration in
 * bookings.create — including the pricingBreakdown stored on the booking.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';
import { generateCsrfToken } from '../lib/csrf';
import { buildUser } from './factories';
import { computeDynamicPrice, ruleMatches } from '../lib/pricing';
import type { JwtPayload } from '../lib/jwt';

const CSRF = generateCsrfToken();

async function authCaller(user: JwtPayload) {
  const ctx = await createTRPCContext({ user, csrfCookie: CSRF, csrfHeader: CSRF });
  return (appRouter as any).createCaller(ctx);
}

const SUFFIX = Date.now();
let customer: JwtPayload;
let techUserId: number;
let techProfileId: number;
let addressId: number;
let catId: number;
let enabledServiceId: number;
let disabledServiceId: number;
const bookingIds: number[] = [];
const ruleIds: number[] = [];
const slotIds: number[] = [];
const createdUserIds: number[] = [];
const createdServiceIds: number[] = [];

/** The next Sunday at 10:00 local — always outside the seeded
 *  Thu/Fri/Sat 16-22 peak window, so seeded rules never match tests. */
function nextSundayMorning(): Date {
  const d = new Date();
  d.setDate(d.getDate() + ((7 - d.getDay()) % 7 || 7));
  d.setHours(10, 0, 0, 0);
  return d;
}

beforeAll(async () => {
  const [cat, address] = await Promise.all([
    prisma.category.findFirst({ select: { id: true } }),
    prisma.address.findFirst({ select: { id: true } }),
  ]);
  catId = cat?.id ?? 1;
  addressId = address?.id ?? 1;

  const techUser = await prisma.user.create({ data: buildUser({ role: 'TECHNICIAN' }) });
  createdUserIds.push(techUser.id);
  techUserId = techUser.id;
  const tech = await prisma.technician.create({
    data: {
      userId: techUser.id,
      city: 'الرياض',
      kycStatus: 'VERIFIED',
      tier: 'PREMIUM',
    },
  });
  techProfileId = tech.id;

  const [enabled, disabled] = await Promise.all([
    prisma.service.create({
      data: {
        categoryId: catId,
        titleJson: { ar: `خدمة ديناميكية ${SUFFIX}`, en: `Dynamic Service ${SUFFIX}` },
        descriptionJson: { ar: 'x', en: 'x' },
        basePrice: 100,
        durationMin: 60,
        slug: `dp-enabled-${SUFFIX}`,
        sortOrder: 999,
        dynamicPricingEnabled: true,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: catId,
        titleJson: { ar: `خدمة ثابتة ${SUFFIX}`, en: `Static Service ${SUFFIX}` },
        descriptionJson: { ar: 'x', en: 'x' },
        basePrice: 100,
        durationMin: 60,
        slug: `dp-disabled-${SUFFIX}`,
        sortOrder: 999,
      },
    }),
  ]);
  enabledServiceId = enabled.id;
  disabledServiceId = disabled.id;
  createdServiceIds.push(enabled.id, disabled.id);

  const user = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(user.id);
  customer = { id: user.id, role: 'CUSTOMER', email: user.email };
}, 30000);

afterAll(async () => {
  try {
    await prisma.booking.deleteMany({ where: { id: { in: bookingIds } } });
  } catch {}
  try {
    await prisma.availabilitySlot.deleteMany({ where: { id: { in: slotIds } } });
  } catch {}
  try {
    await prisma.servicePricing.deleteMany({ where: { id: { in: ruleIds } } });
  } catch {}
  try {
    await prisma.service.deleteMany({ where: { id: { in: createdServiceIds } } });
  } catch {}
  try {
    await prisma.technician.deleteMany({ where: { userId: { in: createdUserIds } } });
  } catch {}
  try {
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  } catch {}
});

describe('dynamic pricing engine (1.1)', () => {
  it('applies the technician tier multiplier', () => {
    const breakdown = computeDynamicPrice({
      base: 100,
      tier: 'PREMIUM',
      serviceId: enabledServiceId,
      categoryId: catId,
      rules: [],
      date: nextSundayMorning(),
      surgeRatio: 0,
    });
    expect(breakdown.tierMultiplier).toBe(1.5);
    expect(breakdown.total).toBe(150);
  });

  it('defaults unknown tiers to 1.0', () => {
    const breakdown = computeDynamicPrice({
      base: 100,
      tier: 'SUPERSTAR',
      serviceId: enabledServiceId,
      categoryId: catId,
      rules: [],
      date: nextSundayMorning(),
      surgeRatio: 0,
    });
    expect(breakdown.tierMultiplier).toBe(1);
    expect(breakdown.total).toBe(100);
  });

  it('ruleMatches scopes by service, tier, day and hour', () => {
    const base = {
      isActive: true,
      categoryId: null,
      serviceId: null,
      technicianTier: null,
      dayOfWeek: null,
      hourStart: null,
      hourEnd: null,
      priceMultiplier: 1.3,
    };
    const date = nextSundayMorning(); // Sunday, 10:00 local
    const ctx = { serviceId: enabledServiceId, categoryId: catId, tier: 'PREMIUM', date };

    expect(ruleMatches({ ...base, dayOfWeek: 0, hourStart: 9, hourEnd: 11 }, ctx)).toBe(true);
    expect(ruleMatches({ ...base, dayOfWeek: 1 }, ctx)).toBe(false); // wrong day
    expect(ruleMatches({ ...base, hourStart: 11 }, ctx)).toBe(false); // too late
    expect(ruleMatches({ ...base, technicianTier: 'NEW' }, ctx)).toBe(false); // wrong tier
    expect(ruleMatches({ ...base, serviceId: disabledServiceId }, ctx)).toBe(false); // other service
    expect(ruleMatches({ ...base, isActive: false }, ctx)).toBe(false); // inactive
  });

  it('stacks peak + surge multipliers and rounds to 2 decimals', () => {
    const date = nextSundayMorning();
    const breakdown = computeDynamicPrice({
      base: 100,
      tier: 'PREMIUM',
      serviceId: enabledServiceId,
      categoryId: catId,
      rules: [
        {
          isActive: true,
          serviceId: null,
          categoryId: null,
          technicianTier: null,
          dayOfWeek: 0,
          hourStart: 9,
          hourEnd: 11,
          priceMultiplier: 1.3,
        },
      ],
      date,
      surgeRatio: 0.8,
    });
    // 100 × 1.5 × 1.3 × 1.15 = 224.25
    expect(breakdown.peakMultiplier).toBe(1.3);
    expect(breakdown.surgeMultiplier).toBe(1.15);
    expect(breakdown.total).toBe(224.25);
  });

  it('does not surge below the 80% threshold', () => {
    const breakdown = computeDynamicPrice({
      base: 100,
      tier: 'NEW',
      serviceId: enabledServiceId,
      categoryId: catId,
      rules: [],
      date: nextSundayMorning(),
      surgeRatio: 0.79,
    });
    expect(breakdown.surgeMultiplier).toBe(1);
    expect(breakdown.total).toBe(100);
  });
});

describe('dynamic pricing — bookings.create integration', () => {
  it('prices an enabled service by tier × peak × surge and stores the breakdown', async () => {
    const c = await authCaller(customer);
    const start = nextSundayMorning();
    const end = new Date(start.getTime() + 3_600_000);

    // Peak rule scoped to the enabled service on Sundays 09:00-11:00.
    const rule = await prisma.servicePricing.create({
      data: {
        serviceId: enabledServiceId,
        technicianTier: null,
        dayOfWeek: 0,
        hourStart: 9,
        hourEnd: 11,
        priceMultiplier: 1.3,
      },
    });
    ruleIds.push(rule.id);

    // 5 slots around the booking; 4 already booked → 80% → surge.
    for (let i = 0; i < 5; i++) {
      const slot = await prisma.availabilitySlot.create({
        data: {
          technicianId: techProfileId,
          startAt: new Date(start.getTime() + (i - 2) * 900_000),
          endAt: new Date(start.getTime() + (i - 2) * 900_000 + 1_800_000),
          isBooked: i < 4,
        },
      });
      slotIds.push(slot.id);
    }

    const booking = await c.bookings.create({
      technicianId: techUserId,
      serviceId: enabledServiceId,
      addressId,
      startAt: start.toISOString(),
      endAt: end.toISOString(),
      idempotencyKey: `dp-${SUFFIX}-${Date.now()}`,
    });
    bookingIds.push(booking.id);

    // 100 × 1.5 (PREMIUM) × 1.3 (peak) × 1.15 (surge) = 224.25
    expect(Number(booking.totalAmount)).toBe(224.25);
    expect(booking.pricingBreakdown).toMatchObject({
      tierMultiplier: 1.5,
      peakMultiplier: 1.3,
      surgeMultiplier: 1.15,
      total: 224.25,
    });

    // Clean the Sunday rule now — it would leak into the later tests that
    // book the same service/time.
    await prisma.servicePricing.delete({ where: { id: rule.id } });
    ruleIds.splice(ruleIds.indexOf(rule.id), 1);
  });

  it('leaves disabled services at the static price', async () => {
    const c = await authCaller(customer);
    const start = nextSundayMorning();
    const end = new Date(start.getTime() + 3_600_000);

    const booking = await c.bookings.create({
      technicianId: techUserId,
      serviceId: disabledServiceId,
      addressId,
      startAt: start.toISOString(),
      endAt: end.toISOString(),
      idempotencyKey: `dp-${SUFFIX}-static-${Date.now()}`,
    });
    bookingIds.push(booking.id);

    expect(Number(booking.totalAmount)).toBe(100);
    expect(booking.pricingBreakdown).toBeNull();
  });

  it('applies the NEW tier as 1.0 — no tier markup', async () => {
    const c = await authCaller(customer);
    const start = nextSundayMorning();
    const end = new Date(start.getTime() + 3_600_000);

    // Same service but a NEW-tier technician, no rules match (Sunday 10:00
    // is outside the seeded Thu-Sat window; no Sunday rules exist).
    const techUser = await prisma.user.create({ data: buildUser({ role: 'TECHNICIAN' }) });
    createdUserIds.push(techUser.id);
    const tech = await prisma.technician.create({
      data: { userId: techUser.id, city: 'الرياض', kycStatus: 'VERIFIED', tier: 'NEW' },
    });

    const booking = await c.bookings.create({
      technicianId: techUser.id,
      serviceId: enabledServiceId,
      addressId,
      startAt: start.toISOString(),
      endAt: end.toISOString(),
      idempotencyKey: `dp-${SUFFIX}-new-tier-${Date.now()}`,
    });
    bookingIds.push(booking.id);

    expect(Number(booking.totalAmount)).toBe(100);
    expect(booking.pricingBreakdown).toMatchObject({ tierMultiplier: 1, total: 100 });
  });
});
