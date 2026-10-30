/**
 * Q1 — shoppable tags (REELS_SHOPPABLE_PLAN Phase 3). A reel carries
 * product/service tags (ShortTag rows) rendered as commerce overlays;
 * taps record ShortTagClick rows that power the Q3 order-attribution
 * read-model. Ownership reuses the R1 resolveShortAuthor catalog rules:
 * store owners tag their own products, cross-owner tagging is FORBIDDEN.
 * The public `tags` query obeys the E7 privacy rule (anonymous callers
 * only resolve tags on face-blurred, approved shorts).
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];
const createdCategoryIds: number[] = [];
const createdProductIds: number[] = [];
const createdShortIds: number[] = [];
const createdTagIds: number[] = [];

let owner: JwtPayload;
let outsider: JwtPayload;
let ownerVendorId: number;
let outsiderVendorId: number;
let lipstickId: number;
let outsiderProductId: number;
let taggedShortId: number;
let unblurredShortId: number;

function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

beforeAll(async () => {
  const stamp = Date.now().toString(36);
  const ownerU = await prisma.user.create({ data: buildUser() });
  const outU = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(ownerU.id, outU.id);
  owner = { id: ownerU.id, role: 'CUSTOMER', email: ownerU.email };
  outsider = { id: outU.id, role: 'CUSTOMER', email: outU.email };

  const ownerV = await prisma.vendor.create({
    data: { userId: ownerU.id, storeName: 'Tag Store', storeSlug: `tag-${stamp}` },
  });
  const outV = await prisma.vendor.create({
    data: { userId: outU.id, storeName: 'Other Store', storeSlug: `tag-other-${stamp}` },
  });
  createdVendorIds.push(ownerV.id, outV.id);
  ownerVendorId = ownerV.id;
  outsiderVendorId = outV.id;

  const pcat = await prisma.productCategory.create({
    data: { nameJson: { ar: 'مكياج', en: 'Makeup' }, slug: `tags-pcat-${stamp}` },
  });
  createdCategoryIds.push(pcat.id);

  const lip = await prisma.product.create({
    data: {
      vendorId: ownerV.id,
      categoryId: pcat.id,
      nameJson: { ar: 'أحمر شفاه', en: 'Lipstick' },
      descriptionJson: { ar: '', en: '' },
      price: 60,
      stock: 10,
    },
  });
  const outP = await prisma.product.create({
    data: {
      vendorId: outV.id,
      categoryId: pcat.id,
      nameJson: { ar: 'كريم', en: 'Cream' },
      descriptionJson: { ar: '', en: '' },
      price: 40,
      stock: 5,
    },
  });
  createdProductIds.push(lip.id, outP.id);
  lipstickId = lip.id;
  outsiderProductId = outP.id;

  const s = await prisma.short.create({
    data: {
      type: 'reel',
      titleJson: { ar: 'ريل ممرّس', en: 'Tagged reel' },
      consentGiven: true,
      faceBlurred: true,
      vendorId: ownerV.id,
      isApproved: true,
      isActive: true,
      durationSec: 30,
      category: 'makeup',
    },
  });
  const sUnblurred = await prisma.short.create({
    data: {
      type: 'reel',
      titleJson: { ar: 'بدون تعتيم', en: 'Unblurred reel' },
      consentGiven: true,
      faceBlurred: false,
      vendorId: ownerV.id,
      isApproved: true,
      isActive: true,
      durationSec: 30,
      category: 'makeup',
    },
  });
  createdShortIds.push(s.id, sUnblurred.id);
  taggedShortId = s.id;
  unblurredShortId = sUnblurred.id;
}, 30000);

afterAll(async () => {
  try {
    await prisma.shortTagClick.deleteMany({ where: { shortId: { in: createdShortIds } } });
  } catch {}
  try {
    await prisma.shortTag.deleteMany({ where: { shortId: { in: createdShortIds } } });
  } catch {}
  try {
    await prisma.short.deleteMany({ where: { id: { in: createdShortIds } } });
  } catch {}
  try {
    await prisma.product.deleteMany({ where: { id: { in: createdProductIds } } });
  } catch {}
  try {
    await prisma.productCategory.deleteMany({ where: { id: { in: createdCategoryIds } } });
  } catch {}
  try {
    await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
  } catch {}
  try {
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  } catch {}
});

describe('shoppable tags (Q1)', () => {
  it('lets a store owner set tags on their own reel with their own products', async () => {
    const c = caller(owner);
    const res = await c.beautyShorts.setTags({
      shortId: taggedShortId,
      tags: [
        { productId: lipstickId, positionSec: 12, label: { ar: 'أحمر شفاه', en: 'Lipstick' } },
      ],
    });
    expect(res.count).toBe(1);
    createdTagIds.push(...res.ids);
  });

  it("rejects tagging another store's product (cross-owner FORBIDDEN)", async () => {
    const c = caller(owner);
    await expect(
      c.beautyShorts.setTags({
        shortId: taggedShortId,
        tags: [{ productId: outsiderProductId }],
      }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('rejects tag edits from anonymous callers', async () => {
    const c = caller(null);
    await expect(
      c.beautyShorts.setTags({ shortId: taggedShortId, tags: [] }),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });

  it('resolves tags publicly with product name and price', async () => {
    const c = caller(null);
    const tags = await c.beautyShorts.tags({ shortId: taggedShortId });
    expect(tags.length).toBe(1);
    expect(tags[0].productId).toBe(lipstickId);
    expect(tags[0].productNameAr).toBe('أحمر شفاه');
    expect(Number(tags[0].productPrice)).toBe(60);
  });

  it('hides tags on unblurred shorts from anonymous callers (E7 rule)', async () => {
    await prisma.shortTag.create({
      data: { shortId: unblurredShortId, productId: lipstickId },
    });
    createdTagIds.push(-1); // created directly; deleteMany covers it below
    const c = caller(null);
    await expect(c.beautyShorts.tags({ shortId: unblurredShortId })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
    // An authenticated caller resolves them fine.
    const authed = await caller(owner).beautyShorts.tags({ shortId: unblurredShortId });
    expect(authed.length).toBe(1);
  });

  it('records tag clicks for anonymous and authenticated users', async () => {
    const [tag] = await prisma.shortTag.findMany({
      where: { shortId: taggedShortId },
      take: 1,
    });
    expect(tag).toBeTruthy();

    const anon = await caller(null).beautyShorts.tagClicked({ tagId: tag!.id });
    expect(anon.ok).toBe(true);

    const authed = await caller(owner).beautyShorts.tagClicked({ tagId: tag!.id });
    expect(authed.ok).toBe(true);

    const clicks = await prisma.shortTagClick.findMany({
      where: { tagId: tag!.id },
      orderBy: { id: 'asc' },
    });
    expect(clicks.length).toBe(2);
    expect(clicks[0].userId).toBeNull();
    expect(clicks[1].userId).toBe(owner.id);
  });

  it('rejects clicks on unknown tags', async () => {
    await expect(
      caller(null).beautyShorts.tagClicked({ tagId: 999_999_999 }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('rejects setTags on a reel the caller does not own', async () => {
    const c = caller(outsider);
    await expect(
      c.beautyShorts.setTags({ shortId: taggedShortId, tags: [{ productId: outsiderProductId }] }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});
