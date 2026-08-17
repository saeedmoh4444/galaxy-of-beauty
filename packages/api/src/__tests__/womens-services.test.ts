/**
 * Women's services router tests — the categories catalog, category
 * lookup, special-requirements booking, and safety tips.
 * Also pins the catalog split contract: 94 categories in stable order
 * (the merge of womensServicesCatalog1..4 must match the original file).
 */
import { describe, it, expect } from 'vitest';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';
import { WOMENS_SERVICES } from '../routers/womensServicesData';

const CSRF = 'a'.repeat(64);

async function anonCaller() {
  const ctx = await createTRPCContext({ csrfCookie: CSRF, csrfHeader: CSRF });
  return (appRouter as any).createCaller(ctx);
}

async function customerCaller(userId: number) {
  const ctx = await createTRPCContext({
    user: { id: userId, role: 'CUSTOMER', email: 'customer@test.com' },
    csrfCookie: CSRF,
    csrfHeader: CSRF,
  });
  return (appRouter as any).createCaller(ctx);
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

describe('womensServices.book', () => {
  it('returns a confirmed booking for a known service', async () => {
    const caller = await customerCaller(42);
    const result = await caller.womensServices.book({
      serviceId: 'ps1',
      category: 'pregnancy_safe',
      pregnancyTrimester: 2,
      specialNotes: 'تفضل غرفة خاصة',
    });
    expect(result.bookingId).toMatch(/^WMN-/);
    expect(result.status).toBe('CONFIRMED');
    expect(result.price).toBeGreaterThan(0);
    expect(result.durationMin).toBeGreaterThan(0);
    expect(result.specialRequirements).toContain('ثلاثي الحمل: 2');
    expect(result.specialRequirements).toContain('تفضل غرفة خاصة');
  });

  it('omits null special requirements', async () => {
    const caller = await customerCaller(42);
    const result = await caller.womensServices.book({
      serviceId: 'ps1',
      category: 'pregnancy_safe',
    });
    expect(result.specialRequirements).toEqual([]);
  });

  it('throws for an unknown service id', async () => {
    const caller = await customerCaller(42);
    await expect(
      caller.womensServices.book({ serviceId: 'zz9', category: 'pregnancy_safe' }),
    ).rejects.toThrow('الخدمة غير موجودة');
  });

  it('throws for an unknown category', async () => {
    const caller = await customerCaller(42);
    await expect(
      caller.womensServices.book({ serviceId: 'ps1', category: 'nope' }),
    ).rejects.toThrow('الخدمة غير موجودة');
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
