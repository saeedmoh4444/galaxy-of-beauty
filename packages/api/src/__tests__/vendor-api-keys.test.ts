/**
 * D1 — vendor API keys (Wave D): creation shows the plaintext ONCE,
 * storage is hash-only, key auth resolves the vendor, revocation is
 * immediate, and vendors stay isolated per key.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';
import { hashApiKey } from '../lib/apiKeys';

const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];
const createdProductIds: number[] = [];
const createdKeyIds: number[] = [];

let owner: JwtPayload;
let outsider: JwtPayload;
let ownerVendorId: number;
let ownerProductId: number;
let plaintext = '';
let keyId: number;

async function caller(user: JwtPayload | null, apiKey?: string | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1', apiKey: apiKey ?? null });
}

beforeAll(async () => {
  const users = await Promise.all(
    [owner, outsider].map(() => prisma.user.create({ data: buildUser() })),
  );
  createdUserIds.push(...users.map((u) => u.id));
  [owner, outsider] = users.map((u) => ({ id: u.id, role: 'CUSTOMER', email: u.email }));

  const slugBase = `d1-${Date.now()}`;
  const ownerV = await prisma.vendor.create({
    data: { userId: owner.id, storeName: 'V d1 owner', storeSlug: `${slugBase}-o` },
  });
  const outsiderV = await prisma.vendor.create({
    data: { userId: outsider.id, storeName: 'V d1 outsider', storeSlug: `${slugBase}-x` },
  });
  createdVendorIds.push(ownerV.id, outsiderV.id);
  ownerVendorId = ownerV.id;

  const cat = await prisma.productCategory.findFirst({ orderBy: { sortOrder: 'asc' } });
  const p = await prisma.product.create({
    data: {
      vendorId: ownerVendorId,
      categoryId: cat!.id,
      nameJson: { ar: 'D1', en: 'D1' },
      descriptionJson: { ar: '', en: '' },
      price: 10,
      stock: 5,
      sales: 0,
      emoji: '🧴',
      images: [],
      isActive: true,
    },
  });
  createdProductIds.push(p.id);
  ownerProductId = p.id;
}, 30000);

afterAll(async () => {
  await prisma.vendorApiKey.deleteMany({ where: { id: { in: createdKeyIds } } });
  await prisma.product.deleteMany({ where: { id: { in: createdProductIds } } });
  await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
}, 30000);

describe('D1 — vendor API keys', () => {
  it('createApiKey shows the plaintext once and stores only the hash', async () => {
    const c = await caller(owner);
    const res = await c.vendorPortal.createApiKey({ name: 'ERP' });
    keyId = res.key.id;
    createdKeyIds.push(keyId);
    plaintext = res.plaintext;
    expect(plaintext.startsWith('gb_live_')).toBe(true);

    const row = await prisma.vendorApiKey.findUniqueOrThrow({ where: { id: keyId } });
    expect(row.keyHash).toBe(hashApiKey(plaintext));
    expect(row.keyHash).not.toBe(plaintext);

    const list = await c.vendorPortal.apiKeys();
    const listed = list.find((k: { id: number }) => k.id === keyId);
    expect(listed).toBeDefined();
    expect((listed as Record<string, unknown>).plaintext).toBeUndefined();
  });

  it('authenticates vendorApi requests with the plaintext key', async () => {
    const c = await caller(null, plaintext);
    const products = await c.vendorApi.products({});
    expect(Array.isArray(products)).toBe(true);
    expect(products.some((p: { id: number }) => p.id === ownerProductId)).toBe(true);

    const orders = await c.vendorApi.orders({});
    expect(Array.isArray(orders)).toBe(true);
  });

  it('rejects missing and invalid keys with UNAUTHORIZED', async () => {
    await expect((await caller(null)).vendorApi.products({})).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
    });
    await expect(
      (await caller(null, 'gb_live_' + '0'.repeat(32))).vendorApi.products({}),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });

  it('keeps vendors isolated — the key only reads its own vendor', async () => {
    const outsiderProduct = await prisma.product.create({
      data: {
        vendorId: (await prisma.vendor.findFirst({ where: { userId: outsider.id } }))!.id,
        categoryId: (await prisma.productCategory.findFirst({ orderBy: { sortOrder: 'asc' } }))!.id,
        nameJson: { ar: 'X', en: 'X' },
        descriptionJson: { ar: '', en: '' },
        price: 1,
        stock: 1,
        sales: 0,
        emoji: '🧴',
        images: [],
        isActive: true,
      },
    });
    createdProductIds.push(outsiderProduct.id);
    const c = await caller(null, plaintext);
    const products = await c.vendorApi.products({});
    expect(products.some((p: { id: number }) => p.id === outsiderProduct.id)).toBe(false);
  });

  it('revocation is immediate and ownership-guarded', async () => {
    const c = await caller(owner);
    await c.vendorPortal.revokeApiKey({ keyId });
    await expect((await caller(null, plaintext)).vendorApi.products({})).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
    });
    // Outsider cannot revoke another vendor's key.
    const oc = await caller(outsider);
    await expect(oc.vendorPortal.revokeApiKey({ keyId })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });
});
