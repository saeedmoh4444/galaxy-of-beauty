/**
 * C4 — rich product media + product-level SEO (Wave C): video URL,
 * bilingual meta title/description with character guidance, and the
 * optional AR try-on link on addProduct/updateProduct.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];
const createdProductIds: number[] = [];

let owner: JwtPayload;
let outsider: JwtPayload;
let productId: number;

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

beforeAll(async () => {
  const users = await Promise.all(
    [owner, outsider].map(() => prisma.user.create({ data: buildUser() })),
  );
  createdUserIds.push(...users.map((u) => u.id));
  [owner, outsider] = users.map((u) => ({ id: u.id, role: 'CUSTOMER', email: u.email }));

  const slugBase = `c4-${Date.now()}`;
  const ownerV = await prisma.vendor.create({
    data: { userId: owner.id, storeName: 'V c4 owner', storeSlug: `${slugBase}-o` },
  });
  const outsiderV = await prisma.vendor.create({
    data: { userId: outsider.id, storeName: 'V c4 outsider', storeSlug: `${slugBase}-x` },
  });
  createdVendorIds.push(ownerV.id, outsiderV.id);

  const cat = await prisma.productCategory.findFirst({ orderBy: { sortOrder: 'asc' } });
  const p = await prisma.product.create({
    data: {
      vendorId: ownerV.id,
      categoryId: cat!.id,
      nameJson: { ar: 'كريم', en: 'Cream' },
      descriptionJson: { ar: '', en: '' },
      price: 40,
      stock: 5,
      sales: 0,
      emoji: '🧴',
      images: [],
      isActive: true,
    },
  });
  createdProductIds.push(p.id);
  productId = p.id;
}, 30000);

afterAll(async () => {
  await prisma.product.deleteMany({ where: { id: { in: createdProductIds } } });
  await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
}, 30000);

describe('C4 — product media + SEO', () => {
  it('updateProduct persists video/meta/AR fields with bilingual meta merge', async () => {
    const c = await caller(owner);
    await c.vendorPortal.updateProduct({
      id: productId,
      videoUrl: 'https://cdn.example.com/cream.mp4',
      metaTitleAr: 'كريم مرطب',
      metaDescEn: 'A hydrating cream for daily use.',
      arTryOnUrl: 'https://ar.example.com/try/cream',
    });
    await c.vendorPortal.updateProduct({
      id: productId,
      metaTitleEn: 'Hydrating Cream', // second update merges, keeps ar
    });

    const p = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
    expect(p.videoUrl).toBe('https://cdn.example.com/cream.mp4');
    expect(p.arTryOnUrl).toBe('https://ar.example.com/try/cream');
    expect(p.metaTitleJson).toEqual({ ar: 'كريم مرطب', en: 'Hydrating Cream' });
    expect(p.metaDescJson).toEqual({ ar: '', en: 'A hydrating cream for daily use.' });
  });

  it('rejects a meta title over 60 characters (character guidance)', async () => {
    const c = await caller(owner);
    await expect(
      c.vendorPortal.updateProduct({ id: productId, metaTitleEn: 'x'.repeat(61) }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });

  it('rejects a meta description over 160 characters', async () => {
    const c = await caller(owner);
    await expect(
      c.vendorPortal.updateProduct({ id: productId, metaDescEn: 'x'.repeat(161) }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });

  it('addProduct accepts the C4 fields from creation', async () => {
    const c = await caller(owner);
    const p = await c.vendorPortal.addProduct({
      nameAr: 'ماسك',
      nameEn: 'Mask',
      price: 25,
      stock: 5,
      videoUrl: 'https://cdn.example.com/mask.mp4',
      metaTitleAr: 'ماسك مغذي',
      metaDescAr: 'ماسك للبشرة الجافة.',
      arTryOnUrl: 'https://ar.example.com/try/mask',
    });
    createdProductIds.push(p.id);
    const row = await prisma.product.findUniqueOrThrow({ where: { id: p.id } });
    expect(row.videoUrl).toBe('https://cdn.example.com/mask.mp4');
    expect(row.metaTitleJson).toEqual({ ar: 'ماسك مغذي', en: '' });
    expect(row.arTryOnUrl).toBe('https://ar.example.com/try/mask');
  });

  it('keeps the ownership guard (outsider FORBIDDEN)', async () => {
    const c = await caller(outsider);
    await expect(
      c.vendorPortal.updateProduct({ id: productId, videoUrl: 'https://cdn.example.com/x.mp4' }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});
