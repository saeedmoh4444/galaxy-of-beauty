import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';
import type { JwtPayload } from '../lib/jwt';
import { buildUser, buildVendor } from './factories';

/**
 * D2 (SELLER_FIRST_CLASS_ROLE_PLAN) — seller-initiated payout requests.
 *
 * Lifecycle: seller requests an amount from the accrued PENDING payouts →
 * admin approves (covered rows flip to COMPLETED with a MANUAL reference
 * — simulate-safe: the admin performs the real bank transfer outside the
 * platform) or rejects with a note. Idempotency key dedupes retries.
 */

const CSRF = 'a'.repeat(64);
const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];

async function caller(user: JwtPayload) {
  const ctx = await createTRPCContext({ user, csrfCookie: CSRF, csrfHeader: CSRF });
  return (
    appRouter as never as { createCaller: (c: unknown) => Record<string, unknown> }
  ).createCaller(ctx);
}

let seller: JwtPayload;
let admin: JwtPayload;
let vendorId: number;
let payoutIds: number[] = [];

beforeAll(async () => {
  const su = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(su.id);
  seller = { id: su.id, role: 'CUSTOMER', email: su.email };
  const sv = await prisma.vendor.create({ data: buildVendor({ userId: su.id }) });
  vendorId = sv.id;
  createdVendorIds.push(sv.id);

  const au = await prisma.user.create({ data: buildUser({ role: 'ADMIN' }) });
  createdUserIds.push(au.id);
  admin = { id: au.id, role: 'ADMIN', email: au.email };

  // Accrued PENDING payouts: 150 + 250 = 400 available.
  const now = new Date();
  const rows = await Promise.all([
    prisma.payout.create({
      data: {
        vendorId: sv.id,
        amount: 150,
        fee: 0,
        periodStart: new Date(now.getTime() - 14 * 86_400_000),
        periodEnd: new Date(now.getTime() - 7 * 86_400_000),
        status: 'PENDING',
      },
    }),
    prisma.payout.create({
      data: {
        vendorId: sv.id,
        amount: 250,
        fee: 0,
        periodStart: new Date(now.getTime() - 7 * 86_400_000),
        periodEnd: now,
        status: 'PENDING',
      },
    }),
  ]);
  payoutIds = rows.map((r) => r.id);
});

afterAll(async () => {
  await prisma.payout.deleteMany({ where: { id: { in: payoutIds } } });
  await prisma.payoutRequest.deleteMany({ where: { vendorId: { in: createdVendorIds } } });
  await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

describe('D2 — seller payout requests', () => {
  it('seller requests a payout within the accrued balance', async () => {
    const c = await caller(seller);
    const res = await c.payouts.requestPayout({
      amount: 120,
      idempotencyKey: 'req-test-1',
    });
    expect((res as { status?: string }).status).toBe('PENDING');
    expect((res as { available?: number }).available).toBeGreaterThanOrEqual(280);
  });

  it('idempotency key dedupes retries — same request, no new row', async () => {
    const c = await caller(seller);
    const first = await c.payouts.requestPayout({
      amount: 120,
      idempotencyKey: 'req-test-2',
    });
    const second = await c.payouts.requestPayout({
      amount: 120,
      idempotencyKey: 'req-test-2',
    });
    expect((first as { id?: number }).id).toBe((second as { id?: number }).id);
    const count = await prisma.payoutRequest.count({ where: { idempotencyKey: 'req-test-2' } });
    expect(count).toBe(1);
  });

  it('rejects amounts above the accrued balance', async () => {
    const c = await caller(seller);
    await expect(
      c.payouts.requestPayout({ amount: 401, idempotencyKey: 'req-test-3' }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });

  it('rejects amounts below the minimum', async () => {
    const c = await caller(seller);
    await expect(
      c.payouts.requestPayout({ amount: 99, idempotencyKey: 'req-test-4' }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });

  it('non-vendor customer cannot request a payout', async () => {
    const cu = await prisma.user.create({ data: buildUser() });
    createdUserIds.push(cu.id);
    const c = await caller({ id: cu.id, role: 'CUSTOMER', email: cu.email });
    await expect(
      c.payouts.requestPayout({ amount: 100, idempotencyKey: 'req-test-5' }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('seller lists their own requests', async () => {
    const c = await caller(seller);
    const res = await c.payouts.listMyRequests();
    const rows = (res as { items?: unknown[] }).items ?? [];
    expect(rows.length).toBeGreaterThanOrEqual(2);
  });

  it('admin approves: covered payout rows flip to COMPLETED with a MANUAL reference', async () => {
    const c = await caller(seller);
    const req = await c.payouts.requestPayout({
      amount: 300,
      idempotencyKey: 'req-test-approve',
    });
    const requestId = (req as { id?: number }).id as number;

    const ca = await caller(admin);
    const res = await ca.payouts.approveRequest({ requestId });
    expect((res as { status?: string }).status).toBe('APPROVED');

    const completed = await prisma.payout.findMany({
      where: { id: { in: payoutIds }, status: 'COMPLETED' },
    });
    const completedSum = completed.reduce((s, p) => s + Number(p.amount), 0);
    expect(completedSum).toBeGreaterThanOrEqual(300);
    for (const p of completed) {
      expect(p.reference).toMatch(/^MANUAL-/);
      expect(p.processedAt).not.toBeNull();
    }
  });

  it('admin cannot approve the same request twice', async () => {
    // Self-contained balance: the shared fixture may already be consumed.
    const row = await prisma.payout.create({
      data: {
        vendorId,
        amount: 100,
        fee: 0,
        periodStart: new Date(Date.now() - 3 * 86_400_000),
        periodEnd: new Date(),
        status: 'PENDING',
      },
    });
    payoutIds.push(row.id);

    const c = await caller(seller);
    const req = await c.payouts.requestPayout({
      amount: 100,
      idempotencyKey: 'req-test-twice',
    });
    const ca = await caller(admin);
    await ca.payouts.approveRequest({ requestId: (req as { id?: number }).id as number });
    await expect(
      ca.payouts.approveRequest({ requestId: (req as { id?: number }).id as number }),
    ).rejects.toMatchObject({ code: 'PRECONDITION_FAILED' });
  });

  it('admin rejects with a note', async () => {
    const row = await prisma.payout.create({
      data: {
        vendorId,
        amount: 100,
        fee: 0,
        periodStart: new Date(Date.now() - 2 * 86_400_000),
        periodEnd: new Date(),
        status: 'PENDING',
      },
    });
    payoutIds.push(row.id);

    const c = await caller(seller);
    const req = await c.payouts.requestPayout({
      amount: 100,
      idempotencyKey: 'req-test-reject',
    });
    const ca = await caller(admin);
    const res = await ca.payouts.rejectRequest({
      requestId: (req as { id?: number }).id as number,
      adminNote: 'KYC missing',
    });
    expect((res as { status?: string }).status).toBe('REJECTED');
    const reqRow = await prisma.payoutRequest.findUnique({
      where: { id: (req as { id?: number }).id as number },
    });
    expect(reqRow?.adminNote).toBe('KYC missing');
  });
});
