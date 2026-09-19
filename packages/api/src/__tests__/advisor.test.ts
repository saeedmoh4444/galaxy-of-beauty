/**
 * 3.3 Proactive AI advisor — deterministic insight engine tests.
 *
 * buildSmartReminders (category cadence), buildOccasionInsight (Eid within
 * N days), buildBudgetInsight (status-filtered spend), buildTrendInsight
 * (week-over-week category risers + technician availability in the user's
 * city) and the combined buildAdvisorInsights. Pure functions over local
 * data — no OpenAI, no feature flag.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { getUpcomingOccasions } from '@galaxy/shared';
import {
  buildAdvisorInsights,
  buildBudgetInsight,
  buildOccasionInsight,
  buildSmartReminders,
  buildTrendInsight,
} from '../lib/advisor';
import { buildUser, buildCategory, buildService, buildBooking } from './factories';

let userId: number;
let facialCatId: number;
let makeupCatId: number;
let facialServiceId: number;
let baseAddressId: number;
const createdUserIds: number[] = [];
const createdCategoryIds: number[] = [];
const createdServiceIds: number[] = [];
const createdBookingIds: number[] = [];
const createdTechIds: number[] = [];
const createdAddressIds: number[] = [];
const createdBudgetIds: number[] = [];

const NOW = new Date('2026-03-05T12:00:00Z');

function daysAgo(n: number): Date {
  return new Date(NOW.getTime() - n * 86_400_000);
}

/** Seeded categories are reused (slug-keyed); fallback-create if absent. */
async function ensureCategory(slug: string, nameJson: { ar: string; en: string }): Promise<number> {
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) return existing.id;
  const created = await prisma.category.create({
    data: buildCategory({ slug, nameJson }),
  });
  createdCategoryIds.push(created.id);
  return created.id;
}

async function makeBooking(overrides: Record<string, unknown>): Promise<number> {
  const base = buildBooking({
    customerId: userId,
    technicianId: userId,
    serviceId: facialServiceId,
  });
  const data = { ...base, addressId: baseAddressId, ...overrides } as Record<string, unknown>;
  // Fixtures anchor on appointment time: default createdAt to startAt so
  // reminder fixtures don't pollute budget windows anchored on `now`.
  if (data['createdAt'] === undefined) data['createdAt'] = data['startAt'];
  const booking = await prisma.booking.create({ data: data as never });
  createdBookingIds.push(booking.id);
  return booking.id;
}

beforeAll(async () => {
  const u = await prisma.user.create({ data: buildUser({ role: 'CUSTOMER' }) });
  userId = u.id;
  createdUserIds.push(u.id);

  const facialCat = await prisma.category.findUnique({ where: { slug: 'facial-cleansing' } });
  const makeupCat = await prisma.category.findUnique({ where: { slug: 'makeup' } });
  // Reuse seeded categories (CI seeds); the slug collision above proves
  // they exist locally too.
  facialCatId = facialCat
    ? facialCat.id
    : await ensureCategory('facial-cleansing', { ar: 'تنظيف البشرة', en: 'Facial' });
  makeupCatId = makeupCat
    ? makeupCat.id
    : await ensureCategory('makeup', { ar: 'مكياج', en: 'Makeup' });

  const facial = await prisma.service.create({
    data: buildService({
      categoryId: facialCatId,
      titleJson: { ar: 'تنظيف عميق', en: 'Deep Facial' },
      basePrice: 200,
    }),
  });
  facialServiceId = facial.id;
  createdServiceIds.push(facial.id);

  // Booking.addressId is required — one shared base address for fixtures.
  const baseAddr = await prisma.address.create({
    data: {
      userId,
      label: 'المنزل',
      city: 'الرياض',
      area: 'النخيل',
      street: 'طريق الملك',
    },
  });
  baseAddressId = baseAddr.id;
  createdAddressIds.push(baseAddr.id);
});

