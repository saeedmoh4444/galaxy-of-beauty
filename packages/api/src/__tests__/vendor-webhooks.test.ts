/**
 * D1b — vendor webhooks (Wave D): secret shown once (masked afterwards),
 * ownership guards, and the emission seam — checkout and fulfillment fan
 * their events out through enqueueWebhookEvents (mocked here; the
 * delivery itself is exercised by the signing tests + the worker).
 */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { prisma, Prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import crypto from 'crypto';
import { buildUser } from './factories';

vi.mock('../lib/webhookDelivery', async () => {
  const calls: Array<{ event: string; payload: Record<string, unknown> }> = [];
  return {
    enqueueWebhookEvents: vi.fn(async (event: string, payload: Record<string, unknown>) => {
      calls.push({ event, payload });
    }),
    __calls: calls,
  };
});

const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];
const createdProductIds: number[] = [];

let owner: JwtPayload;
let outsider: JwtPayload;
let customer: JwtPayload;
let ownerVendorId: number;
let productId: number;
let webhookId: number;

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

// A5 — buyCart was removed (unpaid orders are gone). Tests purchase
// through the REAL wallet checkout instead.
const SHIPPING = {
  personName: 'Saeed Test',
  mobile: '0500000000',
  lineAddress: 'Test Street 1',
  cityName: 'RIYADH',
  postalCode: '12345',
  countryCode: 'SA',
  shippingMethod: 1 as const,
};

async function buyWithWallet(c: ReturnType<typeof caller>, userId: number) {
  await prisma.wallet.upsert({
    where: { userId },
    create: { userId, balance: new Prisma.Decimal(100000) },
    update: { balance: new Prisma.Decimal(100000) },
  });
  return c.payments.payCart({
    idempotencyKey: crypto.randomUUID(),
    method: 'wallet',
    shipping: SHIPPING,
  });
}

beforeAll(async () => {
  const users = await Promise.all(
    [owner, outsider, customer].map(() => prisma.user.create({ data: buildUser() })),
  );
  createdUserIds.push(...users.map((u) => u.id));
  [owner, outsider, customer] = users.map((u) => ({ id: u.id, role: 'CUSTOMER', email: u.email }));

  const slugBase = `d1b-${Date.now()}`;
  const ownerV = await prisma.vendor.create({
    data: { userId: owner.id, storeName: 'V d1b owner', storeSlug: `${slugBase}-o` },
  });
  const outsiderV = await prisma.vendor.create({
    data: { userId: outsider.id, storeName: 'V d1b outsider', storeSlug: `${slugBase}-x` },
  });
  createdVendorIds.push(ownerV.id, outsiderV.id);
  ownerVendorId = ownerV.id;

  const cat = await prisma.productCategory.findFirst({ orderBy: { sortOrder: 'asc' } });
  const p = await prisma.product.create({
    data: {
      vendorId: ownerVendorId,
      categoryId: cat!.id,
      nameJson: { ar: 'ويب', en: 'Web' },
      descriptionJson: { ar: '', en: '' },
      price: 30,
      stock: 10,
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
  await prisma.vendorWebhook.deleteMany({ where: { vendorId: { in: createdVendorIds } } });
  await prisma.cartItem.deleteMany({ where: { userId: { in: createdUserIds } } });
  await prisma.storeOrderItem.deleteMany({
    where: { order: { vendorId: { in: createdVendorIds } } },
  });
  await prisma.storeOrder.deleteMany({ where: { vendorId: { in: createdVendorIds } } });
  await prisma.notification.deleteMany({ where: { userId: { in: createdUserIds } } });
  await prisma.product.deleteMany({ where: { id: { in: createdProductIds } } });
  await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
  // A5 — wallet purchases create checkouts/wallet rows referencing the
  // customer (onDelete Restrict) — clear before the users go.
  await prisma.storeCheckout.deleteMany({ where: { customerId: { in: createdUserIds } } });
  await prisma.walletTransaction.deleteMany({
    where: { wallet: { userId: { in: createdUserIds } } },
  });
  await prisma.wallet.deleteMany({ where: { userId: { in: createdUserIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
}, 30000);

describe('D1b — vendor webhooks', () => {
  it('createWebhook shows the secret once and the list masks it', async () => {
    const c = await caller(owner);
    const res = await c.vendorPortal.createWebhook({
      url: 'https://erp.example.com/hooks',
      events: ['order.placed', 'stock.low'],
    });
    webhookId = res.webhook.id;
    expect(res.secret).toMatch(/^[0-9a-f]{64}$/);
    expect((res.webhook as Record<string, unknown>).secret).toBeUndefined();

    const list = await c.vendorPortal.webhooks();
    const row = list.find((w: { id: number }) => w.id === webhookId);
    expect(row.secretMasked).toBe(`whsec_${res.secret.slice(-8)}`);
    expect((row as Record<string, unknown>).secret).toBeUndefined();
  });

  it('guards updates and deletes by ownership', async () => {
    const oc = await caller(outsider);
    await expect(
      oc.vendorPortal.updateWebhook({ webhookId, isActive: false }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    await expect(oc.vendorPortal.deleteWebhook({ webhookId })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('updateWebhook edits events and deactivation, deleteWebhook removes', async () => {
    const c = await caller(owner);
    const updated = await c.vendorPortal.updateWebhook({
      webhookId,
      events: ['order.fulfilled'],
      isActive: true,
    });
    expect(updated.events).toEqual(['order.fulfilled']);

    await c.vendorPortal.deleteWebhook({ webhookId });
    const list = await c.vendorPortal.webhooks();
    expect(list.some((w: { id: number }) => w.id === webhookId)).toBe(false);
  });

  it('fans checkout events out through the delivery seam', async () => {
    const c = await caller(owner);
    const res = await c.vendorPortal.createWebhook({
      url: 'https://erp.example.com/hooks2',
      events: ['order.placed'],
    });
    const cart = await caller(customer);
    await cart.marketplace.addToCart({ productId, quantity: 1 });
    await buyWithWallet(cart, customer.id);

    const { enqueueWebhookEvents, __calls } = await import('../lib/webhookDelivery');
    const calls = __calls as Array<{ event: string; payload: Record<string, unknown> }>;
    expect(enqueueWebhookEvents).toHaveBeenCalled();
    const placed = calls.filter((c) => c.event === 'order.placed');
    expect(placed.length).toBeGreaterThan(0);
    expect(placed[0]!.payload.vendorId).toBe(ownerVendorId);
    expect(placed[0]!.payload.orderId).toBeTypeOf('number');
  });
});
