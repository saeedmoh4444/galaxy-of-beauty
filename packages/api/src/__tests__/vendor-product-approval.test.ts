/**
 * C2 — Listing approval pipeline (VENDOR_DASHBOARD_ENHANCEMENT_PLAN).
 * Relaxed (default, flag off): new products are LIVE immediately — current
 * behavior preserved. Strict (LISTING_APPROVAL_STRICT on): addProduct
 * creates a PENDING product + a kind-'product' ProviderSubmission; the
 * product stays hidden from storefronts until admin approves (LIVE) or is
 * rejected with a note (REJECTED, shown in the portal).
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

const createdUserIds: number[] = [];
const createdSubmissionIds: number[] = [];

let vendorOwner: JwtPayload;
let admin: JwtPayload;
let vendorId: number;
let catId: number;

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

/** Read the listing-approval flag directly. */
async function strictFlag(): Promise<boolean> {
  const f = await prisma.featureFlag.findUnique({ where: { key: 'LISTING_APPROVAL_STRICT' } });
  return f?.enabled ?? false;
}

async function setStrict(enabled: boolean): Promise<void> {
  await prisma.featureFlag.upsert({
    where: { key: 'LISTING_APPROVAL_STRICT' },
    update: { enabled },
    create: {
      key: 'LISTING_APPROVAL_STRICT',
      name: 'Listing Approval (strict)',
      enabled,
      rolloutPercent: 100,
    },
  });
}

beforeAll(async () => {
  const ownerU = await prisma.user.create({ data: buildUser() });
  const adminU = await prisma.user.create({ data: buildUser({ role: 'ADMIN' }) });
  createdUserIds.push(ownerU.id, adminU.id);
  vendorOwner = { id: ownerU.id, role: 'CUSTOMER', email: ownerU.email };
  admin = { id: adminU.id, role: 'ADMIN', email: adminU.email };

  const vendor = await prisma.vendor.create({
    data: { userId: ownerU.id, storeName: 'Approval Store', storeSlug: `apr-${Date.now()}` },
  });
  vendorId = vendor.id;
  const cat = await prisma.productCategory.create({
    data: { nameJson: { ar: 'عناصر', en: 'Items' }, slug: `apr-cat-${Date.now()}` },
  });
  catId = cat.id;
}, 15000);

afterAll(async () => {
  await prisma.providerSubmission.deleteMany({ where: { id: { in: createdSubmissionIds } } });
  await prisma.product.deleteMany({ where: { vendor: { userId: { in: createdUserIds } } } });
  await prisma.productCategory.deleteMany({ where: { id: catId } });
  await prisma.vendor.deleteMany({ where: { userId: { in: createdUserIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  await setStrict(false);
});

describe('C2 — listing approval', () => {
  it('relaxed (flag off): addProduct publishes LIVE with no submission', async () => {
    await setStrict(false);
    const c = await caller(vendorOwner);
    const p = await c.vendorPortal.addProduct({ nameAr: 'غسول', price: 30, stock: 5 });

    expect(p.approvalStatus).toBe('LIVE');
    const subs = await prisma.providerSubmission.findMany({
      where: { kind: 'product', providerId: vendorOwner.id },
    });
    expect(subs).toHaveLength(0);
  });

  it('strict (flag on): addProduct creates PENDING + a kind-product submission', async () => {
    await setStrict(true);
    const c = await caller(vendorOwner);
    const p = await c.vendorPortal.addProduct({ nameAr: 'سيروم', price: 90, stock: 3 });

    expect(p.approvalStatus).toBe('PENDING');
    const row = await prisma.product.findUnique({ where: { id: p.id } });
    expect(row?.approvalStatus).toBe('PENDING');

    const subs = await prisma.providerSubmission.findMany({
      where: { kind: 'product', providerId: vendorOwner.id, status: 'PENDING_REVIEW' },
    });
    expect(subs).toHaveLength(1);
    createdSubmissionIds.push(subs[0]!.id);
    const payload = subs[0]!.payload as { productId: number };
    expect(payload.productId).toBe(p.id);
  });

  it('strict: PENDING products stay hidden from the storefront', async () => {
    const pub = (appRouter as any).createCaller({ user: null, ip: '127.0.0.1' });
    const listing = await pub.marketplace.products({ vendorId });
    expect(
      listing.items.find((p: { approvalStatus: string }) => p.approvalStatus === 'PENDING'),
    ).toBeUndefined();
    const detail = await pub.marketplace.vendorDetail({
      slug: (await prisma.vendor.findUniqueOrThrow({ where: { id: vendorId } })).storeSlug,
    });
    expect(
      detail.products.find((p: { approvalStatus: string }) => p.approvalStatus === 'PENDING'),
    ).toBeUndefined();
  });

  it('admin approve → LIVE and visible on the storefront', async () => {
    const sub = await prisma.providerSubmission.findFirstOrThrow({
      where: { kind: 'product', providerId: vendorOwner.id, status: 'PENDING_REVIEW' },
    });
    const productId = (sub.payload as { productId: number }).productId;

    const a = await caller(admin);
    await a.providerReview.decide({ id: sub.id, approve: true });

    const updated = await prisma.product.findUnique({ where: { id: productId } });
    expect(updated?.approvalStatus).toBe('LIVE');

    const pub = (appRouter as any).createCaller({ user: null, ip: '127.0.0.1' });
    const listing = await pub.marketplace.products({ vendorId });
    expect(listing.items.find((p: { id: number }) => p.id === productId)).toBeDefined();
  });

  it('admin reject → REJECTED with the note shown in the portal rows', async () => {
    const c = await caller(vendorOwner);
    const p = await c.vendorPortal.addProduct({ nameAr: 'قناع', price: 45, stock: 2 });
    expect(p.approvalStatus).toBe('PENDING');

    const sub = await prisma.providerSubmission.findFirstOrThrow({
      where: { kind: 'product', providerId: vendorOwner.id, status: 'PENDING_REVIEW' },
    });
    createdSubmissionIds.push(sub.id);
    const a = await caller(admin);
    await a.providerReview.decide({ id: sub.id, approve: false, notes: 'Missing SFDA details' });

    const row = await prisma.product.findUnique({ where: { id: p.id } });
    expect(row?.approvalStatus).toBe('REJECTED');
    expect(row?.reviewNotes).toBe('Missing SFDA details');

    const rows = await c.vendorPortal.myProducts({ limit: 20 });
    const mine = rows.items.find((r: { id: number }) => r.id === p.id);
    expect(mine?.approvalStatus).toBe('REJECTED');
    expect(mine?.reviewNotes).toBe('Missing SFDA details');
  });

  it('decide rejects a double decision', async () => {
    const sub = await prisma.providerSubmission.findFirstOrThrow({
      where: { kind: 'product', providerId: vendorOwner.id, status: 'REJECTED' },
    });
    const a = await caller(admin);
    await expect(a.providerReview.decide({ id: sub.id, approve: true })).rejects.toMatchObject({
      code: 'BAD_REQUEST',
    });
  });
});