afterAll(async () => {
  await prisma.booking.deleteMany({ where: { id: { in: createdBookingIds } } });
  await prisma.beautyBudget.deleteMany({ where: { id: { in: createdBudgetIds } } });
  await prisma.address.deleteMany({ where: { id: { in: createdAddressIds } } });
  await prisma.technicianService.deleteMany({ where: { technicianId: { in: createdTechIds } } });
  await prisma.technician.deleteMany({ where: { id: { in: createdTechIds } } });
  await prisma.service.deleteMany({ where: { id: { in: createdServiceIds } } });
  await prisma.category.deleteMany({ where: { id: { in: createdCategoryIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

describe('getUpcomingOccasions (shared)', () => {
  it('returns Eid al-Fitr when it falls within the window', () => {
    const occasions = getUpcomingOccasions(new Date('2026-03-05T00:00:00Z'), 21);
    const fitr = occasions.find((o) => o.key === 'eid_al_fitr');
    expect(fitr).toBeDefined();
    expect(fitr!.date).toBe('2026-03-20');
    expect(fitr!.labelAr).toContain('الفطر');
  });

  it('returns nothing when no occasion is near', () => {
    expect(getUpcomingOccasions(new Date('2026-04-01T00:00:00Z'), 21)).toEqual([]);
  });

  it('includes Ramadan start when approaching Ramadan', () => {
    const occasions = getUpcomingOccasions(new Date('2027-01-20T00:00:00Z'), 21);
    expect(occasions.some((o) => o.key === 'ramadan_start')).toBe(true);
  });
});

describe('buildSmartReminders', () => {
  it('flags categories whose last completed booking is past 75% of cadence', async () => {
    await makeBooking({
      status: 'COMPLETED',
      serviceId: facialServiceId,
      startAt: daysAgo(30), // facial cadence 4w → due at 21 days
      endAt: daysAgo(30),
    });
    const reminders = await buildSmartReminders(userId, NOW);
    expect(reminders.length).toBeGreaterThanOrEqual(1);
    const facial = reminders.find((r) => r.categorySlug === 'facial-cleansing');
    expect(facial).toBeDefined();
    expect(facial!.daysSince).toBeGreaterThanOrEqual(30);
    expect(facial!.suggestedServiceId).toBe(facialServiceId);
  });

  it('ignores recent bookings (not due yet)', async () => {
    await makeBooking({
      status: 'COMPLETED',
      serviceId: facialServiceId,
      startAt: daysAgo(5),
      endAt: daysAgo(5),
    });
    const reminders = await buildSmartReminders(userId, NOW);
    const facial = reminders.find((r) => r.categorySlug === 'facial-cleansing');
    // The 30-day-old booking is still the LATEST per category — the recent
    // one is newer, so facial must no longer be due.
    expect(facial).toBeUndefined();
  });

  it('excludes cancelled/no-show bookings from cadence', async () => {
    await makeBooking({ status: 'CANCELLED', startAt: daysAgo(60), endAt: daysAgo(60) });
    const reminders = await buildSmartReminders(userId, NOW);
    // Cancelled at 60d ago must not make the category due — the 5d-ago
    // COMPLETED booking is still the latest valid one.
    expect(reminders.find((r) => r.categorySlug === 'facial-cleansing')).toBeUndefined();
  });
});

describe('buildOccasionInsight', () => {
  it('builds an Eid insight with days-to and a category link', () => {
    const insight = buildOccasionInsight(new Date('2026-03-05T12:00:00Z'));
    expect(insight).not.toBeNull();
    expect(insight!.type).toBe('occasion');
    expect(insight!.titleAr).toContain('١٥'); // "Eid in 15 days" (ceil)
    expect(insight!.link).toContain('makeup');
  });

  it('returns null when no occasion is near', () => {
    expect(buildOccasionInsight(new Date('2026-04-01T12:00:00Z'))).toBeNull();
  });
});

describe('buildBudgetInsight', () => {
  it('computes remaining budget over status-filtered spend', async () => {
    const month = NOW.toISOString().slice(0, 7);
    const budget = await prisma.beautyBudget.create({
      data: { userId, month, budget: 1000 },
    });
    createdBudgetIds.push(budget.id);

    await makeBooking({ status: 'COMPLETED', totalAmount: 200, createdAt: NOW });
    await makeBooking({ status: 'CANCELLED', totalAmount: 999, createdAt: NOW });

    const insight = await buildBudgetInsight(userId, NOW);
    expect(insight).not.toBeNull();
    expect(insight!.spent).toBe(200); // cancelled excluded
    expect(insight!.remaining).toBe(800);
    expect(insight!.affordableCount).toBe(4); // avg 200
    expect(insight!.bodyAr).toContain('٨٠٠');
  });

  it('returns null when no budget is set', async () => {
    const bare = await prisma.user.create({ data: buildUser({ role: 'CUSTOMER' }) });
    createdUserIds.push(bare.id);
    await expect(buildBudgetInsight(bare.id, NOW)).resolves.toBeNull();
  });
});

describe('buildTrendInsight', () => {
  it('picks the week-over-week rising category and counts city technicians', async () => {
    // User address in Riyadh + technician in Riyadh offering the facial.
    const addr = await prisma.address.create({
      data: {
        userId,
        label: 'المنزل',
        city: 'الرياض',
        area: 'النخيل',
        street: 'طريق الملك',
      },
    });
    createdAddressIds.push(addr.id);

    const tech = await prisma.user.create({ data: buildUser({ role: 'TECHNICIAN' }) });
    createdUserIds.push(tech.id);
    const techProfile = await prisma.technician.create({
      data: { userId: tech.id, city: 'الرياض' },
    });
    createdTechIds.push(techProfile.id);
    await prisma.technicianService.create({
      data: { technicianId: techProfile.id, serviceId: facialServiceId },
    });

    // This week: 3 facial bookings; last week: 1.
    await makeBooking({ status: 'COMPLETED', createdAt: daysAgo(2) });
    await makeBooking({ status: 'COMPLETED', createdAt: daysAgo(3) });
    await makeBooking({ status: 'COMPLETED', createdAt: daysAgo(4) });
    await makeBooking({ status: 'COMPLETED', createdAt: daysAgo(10) });

    const insight = await buildTrendInsight(userId, NOW);
    expect(insight).not.toBeNull();
    expect(insight!.type).toBe('trend');
    expect(insight!.categorySlug).toBe('facial-cleansing');
    expect(insight!.cityCount).toBeGreaterThanOrEqual(1);
    expect(insight!.bodyAr).toContain('الرياض');
  });
});

describe('buildAdvisorInsights', () => {
  it('combines insights sorted by priority with bilingual payloads', async () => {
    const insights = await buildAdvisorInsights(userId, NOW);
    expect(insights.length).toBeGreaterThanOrEqual(2); // budget + trend at least
    for (const i of insights) {
      expect(i.titleAr.length).toBeGreaterThan(0);
      expect(i.titleEn.length).toBeGreaterThan(0);
      expect(i.bodyAr.length).toBeGreaterThan(0);
      expect(i.link.length).toBeGreaterThan(0);
      expect(i.emoji.length).toBeGreaterThan(0);
    }
    const priorities = insights.map((i) => i.priority);
    expect([...priorities].sort((a, b) => a - b)).toEqual(priorities);
  });
});
