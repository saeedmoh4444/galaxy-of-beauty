/**
 * A1 — Store staff accounts (VENDOR_PROFESSIONALIZATION_PLAN Wave A).
 * A store owner (or a staff member with STAFF_MANAGE) invites existing
 * users to help run the store. Invitations are PENDING until the invitee
 * accepts; staff rows carry a capability list that gates portal actions.
 * Every management mutation writes a StaffActivityLog row (audit feed).
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser, paidCheckoutForOrder } from './factories';

const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];
const createdStaffIds: number[] = [];
const createdTemplateIds: number[] = [];

let owner: JwtPayload;
let manager: JwtPayload; // staff with STAFF_MANAGE
let clerk: JwtPayload; // plain staff
let invitee: JwtPayload;
let outsider: JwtPayload; // vendor of their own, unrelated
let ownerVendorId: number;
let managerStaffId: number;
let clerkStaffId: number;

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

async function mkVendor(ownerId: number, slug: string) {
  const v = await prisma.vendor.create({
    data: { userId: ownerId, storeName: `V ${slug}`, storeSlug: slug },
  });
  createdVendorIds.push(v.id);
  return v;
}

async function upsertTemplate(key: string, titleEn: string) {
  const t = await prisma.notificationTemplate.upsert({
    where: { key },
    update: {},
    create: {
      key,
      category: 'provider',
      channels: ['in_app'],
      titleJson: { ar: 'عنوان', en: titleEn },
      bodyJson: { ar: 'نص', en: 'body' },
    },
  });
  createdTemplateIds.push(t.id);
  return t;
}

async function notificationsOf(userId: number, type: string) {
  return prisma.notification.findMany({ where: { userId, type } });
}

beforeAll(async () => {
  await upsertTemplate('staff_invited', 'Store Staff Invitation');
  await upsertTemplate('staff_revoked', 'Staff Access Revoked');

  const users = await Promise.all(
    [owner, manager, clerk, invitee, outsider].map(() => prisma.user.create({ data: buildUser() })),
  );
  createdUserIds.push(...users.map((u) => u.id));
  [owner, manager, clerk, invitee, outsider] = users.map((u) => ({
    id: u.id,
    role: 'CUSTOMER',
    email: u.email,
  }));

  const ownerV = await mkVendor(owner.id, `a1-owner-${Date.now()}`);
  ownerVendorId = ownerV.id;
  await mkVendor(outsider.id, `a1-outsider-${Date.now()}`);

  // Manager: STAFF role but carries STAFF_MANAGE in the capability list.
  const managerRow = await prisma.vendorStaff.create({
    data: {
      vendorId: ownerVendorId,
      userId: manager.id,
      role: 'STAFF',
      permissions: ['STAFF_MANAGE', 'ORDERS_MANAGE'],
      status: 'ACTIVE',
      invitedBy: owner.id,
    },
  });
  managerStaffId = managerRow.id;

  // Clerk: plain staff, no management capability.
  const clerkRow = await prisma.vendorStaff.create({
    data: {
      vendorId: ownerVendorId,
      userId: clerk.id,
      role: 'STAFF',
      permissions: ['ORDERS_MANAGE'],
      status: 'ACTIVE',
      invitedBy: owner.id,
    },
  });
  clerkStaffId = clerkRow.id;
  createdStaffIds.push(managerRow.id, clerkRow.id);
}, 20000);

afterAll(async () => {
  await prisma.staffActivityLog.deleteMany({ where: { vendorId: { in: createdVendorIds } } });
  await prisma.vendorStaff.deleteMany({ where: { id: { in: createdStaffIds } } });
  await prisma.notification.deleteMany({ where: { userId: { in: createdUserIds } } });
  await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
  await prisma.notificationTemplate.deleteMany({ where: { id: { in: createdTemplateIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

describe('A1 — store staff accounts', () => {
  it('owner invites an existing user → PENDING row + notification + audit log', async () => {
    const c = await caller(owner);
    const invited = await c.vendorPortal.staff.invite({ email: invitee.email });
    expect(invited.status).toBe('PENDING');
    expect(invited.email).toBe(invitee.email);
    createdStaffIds.push(invited.id);

    const notifs = await notificationsOf(invitee.id, 'staff_invited');
    expect(notifs).toHaveLength(1);

    const logs = await prisma.staffActivityLog.findMany({ where: { vendorId: ownerVendorId } });
    expect(logs.some((l) => l.action === 'INVITE_STAFF' && l.targetId === String(invited.id))).toBe(
      true,
    );
  });

  it('rejects invites to unknown emails (NOT_FOUND)', async () => {
    const c = await caller(owner);
    await expect(
      c.vendorPortal.staff.invite({ email: `nobody-${Date.now()}@example.com` }),
    ).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('owner cannot invite themselves (CONFLICT)', async () => {
    const c = await caller(owner);
    await expect(c.vendorPortal.staff.invite({ email: owner.email })).rejects.toMatchObject({
      code: 'CONFLICT',
    });
  });

  it('cannot invite a user who is ACTIVE staff of another vendor (CONFLICT)', async () => {
    const c = await caller(outsider);
    await expect(c.vendorPortal.staff.invite({ email: manager.email })).rejects.toMatchObject({
      code: 'CONFLICT',
    });
  });

  it('invitee sees their PENDING invitation and accepts → ACTIVE + log', async () => {
    const c = await caller(invitee);
    const inv = await c.vendorPortal.staff.myInvitation();
    expect(inv).toBeTruthy();
    expect(inv.status).toBe('PENDING');
    expect(inv.storeName).toContain('a1-owner');

    const accepted = await c.vendorPortal.staff.accept();
    expect(accepted.status).toBe('ACTIVE');
    expect(await c.vendorPortal.staff.myInvitation()).toBeNull();

    const logs = await prisma.staffActivityLog.findMany({ where: { vendorId: ownerVendorId } });
    expect(logs.some((l) => l.action === 'ACCEPT_INVITE' && l.actorUserId === invitee.id)).toBe(
      true,
    );
  });

  it('decline path: PENDING → REVOKED with a DECLINE_INVITE log', async () => {
    // Owner re-invites the invitee (now ACTIVE → conflict) — use a fresh user.
    const freshU = await prisma.user.create({ data: buildUser() });
    createdUserIds.push(freshU.id);
    await (await caller(owner)).vendorPortal.staff.invite({ email: freshU.email });

    const c = await caller({ id: freshU.id, role: 'CUSTOMER', email: freshU.email });
    await c.vendorPortal.staff.decline();
    expect(await c.vendorPortal.staff.myInvitation()).toBeNull();

    const row = await prisma.vendorStaff.findUnique({ where: { userId: freshU.id } });
    expect(row?.status).toBe('REVOKED');
    const logs = await prisma.staffActivityLog.findMany({ where: { vendorId: ownerVendorId } });
    expect(logs.some((l) => l.action === 'DECLINE_INVITE' && l.targetId === String(row!.id))).toBe(
      true,
    );
  });

  it('plain staff without STAFF_MANAGE cannot list staff (FORBIDDEN)', async () => {
    const c = await caller(clerk);
    await expect(c.vendorPortal.staff.list()).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('manager (STAFF_MANAGE) lists, updates, and revokes staff', async () => {
    const c = await caller(manager);
    const rows = await c.vendorPortal.staff.list();
    expect(rows).toHaveLength(4); // manager, clerk, invitee(ACTIVE), declined(REVOKED)

    const updated = await c.vendorPortal.staff.update({
      staffId: clerkStaffId,
      permissions: ['ORDERS_MANAGE', 'PRODUCTS_MANAGE'],
    });
    expect(updated.permissions).toContain('PRODUCTS_MANAGE');

    const revoked = await c.vendorPortal.staff.revoke({ staffId: clerkStaffId });
    expect(revoked.status).toBe('REVOKED');

    const notifs = await notificationsOf(clerk.id, 'staff_revoked');
    expect(notifs).toHaveLength(1);

    // A revoked staff can no longer act on the portal.
    await expect((await caller(clerk)).vendorPortal.staff.list()).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });

  it('owner can re-invite a REVOKED row → PENDING again (reactivation)', async () => {
    const c = await caller(owner);
    const revived = await c.vendorPortal.staff.invite({ email: clerk.email });
    expect(revived.status).toBe('PENDING');
    createdStaffIds.push(revived.id);
  });

  it('staff.activity is vendor-scoped and owner-readable', async () => {
    const c = await caller(owner);
    const feed = await c.vendorPortal.staff.activity();
    expect(feed.length).toBeGreaterThanOrEqual(5); // invites/accept/decline/update/revoke…
    expect(feed.every((l) => l.vendorId === ownerVendorId)).toBe(true);

    const outsiderFeed = await (await caller(outsider)).vendorPortal.staff.activity();
    expect(outsiderFeed).toHaveLength(0);
  });

  it('outsider cannot update or revoke another vendor’s staff (NOT_FOUND)', async () => {
    const c = await caller(outsider);
    await expect(
      c.vendorPortal.staff.update({ staffId: managerStaffId, role: 'STAFF' }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    await expect(c.vendorPortal.staff.revoke({ staffId: managerStaffId })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });
});

describe('A1 — staff-scoped portal procedures', () => {
  it('ACTIVE staff with ORDERS_MANAGE can list orders but not products (capability gate)', async () => {
    const c = await caller(invitee); // ACTIVE, permissions ['ORDERS_MANAGE']
    const page = await c.vendorPortal.orders({ limit: 20 });
    expect(page.items).toEqual([]);

    await expect(c.vendorPortal.myProducts({ limit: 20 })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
    await expect(
      c.vendorPortal.replyToReview({ reviewId: 1, replyEn: 'Thank you' }),
    ).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });

  it('staff can open the dashboard and myStore resolves to the vendor', async () => {
    const c = await caller(invitee);
    const dash = await c.vendorPortal.dashboard();
    expect(dash.totalProducts).toBe(0); // empty store, but the call succeeds

    const store = await c.vendorPortal.myStore();
    expect(store.id).toBe(ownerVendorId);
  });

  it('non-vendor callers keep legacy empty shapes on queries and NOT_FOUND on mutations', async () => {
    const plainU = await prisma.user.create({ data: buildUser() });
    createdUserIds.push(plainU.id);
    const c = await caller({ id: plainU.id, role: 'CUSTOMER', email: plainU.email });
    // Queries keep the pre-A1 contract: empty pages, not errors.
    const page = await c.vendorPortal.orders({ limit: 20 });
    expect(page.items).toEqual([]);
    const products = await c.vendorPortal.myProducts({ limit: 20 });
    expect(products.items).toEqual([]);
    // Mutations never had an empty contract — NOT_FOUND as before.
    await expect(c.vendorPortal.fulfillOrder({ orderId: 1 })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
    await expect(c.vendorPortal.updateProduct({ id: 1, stock: 1 })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('PENDING (re-invited) staff lose portal access until they accept', async () => {
    // The reactivation test left clerk PENDING again: queries fall back to
    // the empty shape, mutations refuse with NOT_FOUND.
    const c = await caller(clerk);
    const page = await c.vendorPortal.orders({ limit: 20 });
    expect(page.items).toEqual([]);
    await expect(c.vendorPortal.fulfillOrder({ orderId: 1 })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('granting a capability via staff.update unlocks the gated procedure', async () => {
    // Manager has STAFF_MANAGE + ORDERS_MANAGE — no PRODUCTS_MANAGE yet.
    const mgr = await caller(manager);
    await expect(mgr.vendorPortal.myProducts({ limit: 20 })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });

    await (
      await caller(owner)
    ).vendorPortal.staff.update({
      staffId: managerStaffId,
      permissions: ['STAFF_MANAGE', 'ORDERS_MANAGE', 'PRODUCTS_MANAGE'],
    });

    const page = await mgr.vendorPortal.myProducts({ limit: 20 });
    expect(page.items).toEqual([]);
  });

  it('staff fulfilling an order works (ORDERS_MANAGE) and is ownership-scoped', async () => {
    // Seed an order for the owner's vendor, then fulfill it as staff.
    const category = await prisma.productCategory.findFirst({ orderBy: { sortOrder: 'asc' } });
    const product = await prisma.product.create({
      data: {
        vendorId: ownerVendorId,
        categoryId: category!.id,
        nameJson: { ar: 'منتج أ1', en: 'A1 product' },
        descriptionJson: { ar: '', en: '' },
        price: 50,
        stock: 5,
        sales: 0,
        emoji: '🧴',
        images: [],
        isActive: true,
      },
    });
    const order = await prisma.storeOrder.create({
      data: {
        vendorId: ownerVendorId,
        customerId: invitee.id,
        totalAmount: 50,
        itemCount: 1,
        status: 'PENDING_FULFILLMENT',
      },
    });
    // M2 — fulfillOrder requires the order's checkout to exist and be
    // PAID (checked inside the same transaction).
    await paidCheckoutForOrder(order.id);

    const c = await caller(invitee);
    const res = await c.vendorPortal.fulfillOrder({ orderId: order.id });
    expect(res.status).toBe('FULFILLED');

    await prisma.storeOrder.deleteMany({ where: { id: order.id } });
    await prisma.storeCheckout.deleteMany({ where: { customerId: invitee.id } });
    await prisma.product.deleteMany({ where: { id: product.id } });
  });
});
