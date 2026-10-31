/**
 * Women's services router tests — the categories catalog, category
 * lookup, safety tips, the facade→real-service resolver map, and the
 * REAL booking flow (E-womens: the stub used to return NOT_CREATED).
 * Also pins the catalog split contract: 94 categories in stable order
 * (the merge of womensServicesCatalog1..4 must match the original file).
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';
import { WOMENS_SERVICES } from '../routers/womensServicesData';
import { resolveWomensService } from '../routers/womensServicesMap';

const CSRF = 'a'.repeat(64);

async function anonCaller() {
  const ctx = await createTRPCContext({ csrfCookie: CSRF, csrfHeader: CSRF });
  return (appRouter as any).createCaller(ctx);
}

async function caller(user: JwtPayload) {
  const ctx = await createTRPCContext({ user, csrfCookie: CSRF, csrfHeader: CSRF });
  return (appRouter as any).createCaller(ctx);
}

let customer: JwtPayload;
let userId: number;
let addressId: number;
let hasBeautyConsultation = false;
const createdBookingIds: number[] = [];

beforeAll(async () => {
  const u = await prisma.user.create({ data: buildUser() });
  userId = u.id;
  customer = { id: u.id, role: 'CUSTOMER', email: u.email };
  const addr = await prisma.address.create({
    data: { userId: u.id, label: 'المنزل', city: 'الرياض', area: 'النخيل', street: 'طريق الملك' },
  });
  addressId = addr.id;
  // The E-womens seed row exists on CI's fresh seed; a long-lived dev DB
  // may predate it — the fallback-booking test needs the row present.
  hasBeautyConsultation = !!(await prisma.service.findFirst({
    where: { titleJson: { path: ['en'], equals: 'Beauty Consultation' } },
  }));
}, 15000);

afterAll(async () => {
  await prisma.booking.deleteMany({ where: { id: { in: createdBookingIds } } });
  await prisma.address.deleteMany({ where: { id: addressId } });
  await prisma.user.deleteMany({ where: { id: userId } });
});

function appt(daysAhead: number): { startAt: string; endAt: string } {
  const d = new Date(Date.now() + daysAhead * 86_400_000);
  // Skip Friday (Jummah window) — land on a safe weekday.
  while (d.getUTCDay() === 5) d.setUTCDate(d.getUTCDate() + 1);
  d.setUTCHours(10, 0, 0, 0);
  const end = new Date(d.getTime() + 30 * 60_000);
  return { startAt: d.toISOString(), endAt: end.toISOString() };
}

describe('womensServices.categories', () => {
  it('lists all 94 categories with counts', async () => {
    const caller = await anonCaller();
    const categories = await caller.womensServices.categories();
    expect(categories).toHaveLength(94);
    expect(categories[0]).toEqual({
      key: 'pregnancy_safe',
      nameAr: expect.any(String),
      nameEn: expect.any(String),
      description: expect.any(String),
      serviceCount: expect.any(Number),
    });
    expect(categories[0].serviceCount).toBeGreaterThan(0);
    // Stable order contract (split merge order)
    expect(categories.map((c) => c.key)).toEqual(Object.keys(WOMENS_SERVICES));
  });

  it('keeps the first and last categories in original order', async () => {
    const caller = await anonCaller();
    const categories = await caller.womensServices.categories();
    expect(categories[0].key).toBe('pregnancy_safe');
    expect(categories[93].key).toBe('influencer_beauty');
  });
});

describe('womensServices.byCategory', () => {
  it('returns a known category with subServices', async () => {
    const caller = await anonCaller();
    const cat = await caller.womensServices.byCategory({ category: 'bridal_prep' });
    expect(cat.nameEn).toBeTruthy();
    expect(cat.subServices.length).toBeGreaterThan(0);
    expect(cat.subServices[0]).toHaveProperty('id');
    expect(cat.subServices[0]).toHaveProperty('price');
    expect(cat.subServices[0]).toHaveProperty('durationMin');
    expect(cat.subServices[0]).toHaveProperty('precautions');
  });

  it('throws for an unknown category', async () => {
    const caller = await anonCaller();
    await expect(caller.womensServices.byCategory({ category: 'nope' })).rejects.toThrow(
      'القسم غير موجود',
    );
  });
});

describe('womensServicesMap — facade → real service resolution', () => {
  it('resolves every one of the 289 facade items to a target', () => {
    let count = 0;
    for (const [categoryKey, cat] of Object.entries(WOMENS_SERVICES)) {
      for (const svc of cat.subServices) {
        const target = resolveWomensService(svc.nameEn, categoryKey);
        expect(target, `${categoryKey}/${svc.id} (${svc.nameEn})`).toBeTruthy();
        count += 1;
      }
    }
    expect(count).toBe(289);
  });

  it('maps category overrides to their real services', () => {
    expect(resolveWomensService('Full Bridal Henna', 'henna')).toBe('Henna Art');
    expect(resolveWomensService('Hair Loss Treatment', 'hijab_care')).toBe(
      'Under-Hijab Scalp Treatment',
    );
    expect(resolveWomensService('Golden Bride Package', 'bridal_prep')).toBe(
      'Bridal Trial Package',
    );
    expect(resolveWomensService('Bridesmaid Trio', 'bridal_party')).toBe('Bridal Party Package');
    expect(resolveWomensService('Royal Spa Day', 'luxury_spa')).toBe('Full Spa Day');
    expect(resolveWomensService('V-Steam', 'intimate_care')).toBe('Full Body Scrub');
  });

  it('maps specialized items before generic ones', () => {
    expect(resolveWomensService('Safe Pregnancy Massage', 'pregnancy_safe')).toBe(
      'Prenatal Massage',
    );
    expect(resolveWomensService('Pregnancy-Safe Pedicure', 'pregnancy_safe')).toBe(
      'Classic Pedicure',
    );
    expect(resolveWomensService('Pregnancy-Safe Facial', 'pregnancy_safe')).toBe(
      'Facial Cleansing',
    );
    expect(resolveWomensService('Recovery Massage', 'postpartum')).toBe(
      'Postpartum Recovery Massage',
    );
    expect(resolveWomensService('Hormonal Acne Treatment', 'pcos_care')).toBe('Acne Treatment');
    expect(resolveWomensService('Ramadan Henna', 'ramadan_beauty')).toBe('Henna Art');
    expect(resolveWomensService('Excess Hair Removal', 'pcos_care')).toBe('Waxing');
    expect(resolveWomensService('Natural Hair Dye', 'natural_beauty')).toBe('Hair Color');
    expect(resolveWomensService('Essential Oil Therapy', 'natural_beauty')).toBe(
      'Aromatherapy Massage',
    );
    expect(resolveWomensService('Relaxation & Meditation', 'fertility_wellness')).toBe(
      'Meditation Session',
    );
  });

  it('maps looks, care items and the consultation fallback', () => {
    expect(resolveWomensService('Courtroom Look', 'lawyer_beauty')).toBe('Evening Makeup');
    expect(resolveWomensService('Banker Hand Care', 'banker_beauty')).toBe('Manicure');
    expect(resolveWomensService('Gamer Nail Art', 'gamer_beauty')).toBe('Nail Art');
    expect(resolveWomensService('Eyebrow Shaping', 'brows_lashes')).toBe('Brow Shaping');
    expect(resolveWomensService('Screen-Time Eye Care', 'tech_woman_beauty')).toBe(
      'Facial Cleansing',
    );
    expect(resolveWomensService('Lifestyle Consultation', 'retirement_beauty')).toBe(
      'Beauty Consultation',
    );
    expect(resolveWomensService('Voice Care', 'interpreter_beauty')).toBe('Beauty Consultation');
    expect(resolveWomensService('Climate Adaptation', 'expat_beauty')).toBe('Beauty Consultation');
  });
});

describe('womensServices.book — real booking', () => {
  it('creates a REQUESTED booking against the mapped real service', async () => {
    const c = await caller(customer);
    const { startAt, endAt } = appt(3);
    const res = await c.womensServices.book({
      serviceId: 'br1', // Golden Bride Package → Bridal Trial Package
      category: 'bridal_prep',
      pregnancyTrimester: undefined,
      specialNotes: 'تفضل غرفة خاصة',
      addressId,
      startAt,
      endAt,
      idempotencyKey: crypto.randomUUID(),
    });

    expect(res.booked).toBe(true);
    expect(res.bookingCode).toMatch(/^GOB-/);
    expect(res.mappedTo).toBe('Bridal Trial Package');
    expect(res.specialRequirements).toContain('تفضل غرفة خاصة');
    createdBookingIds.push(res.bookingId);

    const booking = await prisma.booking.findUniqueOrThrow({ where: { id: res.bookingId } });
    expect(booking.status).toBe('REQUESTED');
    expect(booking.customerId).toBe(userId);
    expect(booking.addressId).toBe(addressId);
    expect(booking.notes).toContain('Golden Bride Package');
    const service = await prisma.service.findUniqueOrThrow({ where: { id: booking.serviceId } });
    expect(service.titleJson).toMatchObject({ en: 'Bridal Trial Package' });
  });

  it('replays a duplicate idempotency key instead of double-booking', async () => {
    const c = await caller(customer);
    const { startAt, endAt } = appt(4);
    const key = crypto.randomUUID();
    const first = await c.womensServices.book({
      serviceId: 'hn1', // Full Bridal Henna → Henna Art
      category: 'henna',
      addressId,
      startAt,
      endAt,
      idempotencyKey: key,
    });
    createdBookingIds.push(first.bookingId);

    const second = await c.womensServices.book({
      serviceId: 'hn1',
      category: 'henna',
      addressId,
      startAt,
      endAt,
      idempotencyKey: key,
    });

    expect(second.bookingId).toBe(first.bookingId);
    const count = await prisma.booking.count({ where: { idempotencyKey: key } });
    expect(count).toBe(1);
  });

  it('resolves an exact-name facade item to its own real service', async () => {
    const c = await caller(customer);
    const { startAt, endAt } = appt(5);
    const res = await c.womensServices.book({
      serviceId: 'bf2', // Relaxation Massage — a real seeded service title
      category: 'breastfeeding_safe',
      addressId,
      startAt,
      endAt,
      idempotencyKey: crypto.randomUUID(),
    });
    createdBookingIds.push(res.bookingId);

    const booking = await prisma.booking.findUniqueOrThrow({ where: { id: res.bookingId } });
    const service = await prisma.service.findUniqueOrThrow({ where: { id: booking.serviceId } });
    expect(service.titleJson).toMatchObject({ en: 'Relaxation Massage' });
  });

  it.skipIf(!hasBeautyConsultation)(
    'books an unmapped session against the Beauty Consultation fallback',
    async () => {
      const c = await caller(customer);
      const { startAt, endAt } = appt(6);
      const res = await c.womensServices.book({
        serviceId: 'rt2', // Lifestyle Consultation — no dedicated service
        category: 'retirement_beauty',
        addressId,
        startAt,
        endAt,
        idempotencyKey: crypto.randomUUID(),
      });
      createdBookingIds.push(res.bookingId);

      const booking = await prisma.booking.findUniqueOrThrow({ where: { id: res.bookingId } });
      const service = await prisma.service.findUniqueOrThrow({ where: { id: booking.serviceId } });
      expect(service.titleJson).toMatchObject({ en: 'Beauty Consultation' });
    },
  );

  it('rejects an unknown sub-service with NOT_FOUND', async () => {
    const c = await caller(customer);
    const { startAt, endAt } = appt(7);
    await expect(
      c.womensServices.book({
        serviceId: 'zz9',
        category: 'pregnancy_safe',
        addressId,
        startAt,
        endAt,
        idempotencyKey: crypto.randomUUID(),
      }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('rejects bookings inside the Jummah window', async () => {
    const c = await caller(customer);
    // Next Friday 12:30 Riyadh time (09:30 UTC).
    const d = new Date(Date.now() + 3 * 86_400_000);
    while (d.getUTCDay() !== 5) d.setUTCDate(d.getUTCDate() + 1);
    d.setUTCHours(9, 30, 0, 0);
    const end = new Date(d.getTime() + 30 * 60_000);
    await expect(
      c.womensServices.book({
        serviceId: 'hn1',
        category: 'henna',
        addressId,
        startAt: d.toISOString(),
        endAt: end.toISOString(),
        idempotencyKey: crypto.randomUUID(),
      }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });
});

describe('womensServices.safetyTips', () => {
  it('returns tips for a known category', async () => {
    const caller = await anonCaller();
    const tips = await caller.womensServices.safetyTips({ category: 'pregnancy_safe' });
    expect(tips.length).toBeGreaterThan(0);
    expect(tips[0]).toContain('ريتينول');
  });

  it('returns an empty array for unknown categories', async () => {
    const caller = await anonCaller();
    const tips = await caller.womensServices.safetyTips({ category: 'nope' });
    expect(tips).toEqual([]);
  });
});
