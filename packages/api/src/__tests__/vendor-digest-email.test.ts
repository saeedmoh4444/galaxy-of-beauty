/**
 * F2 — Weekly vendor digest email (VENDOR_DASHBOARD_ENHANCEMENT_PLAN Wave 6).
 * The weekly advisor digest (D3, gob-advisor Sunday job) gains its email
 * channel: a bilingual performance email per store owner — 7-day revenue,
 * top product, low-stock count and the top advisor rules. sendEmail
 * degrades gracefully when SMTP is unconfigured (log-only), so the job is
 * safe to ship before the user provisions SMTP.
 */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { prisma } from '@galaxy/db';
import { buildUser } from './factories';
import { handleAdvisorDigestJob } from '../workers/handlers';
import { sendEmail } from '../lib/email';

vi.mock('../lib/email', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../lib/email')>();
  return { ...mod, sendEmail: vi.fn() };
});

const sendEmailMock = vi.mocked(sendEmail);

const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];
const createdStatIds: number[] = [];
const createdCategoryIds: number[] = [];
const createdProductIds: number[] = [];

let ownerId: number;
let vendorId: number;
let productId: number;

const DAY = 86_400_000;

beforeAll(async () => {
  const owner = await prisma.user.create({
    data: buildUser({ email: 'vendor@example.com' }),
  });
  createdUserIds.push(owner.id);
  ownerId = owner.id;

  const vendor = await prisma.vendor.create({
    data: { userId: owner.id, storeName: 'Digest Store', storeSlug: `dg-${Date.now()}` },
  });
  createdVendorIds.push(vendor.id);
  vendorId = vendor.id;

  // D1 read model — 7-day revenue/orders for the digest.
  const stat = await prisma.vendorDailyStat.create({
    data: {
      vendorId: vendor.id,
      day: new Date(Date.now() - 2 * DAY),
      revenue: 1200,
      orders: 4,
      aov: 300,
      newCustomers: 3,
      returningCustomers: 1,
      productSales: {},
    },
  });
  createdStatIds.push(stat.id);

  const cat = await prisma.productCategory.create({
    data: { nameJson: { ar: 'أساسي', en: 'Core' }, slug: `dg-cat-${Date.now()}` },
  });
  createdCategoryIds.push(cat.id);
  const product = await prisma.product.create({
    data: {
      vendorId: vendor.id,
      categoryId: cat.id,
      nameJson: { ar: 'سيروم', en: 'Serum' },
      descriptionJson: { ar: '', en: '' },
      price: 100,
      stock: 2,
      lowStockThreshold: 5,
    },
  });
  createdProductIds.push(product.id);
  productId = product.id;
}, 15000);

afterAll(async () => {
  await prisma.vendorDailyStat.deleteMany({ where: { id: { in: createdStatIds } } });
  await prisma.product.deleteMany({ where: { id: { in: createdProductIds } } });
  await prisma.productCategory.deleteMany({ where: { id: { in: createdCategoryIds } } });
  await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

describe('F2 — weekly digest email', () => {
  it('emails the store owner with the weekly performance digest', async () => {
    sendEmailMock.mockClear();
    const result = await handleAdvisorDigestJob({
      id: 'test',
      name: 'advisor.digest',
      data: { vendorId },
      attemptsMade: 0,
    } as never);

    expect(result.emailed).toBe(1);
    expect(sendEmailMock).toHaveBeenCalledTimes(1);
    const [args] = sendEmailMock.mock.calls[0]!;
    expect(args.to).toBe('vendor@example.com');
    expect(args.subject).toContain('طلبات'); // bilingual subject, ar default
    expect(args.html).toContain('1200'); // 7-day revenue in the body
    expect(args.html).toContain('سيروم'); // top/low-stock product name
  });

  it('does not email vendors with no digest content', async () => {
    sendEmailMock.mockClear();
    // A second store with no stats, no products: nothing to say.
    const u2 = await prisma.user.create({ data: buildUser() });
    createdUserIds.push(u2.id);
    const v2 = await prisma.vendor.create({
      data: { userId: u2.id, storeName: 'Empty Store', storeSlug: `dg2-${Date.now()}` },
    });
    createdVendorIds.push(v2.id);

    const result = await handleAdvisorDigestJob({
      id: 'test',
      name: 'advisor.digest',
      data: { vendorId: v2.id },
      attemptsMade: 0,
    } as never);

    expect(result.emailed).toBe(0);
    expect(sendEmailMock).not.toHaveBeenCalled();
  });
});
