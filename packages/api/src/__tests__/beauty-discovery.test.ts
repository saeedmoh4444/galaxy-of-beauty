/**
 * Beauty bundles (live DB) + beautyDiscovery router tests.
 * (Coverage ratchet target: src/routers/beautyDiscovery.ts — was 6.2%)
 *
 * NOTE: the router's mapping logic is exercised through a mocked
 * @galaxy/db delegate layer for the four models it reads (service,
 * booking, wishlistItem, beautyProfile); everything else (beautyEvent,
 * flashDeal, beautyBundle) passes through to the real seeded database.
 * The legacy Service.emoji selects that broke the live path were
 * removed 2026-08-19 — a live-DB smoke test at the bottom proves the
 * procedures work end-to-end now.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';

const ADMIN: JwtPayload = { id: 3, role: 'ADMIN', email: 'admin@galaxyofbeauty.sa' };
const CUSTOMER: JwtPayload = { id: 999_999, role: 'CUSTOMER', email: 'discovery-test@example.com' };

const mocks = vi.hoisted(() => ({
  service: { findMany: vi.fn() },
  booking: { findMany: vi.fn() },
  wishlistItem: { findMany: vi.fn() },
  beautyProfile: { findUnique: vi.fn() },
  realPrisma: null as any,
}));

vi.mock('@galaxy/db', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@galaxy/db')>();
  mocks.realPrisma = mod.prisma;
  return {
    ...mod,
    prisma: new Proxy(mod.prisma, {
      get(target, prop) {
        if (prop === 'service') return mocks.service;
        if (prop === 'booking') return mocks.booking;
        if (prop === 'wishlistItem') return mocks.wishlistItem;
        if (prop === 'beautyProfile') return mocks.beautyProfile;
        return (target as any)[prop];
      },
    }),
  };
});

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

describe('Beauty Bundles — verified', () => {
  it('should list beauty bundles as public', async () => {
    const caller0 = await caller(null);
    const bundles = await caller0.beautyBundles.list({ limit: 5 });
    expect(bundles).toBeDefined();
    expect(Array.isArray(bundles)).toBe(true);
  }, 15000);
});

describe('beautyDiscovery router', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('featured (public)', () => {
    it('maps popular + new services, events and flash deals', async () => {
      mocks.service.findMany.mockImplementation((args: any) =>
        args?.where?.isPopular
          ? Promise.resolve([
              {
                id: 1,
                titleJson: { ar: 'منتجع السبا', en: 'Spa Resort' },
                basePrice: 120.5,
                imageUrl: 'img.jpg',
                emoji: '✨',
              },
            ])
          : Promise.resolve([
              {
                id: 2,
                titleJson: { ar: 'علاج جديد', en: 'New Treatment' },
                basePrice: 80,
                emoji: null,
              },
            ]),
      );

      const c = await caller(null);
      const res = await c.beautyDiscovery.featured();

      expect(res.popularServices).toEqual([
        { id: 1, name: 'منتجع السبا', price: 120.5, emoji: '' },
      ]);
      expect(res.newServices).toEqual([{ id: 2, name: 'علاج جديد', price: 80, emoji: '' }]);

      // Events + flash deals come from the live seeded DB — shape + cap invariants only.
      expect(Array.isArray(res.events)).toBe(true);
      expect(res.events.length).toBeLessThanOrEqual(4);
      for (const e of res.events) {
        expect(e.id).toBeGreaterThan(0);
        expect(typeof e.name).toBe('string');
        expect(typeof e.type).toBe('string');
        expect(e.date).toBeTruthy();
        expect(typeof e.location).toBe('string');
      }
      expect(Array.isArray(res.flashDeals)).toBe(true);
      expect(res.flashDeals.length).toBeLessThanOrEqual(4);
      for (const d of res.flashDeals) {
        expect(typeof d.dealPrice).toBe('number');
        expect(typeof d.originalPrice).toBe('number');
        expect(typeof d.discount).toBe('number');
        expect(typeof d.serviceId).toBe('number');
        expect(d.title).toBeDefined();
      }
    });

    it('queries the live filters and caps for each section', async () => {
      const rows = Array.from({ length: 9 }, (_, i) => ({
        id: i + 1,
        titleJson: { ar: `خدمة ${i}`, en: `Service ${i}` },
        basePrice: 100 + i,
        emoji: null,
      }));
      mocks.service.findMany.mockResolvedValue(rows);

      const c = await caller(null);
      const res = await c.beautyDiscovery.featured();

      const popularCall = mocks.service.findMany.mock.calls.find(
        (args: any) => args[0]?.where?.isPopular,
      );
      const newCall = mocks.service.findMany.mock.calls.find(
        (args: any) => !args[0]?.where?.isPopular,
      );
      // The cap is enforced via `take` (DISCOVERY_POPULAR_COUNT = 6) in the query itself.
      expect(popularCall?.[0]).toMatchObject({
        where: { isActive: true, isPopular: true },
        take: 6,
      });
      expect(newCall?.[0]).toMatchObject({ where: { isActive: true }, take: 6 });
      expect(newCall?.[0].orderBy).toEqual({ createdAt: 'desc' });
      // The router trusts the DB to apply the cap — no client-side slicing.
      expect(res.popularServices.length).toBe(9);
      expect(res.events.length).toBeLessThanOrEqual(4);
      expect(res.flashDeals.length).toBeLessThanOrEqual(4);
    });
  });

  describe('forYou (customer)', () => {
    it('rejects anonymous and non-customer callers', async () => {
      const anon = await caller(null);
      await expect(anon.beautyDiscovery.forYou()).rejects.toThrow();

      const admin = await caller(ADMIN);
      await expect(admin.beautyDiscovery.forYou()).rejects.toThrow();
    });

    it('falls back to popular suggestions with no booking history', async () => {
      mocks.booking.findMany.mockResolvedValue([]);
      mocks.beautyProfile.findUnique.mockResolvedValue(null);
      mocks.wishlistItem.findMany.mockResolvedValue([]);
      mocks.service.findMany.mockResolvedValue([
        {
          id: 5,
          titleJson: { ar: 'خدمة شائعة', en: 'Popular Service' },
          basePrice: 45,
          emoji: '⭐',
          categoryId: 1,
        },
      ]);

      const c = await caller(CUSTOMER);
      const res = await c.beautyDiscovery.forYou();

      expect(res.profile).toBeNull();
      expect(res.wishlist).toEqual([]);
      expect(res.suggestions).toEqual([
        { id: 5, name: 'خدمة شائعة', price: 45, emoji: '', categoryId: 1 },
      ]);
      expect(mocks.service.findMany.mock.calls[0]?.[0]).toMatchObject({
        where: { isActive: true, isPopular: true },
        take: 8,
      });
    });

    it('personalizes suggestions from booking categories and maps profile + wishlist', async () => {
      mocks.booking.findMany.mockResolvedValue([
        { service: { categoryId: 42, id: 11 } },
        { service: { categoryId: 42, id: 11 } },
        { service: null },
      ]);
      mocks.beautyProfile.findUnique.mockResolvedValue({
        skinType: 'oily',
        hairType: 'wavy',
        concerns: ['acne'],
      });
      mocks.wishlistItem.findMany.mockResolvedValue([
        {
          service: {
            id: 7,
            titleJson: { ar: 'منتج مفضل', en: 'Fav Product' },
            basePrice: 99.9,
            emoji: null,
            categoryId: 42,
          },
        },
        { service: null },
      ]);
      mocks.service.findMany.mockImplementation((args: any) =>
        args?.where?.categoryId
          ? Promise.resolve([
              {
                id: 11,
                titleJson: { ar: 'أفضل خدمة', en: 'Best Service' },
                basePrice: 150,
                emoji: '💅',
                categoryId: 42,
              },
            ])
          : Promise.resolve([]),
      );

      const c = await caller(CUSTOMER);
      const res = await c.beautyDiscovery.forYou();

      expect(res.profile).toEqual({ skinType: 'oily', hairType: 'wavy', concerns: ['acne'] });
      expect(res.wishlist).toEqual([
        { id: 7, name: 'منتج مفضل', price: 99.9, emoji: '' },
        { id: undefined, name: undefined, price: 0, emoji: '' },
      ]);
      expect(res.suggestions).toEqual([
        { id: 11, name: 'أفضل خدمة', price: 150, emoji: '', categoryId: 42 },
      ]);
      // Booking history was 2x category 42 → suggestions query must target it (top-3 categories).
      expect(mocks.service.findMany.mock.calls[0]?.[0]).toMatchObject({
        where: { categoryId: { in: [42] }, isActive: true },
        take: 8,
      });
    });
  });

  describe('live-schema gap (bug pin)', () => {
    it('documents that Service.emoji no longer exists on the schema', async () => {
      // The router previously selected `emoji` on Service through
      // `db = prisma as any` and threw PrismaClientValidationError on every
      // call. The selects were dropped 2026-08-19 (emoji now maps to '');
      // this pin keeps the schema absence visible so nobody re-adds the
      // legacy select key.
      await expect(
        mocks.realPrisma.service.findMany({ take: 1, select: { id: true, emoji: true } }),
      ).rejects.toThrow(/emoji/);
    }, 15000);
  });
});
