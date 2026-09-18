/**
 * beautyDna router tests — 3.1 Skin/Hair/Fragrance Match.
 *
 * The router is pure deterministic scoring over local data (no OpenAI, no
 * quota, no feature flag), so fixtures pin exact rankings. The seeded demo
 * store ships real products (foundations depths 1–6, perfumes for every
 * scent family), so fixtures use combos the seed does NOT cover decisively
 * (olive+cool has no exact seeded shade; fragrance assertions pass explicit
 * seasons and assert on families/scores, not ids, where seeded twins tie).
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { buildUser, buildVendor, buildProduct, buildBeautyProfile } from './factories';
import type { JwtPayload } from '../lib/jwt';

let user: JwtPayload;
const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];
const createdProductIds: number[] = [];
const createdCategoryIds: number[] = [];
const createdProfileIds: number[] = [];

// Product fixtures — ids resolved after create.
let foundationOliveCool: number; // depth 3 cool — olive+cool: 25+20 = 45 (strict winner)
let foundationDeepCool: number; //  depth 6 cool — olive+cool: 0+20 = 20; deep+cool: 45
let foundationLightWarm: number; // depth 1 warm — olive+cool: 0 (out of range)
let perfumeFloral: number; //      floral [spring,summer]
let perfumeWoody: number; //       woody [autumn,winter]

let makeupCatId: number;
let fragranceCatId: number;

async function caller(u: JwtPayload) {
  return (appRouter as any).createCaller({ user: u, ip: '127.0.0.1' });
}

async function ensureCategory(slug: string, nameJson: { ar: string; en: string }): Promise<number> {
  const existing = await prisma.productCategory.findUnique({ where: { slug } });
  if (existing) return existing.id;
  const created = await prisma.productCategory.create({ data: { nameJson, slug } });
  createdCategoryIds.push(created.id);
  return created.id;
}

beforeAll(async () => {
  const u = await prisma.user.create({ data: buildUser({ role: 'CUSTOMER' }) });
  createdUserIds.push(u.id);
  user = { id: u.id, role: 'CUSTOMER', email: u.email };

  const vendor = await prisma.vendor.create({ data: buildVendor({ userId: u.id }) });
  createdVendorIds.push(vendor.id);

  makeupCatId = await ensureCategory('product-makeup', { ar: 'المكياج', en: 'Makeup' });
  fragranceCatId = await ensureCategory('product-fragrance', { ar: 'العطور', en: 'Fragrance' });

  const products = await Promise.all([
    prisma.product.create({
      data: buildProduct({
        vendorId: vendor.id,
        categoryId: makeupCatId,
        nameJson: { ar: 'أساس زيتوني بارد', en: 'Olive Cool Foundation' },
        attributes: {
          kind: 'makeup',
          shade: 'olive',
          shadeHex: '#C9A87C',
          undertone: 'cool',
          depth: 3,
        },
      }),
    }),
    prisma.product.create({
      data: buildProduct({
        vendorId: vendor.id,
        categoryId: makeupCatId,
        nameJson: { ar: 'أساس عميق بارد', en: 'Deep Cool Foundation' },
        attributes: {
          kind: 'makeup',
          shade: 'espresso',
          shadeHex: '#7C5330',
          undertone: 'cool',
          depth: 6,
        },
      }),
    }),
    prisma.product.create({
      data: buildProduct({
        vendorId: vendor.id,
        categoryId: makeupCatId,
        nameJson: { ar: 'أساس فاتح دافئ', en: 'Light Warm Foundation' },
        attributes: {
          kind: 'makeup',
          shade: 'sand',
          shadeHex: '#EAC9A8',
          undertone: 'warm',
          depth: 1,
        },
      }),
    }),
    prisma.product.create({
      data: buildProduct({
        vendorId: vendor.id,
        categoryId: fragranceCatId,
        nameJson: { ar: 'عطر زهري', en: 'Floral Perfume' },
        attributes: { kind: 'fragrance', fragranceFamily: 'floral', seasons: ['spring', 'summer'] },
      }),
    }),
    prisma.product.create({
      data: buildProduct({
        vendorId: vendor.id,
        categoryId: fragranceCatId,
        nameJson: { ar: 'عطر خشبي', en: 'Woody Perfume' },
        attributes: { kind: 'fragrance', fragranceFamily: 'woody', seasons: ['autumn', 'winter'] },
      }),
    }),
  ]);
  [foundationOliveCool, foundationDeepCool, foundationLightWarm, perfumeFloral, perfumeWoody] =
    products.map((p) => p.id);
  createdProductIds.push(...products.map((p) => p.id));

  const profile = await prisma.beautyProfile.create({
    data: buildBeautyProfile({
      userId: u.id,
      skinTone: 'olive',
      undertone: 'cool',
      faceShape: 'oval',
      hairType: 'curly',
      hairLength: 'medium',
      preferredScents: ['floral'],
    }),
  });
  createdProfileIds.push(profile.id);
});

afterAll(async () => {
  await prisma.product.deleteMany({ where: { id: { in: createdProductIds } } });
  await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
  await prisma.beautyProfile.deleteMany({ where: { id: { in: createdProfileIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  // Only delete categories the test itself created.
  await prisma.productCategory.deleteMany({ where: { id: { in: createdCategoryIds } } });
});

describe('beautyDna.skinMatch', () => {
  it('ranks the exact undertone+depth product first with reasons and matchPct', async () => {
    const res = await (await caller(user)).beautyDna.skinMatch({});
    expect(res.missing).toEqual([]);
    expect(res.profile.skinTone).toBe('olive');
    expect(res.matches.length).toBeGreaterThanOrEqual(3);
    const first = res.matches[0]!;
    expect(first.product.id).toBe(foundationOliveCool);
    expect(first.reasons).toContain('tone_undertone');
    expect(first.reasons).toContain('tone_depth');
    expect(first.matchPct).toBeGreaterThanOrEqual(50);
    expect(first.matchPct).toBeLessThanOrEqual(99);
    expect(typeof first.product.price).toBe('number');
  });

  it('scores the in-range wrong-undertone product above the out-of-range one', async () => {
    const res = await (await caller(user)).beautyDna.skinMatch({});
    // deepCool (undertone-only, +20) makes the top-8 cut; lightWarm (0
    // points, out of olive's depth window) does not — the top-8 cap hides
    // it, which is exactly the ranking behavior we assert.
    const ids = res.matches.map((m) => m.product.id);
    expect(ids).toContain(foundationDeepCool);
    expect(ids).not.toContain(foundationLightWarm);
    const deepCool = res.matches.find((m) => m.product.id === foundationDeepCool)!;
    expect(deepCool.score).toBe(20);
  });

  it('is deterministic across calls', async () => {
    const a = await (await caller(user)).beautyDna.skinMatch({});
    const b = await (await caller(user)).beautyDna.skinMatch({});
    expect(a).toEqual(b);
  });

  it('input overrides the profile value', async () => {
    const res = await (
      await caller(user)
    ).beautyDna.skinMatch({ skinTone: 'deep', undertone: 'cool' });
    expect(res.profile.skinTone).toBe('deep');
    const ids = res.matches.map((m) => m.product.id);
    expect(ids[0]).toBe(foundationDeepCool);
  });

  it('returns missing skinTone with no matches when profile has none', async () => {
    const bare = await prisma.user.create({ data: buildUser({ role: 'CUSTOMER' }) });
    createdUserIds.push(bare.id);
    const res = await (
      await caller({ id: bare.id, role: 'CUSTOMER', email: bare.email })
    ).beautyDna.skinMatch({});
    expect(res.matches).toEqual([]);
    expect(res.missing).toContain('skinTone');
  });
});

describe('beautyDna.hairMatch', () => {
  it('returns catalog styles for the profile faceShape+hairType, sorted by score', async () => {
    const res = await (await caller(user)).beautyDna.hairMatch({});
    expect(res.missing).toEqual([]);
    expect(res.matches.length).toBeGreaterThanOrEqual(1);
    const scores = res.matches.map((m) => m.score);
    expect([...scores].sort((x, y) => y - x)).toEqual(scores);
    for (const m of res.matches) {
      expect(m.style.faceShapes).toContain('oval');
      expect(m.style.hairTypes).toContain('curly');
      expect(m.matchPct).toBeGreaterThanOrEqual(50);
    }
  });

  it('returns missing faceShape when profile has none', async () => {
    const bare = await prisma.user.create({ data: buildUser({ role: 'CUSTOMER' }) });
    createdUserIds.push(bare.id);
    const res = await (
      await caller({ id: bare.id, role: 'CUSTOMER', email: bare.email })
    ).beautyDna.hairMatch({});
    expect(res.matches).toEqual([]);
    expect(res.missing).toContain('faceShape');
  });

  it('input overrides profile face shape and hair type', async () => {
    const res = await (
      await caller(user)
    ).beautyDna.hairMatch({ faceShape: 'round', hairType: 'straight', hairLength: 'long' });
    expect(res.matches.length).toBeGreaterThanOrEqual(1);
    for (const m of res.matches) {
      expect(m.style.faceShapes).toContain('round');
      expect(m.style.hairTypes).toContain('straight');
    }
  });
});

describe('beautyDna.fragranceMatch', () => {
  it('ranks the preferred-scent family first (explicit summer season)', async () => {
    const res = await (await caller(user)).beautyDna.fragranceMatch({ season: 'summer' });
    expect(res.missing).toEqual([]);
    expect(res.season).toBe('summer');
    expect(res.matches.length).toBeGreaterThanOrEqual(2);
    // floral: +30 scent +25 season = 55 — ties with the seeded floral twin;
    // assert on the family, not the id.
    const first = res.matches[0]!;
    expect(first.product.attributes).toMatchObject({ fragranceFamily: 'floral' });
    expect(first.score).toBe(55);
    expect(first.matchPct).toBe(99);
  });

  it('season override flips the winner (woody beats floral in winter)', async () => {
    const res = await (await caller(user)).beautyDna.fragranceMatch({ season: 'winter' });
    // woody: +25 winter +10 family bonus = 35; floral: +30 scent only = 30.
    const first = res.matches[0]!;
    expect(first.product.attributes).toMatchObject({ fragranceFamily: 'woody' });
    expect(first.score).toBe(35);
    const floralIdx = res.matches.findIndex(
      (m) => (m.product.attributes as { fragranceFamily?: string }).fragranceFamily === 'floral',
    );
    expect(floralIdx).toBeGreaterThan(0);
  });

  it('is deterministic across calls', async () => {
    const a = await (await caller(user)).beautyDna.fragranceMatch({ season: 'summer' });
    const b = await (await caller(user)).beautyDna.fragranceMatch({ season: 'summer' });
    expect(a).toEqual(b);
  });

  it('returns missing preferredScents with no matches when profile has none', async () => {
    const bare = await prisma.user.create({ data: buildUser({ role: 'CUSTOMER' }) });
    createdUserIds.push(bare.id);
    const res = await (
      await caller({ id: bare.id, role: 'CUSTOMER', email: bare.email })
    ).beautyDna.fragranceMatch({});
    expect(res.matches).toEqual([]);
    expect(res.missing).toContain('preferredScents');
  });
});
