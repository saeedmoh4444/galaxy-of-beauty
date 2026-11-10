import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import {
  router,
  customerProcedure,
  technicianProcedure,
  adminProcedure,
  sellerProcedure,
} from '../trpc';
import { createTRPCContext } from '../context';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

/**
 * R2 (SELLER_FIRST_CLASS_ROLE_PLAN) — gate matrix for the SELLER role.
 *
 * Sellers keep full customer access (customerProcedure accepts both), get
 * a dedicated sellerProcedure, and stay out of technician/admin lanes.
 */

const CSRF = 'a'.repeat(64);

const gateRouter = router({
  customerOnly: customerProcedure.query(() => 'ok'),
  sellerOnly: sellerProcedure.query(() => 'ok'),
  technicianOnly: technicianProcedure.query(() => 'ok'),
  adminOnly: adminProcedure.query(() => 'ok'),
});

async function caller(user: JwtPayload) {
  const ctx = await createTRPCContext({ user, csrfCookie: CSRF, csrfHeader: CSRF });
  return (
    gateRouter as never as { createCaller: (c: unknown) => Record<string, unknown> }
  ).createCaller(ctx);
}

const createdUserIds: number[] = [];
let seller: JwtPayload;
let customer: JwtPayload;
let technician: JwtPayload;
let admin: JwtPayload;

beforeAll(async () => {
  const mk = async (role: 'CUSTOMER' | 'SELLER' | 'TECHNICIAN' | 'ADMIN') => {
    const u = await prisma.user.create({ data: buildUser({ role }) });
    createdUserIds.push(u.id);
    return { id: u.id, role, email: u.email } as JwtPayload;
  };
  seller = await mk('SELLER');
  customer = await mk('CUSTOMER');
  technician = await mk('TECHNICIAN');
  admin = await mk('ADMIN');
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

async function expectAllowed(fn: () => Promise<unknown>) {
  await expect(fn()).resolves.toBe('ok');
}

async function expectForbidden(fn: () => Promise<unknown>) {
  await expect(fn()).rejects.toMatchObject({ code: 'FORBIDDEN' });
}

describe('SELLER role gate matrix (R2)', () => {
  it('seller passes customer procedures (sellers are customers too)', async () => {
    const c = await caller(seller);
    await expectAllowed(() => c.customerOnly());
  });

  it('seller passes seller procedures', async () => {
    const c = await caller(seller);
    await expectAllowed(() => c.sellerOnly());
  });

  it('seller is denied technician and admin procedures', async () => {
    const c = await caller(seller);
    await expectForbidden(() => c.technicianOnly());
    await expectForbidden(() => c.adminOnly());
  });

  it('customer is denied seller procedures', async () => {
    const c = await caller(customer);
    await expectForbidden(() => c.sellerOnly());
  });

  it('technician and admin are denied seller procedures', async () => {
    const ct = await caller(technician);
    const ca = await caller(admin);
    await expectForbidden(() => ct.sellerOnly());
    await expectForbidden(() => ca.sellerOnly());
  });

  it('legacy roles are untouched: technician/admin keep their lanes', async () => {
    const ct = await caller(technician);
    const ca = await caller(admin);
    await expectAllowed(() => ct.technicianOnly());
    await expectAllowed(() => ca.adminOnly());
    await expectForbidden(() => ca.technicianOnly());
  });
});
