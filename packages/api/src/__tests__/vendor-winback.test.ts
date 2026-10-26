/**
 * B4 — Win-back toolkit (VENDOR_PROFESSIONALIZATION_PLAN Wave B).
 * Vendors re-engage their own past customers with pre-approved
 * templates only (no free text): "we restocked {{product}}" and "your
 * favorites are on offer". Rate-limited (one win-back per customer per
 * 14 days), opt-out honored (the promotions preference gate), and
 * strictly scoped to the vendor's own order history.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];
const createdOrderIds: number[] = [];
const createdWinbackIds: number[] = [];
const createdTemplateIds: number[] = [];

let owner: JwtPayload;
let vendorId: number;
let customerA: number; // past customer (gets the win-back)
let customerB: number; // past customer who opted out of promotions
let stranger: number; // NOT a customer (must be skipped)

async function caller(user: JwtPayload) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

async function mkOrder(customerId: number, daysAgo: number) {
  const o = await prisma.storeOrder.create({
    data: {
      vendorId,
      customerId,
      totalAmount: 100,
      itemCount: 1,
      status: 'FULFILLED',
      createdAt: new Date(Date.now() - daysAgo * 86_400_000),
    },
  });
  createdOrderIds.push(o.id);
  return o;
}

beforeAll(async () => {
  const [t1, t2] = await Promise.all(
    ['store_winback_restocked', 'store_winback_on_offer'].map((key) =>
      prisma.notificationTemplate.upsert({
        where: { key },
        update: {},
        create: {
          key,
          category: 'promotions',
          channels: ['in_app'],
          titleJson: { ar: 'عاد {{storeName}}', en: '{{storeName}} is back' },
          bodyJson: { ar: '{{message}}', en: '{{message}}' },
        },
      }),
    ),
  );
  createdTemplateIds.push(t1.id, t2.id);

  const ownerU = await prisma.user.create({ data: buildUser() });
  const aU = await prisma.user.create({ data: buildUser() });
  const bU = await prisma.user.create({ data: buildUser() });
  const sU = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(ownerU.id, aU.id, bU.id, sU.id);
  owner = { id: ownerU.id, role: 'CUSTOMER', email: ownerU.email };
  customerA = aU.id;
  customerB = bU.id;
  stranger = sU.id;

  const v = await prisma.vendor.create({
    data: { userId: ownerU.id, storeName: 'V b4', storeSlug: `b4-${Date.now()}` },
  });
  createdVendorIds.push(v.id);
  vendorId = v.id;

  await mkOrder(customerA, 10);
  await mkOrder(customerB, 20);

  // Customer B opted out of promotions.
  await prisma.notificationPreference.upsert({
    where: { userId: customerB },
    update: { promotions: false },
    create: { userId: customerB, promotions: false },
  });
}, 20000);

afterAll(async () => {
  await prisma.winbackLog.deleteMany({ where: { id: { in: createdWinbackIds } } });
  await prisma.notification.deleteMany({ where: { userId: { in: createdUserIds } } });
  await prisma.storeOrder.deleteMany({ where: { id: { in: createdOrderIds } } });
  await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
  await prisma.notificationTemplate.deleteMany({ where: { id: { in: createdTemplateIds } } });
  await prisma.notificationPreference.deleteMany({ where: { userId: { in: createdUserIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

describe('B4 — win-back toolkit', () => {
  it('sends to own past customers only and logs the win-back', async () => {
    const c = await caller(owner);
    const res = await c.vendorPortal.sendWinback({
      template: 'restocked',
      customerIds: [customerA, stranger],
      productName: 'سيروم النضارة',
    });
    expect(res.sent).toBe(1);
    expect(res.skipped).toBe(1); // the stranger

    const notifs = await prisma.notification.findMany({
      where: { userId: customerA, type: 'store_winback_restocked' },
    });
    expect(notifs).toHaveLength(1);

    const logs = await prisma.winbackLog.findMany({ where: { vendorId } });
    expect(logs).toHaveLength(1);
    createdWinbackIds.push(logs[0].id);
  });

  it('honors the promotions opt-out (skipped, no notification)', async () => {
    const c = await caller(owner);
    const res = await c.vendorPortal.sendWinback({
      template: 'on_offer',
      customerIds: [customerB],
    });
    expect(res.skipped).toBe(1);
    const notifs = await prisma.notification.findMany({
      where: { userId: customerB, type: 'store_winback_on_offer' },
    });
    expect(notifs).toHaveLength(0);
  });

  it('rate-limits the same customer within 14 days (skipped)', async () => {
    const c = await caller(owner);
    const res = await c.vendorPortal.sendWinback({
      template: 'restocked',
      customerIds: [customerA],
      productName: 'سيروم النضارة',
    });
    expect(res.skipped).toBe(1);
    expect(res.sent).toBe(0);
  });

  it('is ownership-guarded (non-vendors get NOT_FOUND)', async () => {
    const otherU = await prisma.user.create({ data: buildUser() });
    createdUserIds.push(otherU.id);
    const other = await caller({ id: otherU.id, role: 'CUSTOMER', email: otherU.email });
    await expect(
      other.vendorPortal.sendWinback({ template: 'restocked', customerIds: [customerA] }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('rejects invalid templates (BAD_REQUEST)', async () => {
    const c = await caller(owner);
    await expect(
      c.vendorPortal.sendWinback({ template: 'free-text', customerIds: [customerA] }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });
});
