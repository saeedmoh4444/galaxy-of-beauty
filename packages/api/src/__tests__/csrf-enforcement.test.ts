/**
 * Root-level CSRF enforcement (audit B2) — every mutation in the tree
 * must verify the double-submit token when the caller sends a browser
 * Origin, even on procedures that never opted into a *Mutation wrapper.
 * Server-to-server callers (no Origin) keep working unchanged.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';
import type { JwtPayload } from '../lib/jwt';
import { buildUser, buildVendor, buildProduct } from './factories';

const CSRF = 'a'.repeat(64);

async function caller(user: JwtPayload, opts: { csrf?: boolean; origin?: string | null } = {}) {
  const ctx = await createTRPCContext({
    user,
    csrfCookie: opts.csrf === false ? undefined : CSRF,
    csrfHeader: opts.csrf === false ? undefined : CSRF,
    origin: opts.origin === undefined ? null : opts.origin,
  });
  return (appRouter as any).createCaller(ctx);
}

let customer: JwtPayload;
let productId: number;
let vendorId: number;
let categoryId: number;
let userId: number;

beforeAll(async () => {
  const u = await prisma.user.create({ data: buildUser() });
  userId = u.id;
  customer = { id: u.id, role: 'CUSTOMER', email: u.email };
  const v = await prisma.vendor.create({ data: buildVendor({ userId: u.id }) });
  vendorId = v.id;
  const cat = await prisma.productCategory.create({
    data: {
      nameJson: { ar: 'منتجات', en: 'Products' },
      slug: `csrf-cat-${Date.now()}`,
    },
  });
  categoryId = cat.id;
  const p = await prisma.product.create({
    data: buildProduct({ vendorId: v.id, categoryId: cat.id, stock: 50 }),
  });
  productId = p.id;
}, 15000);

afterAll(async () => {
  await prisma.cartItem.deleteMany({ where: { userId } });
  await prisma.product.deleteMany({ where: { id: productId } });
  await prisma.productCategory.deleteMany({ where: { id: categoryId } });
  await prisma.vendor.deleteMany({ where: { id: vendorId } });
  await prisma.user.deleteMany({ where: { id: userId } });
});

describe('root-level CSRF enforcement', () => {
  it('rejects a browser-origin mutation without a token on an unwrapped procedure', async () => {
    // marketplace.addToCart is a bare customerProcedure.input().mutation —
    // never opted into customerMutation — yet it must be CSRF-guarded.
    const c = await caller(customer, { csrf: false, origin: 'https://galaxyofbeauty.sa' });
    await expect(c.marketplace.addToCart({ productId, quantity: 1 })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });

  it('allows the same mutation with a valid token', async () => {
    const c = await caller(customer, { csrf: true, origin: 'https://galaxyofbeauty.sa' });
    const item = await c.marketplace.addToCart({ productId, quantity: 1 });
    expect(item.productId).toBe(productId);
    await prisma.cartItem.deleteMany({ where: { userId, productId } });
  });

  it('keeps server-to-server mutations (no Origin) working without a token', async () => {
    const c = await caller(customer, { csrf: false, origin: null });
    const item = await c.marketplace.addToCart({ productId, quantity: 1 });
    expect(item.productId).toBe(productId);
    await prisma.cartItem.deleteMany({ where: { userId, productId } });
  });
});
