/**
 * D4 — one-click CSV exports: orders / products / analytics, bilingual
 * headers (ar/en), toFixed(2) decimals and RFC 4180 quoting.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

const createdUserIds: number[] = [];
let owner: JwtPayload;
let vendorId: number;

function callerFor(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

beforeAll(async () => {
  const ownerU = await prisma.user.create({ data: buildUser() });
  const buyerU = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(ownerU.id, buyerU.id);
  owner = { id: ownerU.id, role: 'CUSTOMER', email: ownerU.email };

  const vendor = await prisma.vendor.create({
    data: { userId: ownerU.id, storeName: 'D4 Store', storeSlug: `d4-${Date.now()}` },
  });
  vendorId = vendor.id;
  const cat = await prisma.productCategory.findFirstOrThrow({ orderBy: { sortOrder: 'asc' } });
  const p = await prisma.product.create({
    data: {
      vendorId: vendor.id,
      categoryId: cat.id,
      nameJson: { ar: 'سيروم، مرطب', en: 'Serum, Moisturizer' },
      descriptionJson: { ar: '', en: '' },
      price: 100,
      stock: 10,
      sales: 3,
      isActive: true,
      isDraft: false,
    },
  });
  const order = await prisma.storeOrder.create({
    data: {
      vendorId: vendor.id,
      customerId: buyerU.id,
      totalAmount: 150,
      itemCount: 2,
      status: 'FULFILLED',
    },
  });
  await prisma.storeOrderItem.create({
    data: {
      orderId: order.id,
      productId: p.id,
      nameSnapshot: { ar: 'سيروم' },
      priceSnapshot: 75,
      quantity: 2,
    },
  });
}, 15000);

afterAll(async () => {
  await prisma.storeOrderItem.deleteMany({ where: { order: { vendorId } } });
  await prisma.storeOrder.deleteMany({ where: { vendorId } });
  await prisma.vendorDailyStat.deleteMany({ where: { vendorId } });
  await prisma.product.deleteMany({ where: { vendorId } });
  await prisma.vendor.deleteMany({ where: { userId: { in: createdUserIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

describe('D4 — exportCsv', () => {
  it('exports orders with bilingual headers and 2-decimal totals', async () => {
    const c = callerFor(owner);
    const en = await c.vendorPortal.exportCsv({ kind: 'orders', locale: 'en' });
    const enLines = en.csv.split('\r\n');
    expect(enLines[0]).toBe('Order,Date,Status,Total,Items,Customer');
    expect(enLines[1]).toContain('150.00');
    expect(enLines[1]).toContain('FULFILLED');

    const ar = await c.vendorPortal.exportCsv({ kind: 'orders', locale: 'ar' });
    expect(ar.csv.split('\r\n')[0]).toContain('رقم الطلب');
  });

  it('exports products with RFC 4180 quoting for commas', async () => {
    const c = callerFor(owner);
    const en = await c.vendorPortal.exportCsv({ kind: 'products', locale: 'en' });
    const lines = en.csv.split('\r\n');
    expect(lines[0]).toBe('Product (AR),Product (EN),Price,Stock,Sales,Draft');
    expect(lines[1]).toContain('سيروم، مرطب'); // Arabic comma is not a CSV delimiter
    expect(lines[1]).toContain('"Serum, Moisturizer"');
    expect(lines[1]).toContain('100.00');
  });

  it('exports the analytics series (empty is fine — headers still ship)', async () => {
    const c = callerFor(owner);
    const en = await c.vendorPortal.exportCsv({ kind: 'analytics', locale: 'en' });
    expect(en.csv.split('\r\n')[0]).toBe('Day,Revenue,Orders,AOV,New,Returning');
  });

  it('returns an empty csv for a non-vendor caller', async () => {
    const noVendorUser = await prisma.user.create({ data: buildUser() });
    createdUserIds.push(noVendorUser.id);
    const c = callerFor({ id: noVendorUser.id, role: 'CUSTOMER', email: noVendorUser.email });
    const res = await c.vendorPortal.exportCsv({ kind: 'orders' });
    expect(res.csv).toBe('');
  });
});
