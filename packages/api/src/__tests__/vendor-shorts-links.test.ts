/**
 * R1 — shoppable reels surface linkage (REELS_SHOPPABLE_PLAN).
 * Shorts can be attached to a product, a service or a vendor so they
 * surface on store/product/service pages. Ownership guards: vendors tag
 * their own catalog, verified technicians tag services they provide or
 * their own store. The E7 privacy rule (anonymous = face-blurred only)
 * must hold on every surface query.
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
const createdServiceIds: number[] = [];
const createdTechnicianIds: number[] = [];
const createdShortIds: number[] = [];

let owner: JwtPayload;
let outsider: JwtPayload;
let technician: JwtPayload;

let ownerVendorId: number;
let outsiderVendorId: number;
let ownerProductId: number;
let outsiderProductId: number;
let storeServiceId: number;
let platformServiceId: number;
let techUserId: number;

let blurredProductShortId: number;
let unblurredProductShortId: number;
let pendingProductShortId: number;
let vendorShortId: number;
let serviceShortId: number;

function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

const shortBase = {
  type: 'reel' as const,
  durationSec: 15,
  category: 'makeup',
  isApproved: true,
  isActive: true,
  consentGiven: true,
  faceBlurred: true,
};

beforeAll(async () => {
  const stamp = Date.now().toString(36);

  const ownerU = await prisma.user.create({ data: buildUser() });
  const outsiderU = await prisma.user.create({ data: buildUser() });
  const techU = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(ownerU.id, outsiderU.id, techU.id);
  owner = { id: ownerU.id, role: 'CUSTOMER', email: ownerU.email };
  outsider = { id: outsiderU.id, role: 'CUSTOMER', email: outsiderU.email };
  technician = { id: techU.id, role: 'CUSTOMER', email: techU.email };
  techUserId = techU.id;

  const ownerV = await prisma.vendor.create({
    data: { userId: ownerU.id, storeName: 'Reels Store', storeSlug: `reels-${stamp}` },
  });
  const outsiderV = await prisma.vendor.create({
    data: { userId: outsiderU.id, storeName: 'Outsider Store', storeSlug: `reels-out-${stamp}` },
  });
  createdVendorIds.push(ownerV.id, outsiderV.id);
  ownerVendorId = ownerV.id;
  outsiderVendorId = outsiderV.id;

  const cat = await prisma.category.create({
    data: { nameJson: { ar: 'تجميل', en: 'Beauty' }, slug: `reels-cat-${stamp}` },
  });
  const pcat = await prisma.productCategory.create({
    data: { nameJson: { ar: 'تجميل', en: 'Beauty' }, slug: `reels-pcat-${stamp}` },
  });
  createdCategoryIds.push(cat.id);
  const createdProductCategoryIds: number[] = [pcat.id];

  const p1 = await prisma.product.create({
    data: {
      vendorId: ownerV.id,
      categoryId: pcat.id,
      nameJson: { ar: 'أحمر شفاه', en: 'Lipstick' },
      descriptionJson: { ar: '', en: '' },
      price: 60,
      stock: 10,
    },
  });
  const p2 = await prisma.product.create({
    data: {
      vendorId: outsiderV.id,
      categoryId: pcat.id,
      nameJson: { ar: 'ماسكارا', en: 'Mascara' },
      descriptionJson: { ar: '', en: '' },
      price: 40,
      stock: 10,
    },
  });
  createdProductIds.push(p1.id, p2.id);
  ownerProductId = p1.id;
  outsiderProductId = p2.id;

  const ss = await prisma.service.create({
    data: {
      categoryId: cat.id,
      titleJson: { ar: 'خدمة المتجر', en: 'Store Service' },
      basePrice: 90,
      durationMin: 30,
      vendorId: ownerV.id,
      isStoreService: true,
    },
  });
  const ps = await prisma.service.create({
    data: {
      categoryId: cat.id,
      titleJson: { ar: 'خدمة المنصة', en: 'Platform Service' },
      basePrice: 120,
      durationMin: 45,
    },
  });
  createdServiceIds.push(ss.id, ps.id);
  storeServiceId = ss.id;
  platformServiceId = ps.id;

  const tech = await prisma.technician.create({
    data: { userId: techU.id, city: 'RIYADH', kycStatus: 'VERIFIED' },
  });
  createdTechnicianIds.push(tech.id);
  await prisma.technicianService.create({ data: { technicianId: tech.id, serviceId: ps.id } });

  const s1 = await prisma.short.create({
    data: { ...shortBase, productId: p1.id, titleJson: { ar: 'أ', en: 'A' } },
  });
  const s2 = await prisma.short.create({
    data: { ...shortBase, productId: p1.id, faceBlurred: false, titleJson: { ar: 'ب', en: 'B' } },
  });
  const s3 = await prisma.short.create({
    data: {
      ...shortBase,
      productId: p1.id,
      isApproved: false,
      isActive: false,
      titleJson: { ar: 'ج', en: 'C' },
    },
  });
  const s4 = await prisma.short.create({
    data: { ...shortBase, vendorId: ownerV.id, titleJson: { ar: 'د', en: 'D' } },
  });
  const s5 = await prisma.short.create({
    data: { ...shortBase, serviceId: ps.id, titleJson: { ar: 'هـ', en: 'E' } },
  });
  const s6 = await prisma.short.create({
    data: { ...shortBase, productId: p2.id, titleJson: { ar: 'و', en: 'F' } },
  });
  createdShortIds.push(s1.id, s2.id, s3.id, s4.id, s5.id, s6.id);
  blurredProductShortId = s1.id;
  unblurredProductShortId = s2.id;
  pendingProductShortId = s3.id;
  vendorShortId = s4.id;
  serviceShortId = s5.id;
}, 30000);

afterAll(async () => {
  const scoped = { in: createdShortIds };
  try {
    await prisma.shortLike.deleteMany({ where: { shortId: scoped } });
  } catch {}
  try {
    await prisma.short.deleteMany({ where: { id: scoped } });
  } catch {}
  try {
    await prisma.technicianService.deleteMany({
      where: { technicianId: { in: createdTechnicianIds } },
    });
  } catch {}
  try {
    await prisma.technician.deleteMany({ where: { id: { in: createdTechnicianIds } } });
  } catch {}
  try {
    await prisma.service.deleteMany({ where: { id: { in: createdServiceIds } } });
  } catch {}
  try {
    await prisma.product.deleteMany({ where: { id: { in: createdProductIds } } });
  } catch {}
  try {
    await prisma.productCategory.deleteMany({ where: { id: { in: createdProductCategoryIds } } });
  } catch {}
  try {
    await prisma.category.deleteMany({ where: { id: { in: createdCategoryIds } } });
  } catch {}
  try {
    await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
  } catch {}
  try {
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  } catch {}
});

describe('beautyShorts surface linkage (R1)', () => {
  const mine = (rows: Array<Record<string, unknown>>) =>
    rows.filter((r) => createdShortIds.includes(r.id as number));

  it('surfaceShorts by product returns approved+active shorts only', async () => {
    const c = caller(owner);
    const rows = (await c.beautyShorts.surfaceShorts({ productId: ownerProductId })) as Array<
      Record<string, unknown>
    >;
    const my = mine(rows);
    expect(my.map((r) => r.id)).toContain(blurredProductShortId);
    expect(my.map((r) => r.id)).toContain(unblurredProductShortId);
    expect(my.map((r) => r.id)).not.toContain(pendingProductShortId);
    // outsider's product short must not leak into this product's surface
    expect(my.map((r) => r.id)).not.toContain(vendorShortId);
    expect(my.map((r) => r.id)).not.toContain(serviceShortId);
  });

  it('anonymous callers see only face-blurred shorts on surfaces (E7 rule)', async () => {
    const c = caller();
    const rows = (await c.beautyShorts.surfaceShorts({ productId: ownerProductId })) as Array<
      Record<string, unknown>
    >;
    const my = mine(rows);
    expect(my.some((r) => r.id === unblurredProductShortId)).toBe(false);
    expect(my.some((r) => r.id === blurredProductShortId)).toBe(true);
  });

  it('authenticated callers see unblurred surface shorts too', async () => {
    const c = caller(owner);
    const rows = (await c.beautyShorts.surfaceShorts({ productId: ownerProductId })) as Array<
      Record<string, unknown>
    >;
    const my = mine(rows);
    expect(my.some((r) => r.id === unblurredProductShortId)).toBe(true);
  });

  it('surfaceShorts by vendorId returns vendor reels', async () => {
    const c = caller();
    const rows = (await c.beautyShorts.surfaceShorts({ vendorId: ownerVendorId })) as Array<
      Record<string, unknown>
    >;
    const my = mine(rows);
    expect(my.map((r) => r.id)).toContain(vendorShortId);
  });

  it('surfaceShorts by serviceId returns service reels', async () => {
    const c = caller();
    const rows = (await c.beautyShorts.surfaceShorts({ serviceId: platformServiceId })) as Array<
      Record<string, unknown>
    >;
    const my = mine(rows);
    expect(my.map((r) => r.id)).toContain(serviceShortId);
  });

  it('surfaceShorts requires at least one surface id', async () => {
    const c = caller();
    await expect(c.beautyShorts.surfaceShorts({})).rejects.toMatchObject({
      code: 'BAD_REQUEST',
    });
  });

  it('create as vendor owner tagging own product + vendor lands in the moderation queue', async () => {
    const c = caller(owner);
    const created = (await c.beautyShorts.create({
      type: 'reel',
      titleAr: 'أحمر شفاه جديد',
      titleEn: 'New lipstick',
      consent: true,
      category: 'makeup',
      productId: ownerProductId,
      vendorId: ownerVendorId,
    })) as { id: number; isApproved: boolean; productId: number; vendorId: number };
    createdShortIds.push(created.id);
    expect(created.isApproved).toBe(false);
    expect(created.productId).toBe(ownerProductId);
    expect(created.vendorId).toBe(ownerVendorId);
  });

  it('create as vendor tagging an outsider product is FORBIDDEN', async () => {
    const c = caller(owner);
    await expect(
      c.beautyShorts.create({
        type: 'reel',
        titleAr: 'اختراق',
        titleEn: 'Intrusion',
        consent: true,
        productId: outsiderProductId,
      }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('create as vendor tagging a platform service is FORBIDDEN', async () => {
    const c = caller(owner);
    await expect(
      c.beautyShorts.create({
        type: 'reel',
        titleAr: 'خدمة منصة',
        titleEn: 'Platform service',
        consent: true,
        serviceId: platformServiceId,
      }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('create as technician tagging a provided platform service succeeds', async () => {
    const c = caller(technician);
    const created = (await c.beautyShorts.create({
      type: 'before_after',
      titleAr: 'نتيجة',
      titleEn: 'Result',
      consent: true,
      faceBlurred: true,
      serviceId: platformServiceId,
    })) as { id: number; isApproved: boolean; serviceId: number };
    createdShortIds.push(created.id);
    expect(created.isApproved).toBe(false);
    expect(created.serviceId).toBe(platformServiceId);
  });

  it('create as technician tagging a product is FORBIDDEN', async () => {
    const c = caller(technician);
    await expect(
      c.beautyShorts.create({
        type: 'reel',
        titleAr: 'منتج',
        titleEn: 'Product',
        consent: true,
        productId: ownerProductId,
      }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('create with an unknown productId is NOT_FOUND', async () => {
    const c = caller(owner);
    await expect(
      c.beautyShorts.create({
        type: 'reel',
        titleAr: 'مجهول',
        titleEn: 'Unknown',
        consent: true,
        productId: 999999999,
      }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('create as a plain customer is FORBIDDEN', async () => {
    const c = caller({ id: techUserId + 99999, role: 'CUSTOMER', email: 'nobody@test.local' });
    await expect(
      c.beautyShorts.create({
        type: 'reel',
        titleAr: 'زبون',
        titleEn: 'Customer',
        consent: true,
      }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('deleting a product cascades its linked shorts', async () => {
    const stamp = Date.now().toString(36);
    const u = await prisma.user.create({ data: buildUser() });
    const v = await prisma.vendor.create({
      data: { userId: u.id, storeName: 'Cascade Store', storeSlug: `cascade-${stamp}` },
    });
    const cat = await prisma.productCategory.create({
      data: { nameJson: { ar: 'ف', en: 'C' }, slug: `cascade-pcat-${stamp}` },
    });
    const p = await prisma.product.create({
      data: {
        vendorId: v.id,
        categoryId: cat.id,
        nameJson: { ar: 'م', en: 'P' },
        descriptionJson: { ar: '', en: '' },
        price: 10,
        stock: 1,
      },
    });
    const s = await prisma.short.create({
      data: { ...shortBase, productId: p.id, titleJson: { ar: 'س', en: 'S' } },
    });
    await prisma.product.delete({ where: { id: p.id } });
    const gone = await prisma.short.findUnique({ where: { id: s.id } });
    expect(gone).toBeNull();
    await prisma.productCategory.delete({ where: { id: cat.id } });
    await prisma.vendor.delete({ where: { id: v.id } });
    await prisma.user.delete({ where: { id: u.id } });
  });
});
