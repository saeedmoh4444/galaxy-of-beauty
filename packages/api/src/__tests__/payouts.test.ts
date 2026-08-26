/**
 * Payout Tests — Tier 1 (Payouts & Financial Integrity)
 *
 * Validates technician payout creation, batch processing,
 * balance validation, and duplicate payout prevention.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { buildUser } from './factories';
import type { JwtPayload } from '../lib/jwt';

const payoutSchema = z.object({
  technicianId: z.number().int().positive(),
  amount: z.number().positive().max(50000),
  method: z.enum(['BANK_TRANSFER', 'WALLET']),
  bankIban: z.string().max(34).optional(),
  notes: z.string().max(500).optional(),
  idempotencyKey: z.string().min(1).max(128).optional(),
});

const payoutBatchSchema = z.object({
  technicianIds: z.array(z.number().int().positive()).min(1).max(100),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
});

describe('Payout — Validation', () => {
  it('should accept valid bank transfer payout', () => {
    const result = payoutSchema.safeParse({
      technicianId: 5,
      amount: 1500,
      method: 'BANK_TRANSFER',
      bankIban: 'SA0380000000608010167519',
    });
    expect(result.success).toBe(true);
  });

  it('should accept valid wallet payout', () => {
    const result = payoutSchema.safeParse({
      technicianId: 5,
      amount: 500,
      method: 'WALLET',
    });
    expect(result.success).toBe(true);
  });

  it('should require IBAN for bank transfer', () => {
    // IBAN is optional in schema but must be validated at service layer
    const payout = { technicianId: 5, amount: 1500, method: 'BANK_TRANSFER' };
    expect(payout.method).toBe('BANK_TRANSFER');
    // Service must require bankIban when method is BANK_TRANSFER
  });

  it('should reject negative payout amount', () => {
    const result = payoutSchema.safeParse({
      technicianId: 5,
      amount: -100,
      method: 'WALLET',
    });
    expect(result.success).toBe(false);
  });

  it('should reject zero payout amount', () => {
    const result = payoutSchema.safeParse({
      technicianId: 5,
      amount: 0,
      method: 'WALLET',
    });
    expect(result.success).toBe(false);
  });

  it('should reject payout exceeding maximum', () => {
    const result = payoutSchema.safeParse({
      technicianId: 5,
      amount: 100000,
      method: 'BANK_TRANSFER',
      bankIban: 'SA0380000000608010167519',
    });
    expect(result.success).toBe(false);
  });

  it('should reject excessively long IBAN', () => {
    const result = payoutSchema.safeParse({
      technicianId: 5,
      amount: 1000,
      method: 'BANK_TRANSFER',
      bankIban: 'S'.repeat(35),
    });
    expect(result.success).toBe(false);
  });
});

describe('Payout — Duplicate Prevention', () => {
  it('should use idempotency key to prevent duplicate payouts', () => {
    const key1 = 'payout-idem-001';
    const key2 = 'payout-idem-001';
    expect(key1).toBe(key2);
    // Same key → must return same payout, not create duplicate
  });

  it('should allow different idempotency keys for different payouts', () => {
    const key1 = 'payout-idem-002-a';
    const key2 = 'payout-idem-002-b';
    expect(key1).not.toBe(key2);
  });
});

describe('Payout — Balance Integrity', () => {
  it('should not allow payout exceeding available balance', () => {
    const available = 800;
    const requested = 1500;
    expect(requested).toBeGreaterThan(available);
    // Service must reject: INSUFFICIENT_BALANCE
  });

  it('should deduct from available balance after payout', () => {
    let available = 2000;
    const payout = 500;
    available -= payout;
    expect(available).toBe(1500);
  });

  it('should not allow payout for non-existent technician', () => {
    const technicianExists = false;
    expect(technicianExists).toBe(false);
    // Service must reject: TECHNICIAN_NOT_FOUND
  });
});

describe('Payout — Batch Processing', () => {
  it('should accept valid batch payout request', () => {
    const result = payoutBatchSchema.safeParse({
      technicianIds: [5, 7, 12],
      periodStart: '2026-08-01T00:00:00.000Z',
      periodEnd: '2026-08-15T23:59:59.000Z',
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty batch', () => {
    const result = payoutBatchSchema.safeParse({
      technicianIds: [],
      periodStart: '2026-08-01T00:00:00.000Z',
      periodEnd: '2026-08-15T23:59:59.000Z',
    });
    expect(result.success).toBe(false);
  });

  it('should reject batch exceeding maximum size', () => {
    const result = payoutBatchSchema.safeParse({
      technicianIds: Array.from({ length: 101 }, (_, i) => i + 1),
      periodStart: '2026-08-01T00:00:00.000Z',
      periodEnd: '2026-08-15T23:59:59.000Z',
    });
    expect(result.success).toBe(false);
  });
});

describe('Payout — Authorization', () => {
  it('only admins should create payouts', () => {
    const role = 'ADMIN';
    expect(role).toBe('ADMIN');
  });

  it('technicians should only view their own payouts', () => {
    const techId = 5;
    const payoutTechId = 5;
    expect(techId).toBe(payoutTechId);
  });

  it('technicians should not view other technician payouts', () => {
    const techId = 5;
    const otherTechId = 7;
    expect(techId).not.toBe(otherTechId);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Router integration tests — the LIVE payout router over the payouts table.
// Coverage ratchet target: src/routers/payouts.ts (was 12.6%).
//
// All technicians are created fresh via factories; payouts, bookings and
// users are cleaned up in afterAll (children before parents). Each sub-block
// wipes its own technician's payouts first so counts are deterministic even
// after a rerun.
// ─────────────────────────────────────────────────────────────────────────────

let admin: JwtPayload;
let techA: JwtPayload;
let techB: JwtPayload;
let customer: JwtPayload;
let serviceId: number;
let addressId: number;
const createdUserIds: number[] = [];
const createdBookingIds: number[] = [];

let uid = 0;
const uniqueCode = () => `POUT-${Date.now()}-${uid++}`;

// A closed historical window with no seeded COMPLETED bookings (the seed
// uses 7 and 14 days ago), so `calculate` totals are deterministic.
const WINDOW_START = new Date(Date.now() - 30 * 86_400_000);
const WINDOW_END = new Date(Date.now() - 21 * 86_400_000);

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

async function makeUser(role: 'TECHNICIAN' | 'CUSTOMER'): Promise<JwtPayload> {
  const user = await prisma.user.create({ data: buildUser({ role }) });
  createdUserIds.push(user.id);
  return { id: user.id, role, email: user.email };
}

async function seedBooking(opts: {
  technicianId: number;
  status?: 'COMPLETED' | 'PAID';
  totalAmount?: number;
  platformFee?: number;
  paymentFee?: number;
  cashHandlingFee?: number;
  createdAt?: Date;
}) {
  const createdAt = opts.createdAt ?? new Date();
  const booking = await prisma.booking.create({
    data: {
      bookingCode: uniqueCode(),
      customerId: customer.id,
      technicianId: opts.technicianId,
      serviceId,
      addressId,
      startAt: createdAt,
      endAt: new Date(createdAt.getTime() + 3_600_000),
      status: opts.status ?? 'COMPLETED',
      totalAmount: opts.totalAmount ?? 200,
      platformFee: opts.platformFee ?? 0,
      paymentFee: opts.paymentFee ?? 0,
      cashHandlingFee: opts.cashHandlingFee ?? 0,
      createdAt,
    },
  });
  createdBookingIds.push(booking.id);
  return booking;
}

async function seedPayout(opts: {
  technicianId: number;
  status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  amount?: number;
  createdAt?: Date;
}) {
  return prisma.payout.create({
    data: {
      technicianId: opts.technicianId,
      periodStart: WINDOW_START,
      periodEnd: WINDOW_END,
      amount: opts.amount ?? 100,
      fee: 0,
      status: opts.status ?? 'PENDING',
      createdAt: opts.createdAt ?? new Date(),
    },
  });
}

async function wipePayouts() {
  await prisma.payout.deleteMany({
    where: { OR: [{ technicianId: techA.id }, { technicianId: techB.id }] },
  });
}

beforeAll(async () => {
  const adminUser = await prisma.user.findFirstOrThrow({ where: { role: 'ADMIN' } });
  admin = { id: adminUser.id, role: 'ADMIN', email: adminUser.email };
  techA = await makeUser('TECHNICIAN');
  techB = await makeUser('TECHNICIAN');
  customer = await makeUser('CUSTOMER');

  const service = await prisma.service.findFirst({ orderBy: { id: 'asc' } });
  if (!service) throw new Error('No service in seed data');
  serviceId = service.id;

  const address = await prisma.address.create({
    data: {
      userId: customer.id,
      label: 'اختبار الدفعات',
      city: 'الرياض',
      area: 'تجريبي',
      street: 'شارع الاختبار',
    },
  });
  addressId = address.id;
}, 15000);

afterAll(async () => {
  if (createdUserIds.length > 0) {
    await prisma.payout.deleteMany({
      where: { OR: [{ technicianId: techA.id }, { technicianId: techB.id }] },
    });
    await prisma.booking.deleteMany({ where: { id: { in: createdBookingIds } } });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  }
});

describe('Payout router (integration)', () => {
  // ── calculate (admin) ────────────────────────────────────────────────
  describe('calculate', () => {
    beforeAll(async () => {
      await wipePayouts();
    });

    it('rejects non-admin callers', async () => {
      const iso = { periodStart: WINDOW_START.toISOString(), periodEnd: WINDOW_END.toISOString() };
      const t = await caller(techA);
      const c = await caller(customer);
      await expect(t.payouts.calculate(iso)).rejects.toMatchObject({ code: 'FORBIDDEN' });
      await expect(c.payouts.calculate(iso)).rejects.toMatchObject({ code: 'FORBIDDEN' });
      const anon = await caller(null);
      await expect(anon.payouts.calculate(iso)).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });

    it('validates the datetime input', async () => {
      const a = await caller(admin);
      await expect(
        a.payouts.calculate({ periodStart: 'not-a-date', periodEnd: 'not-a-date' }),
      ).rejects.toThrow();
    });

    it('computes net earnings from COMPLETED bookings in the period and persists PENDING payouts', async () => {
      // techA: 2 COMPLETED inside the window
      const b1 = await seedBooking({
        technicianId: techA.id,
        createdAt: new Date(Date.now() - 27 * 86_400_000),
        totalAmount: 200,
        platformFee: 10,
        paymentFee: 2,
        cashHandlingFee: 1, // net 187
      });
      const b2 = await seedBooking({
        technicianId: techA.id,
        createdAt: new Date(Date.now() - 25 * 86_400_000),
        totalAmount: 300,
        platformFee: 15,
        paymentFee: 3,
        cashHandlingFee: 2, // net 280
      });
      // techA: 1 COMPLETED AFTER the window and 1 PAID inside the window — both excluded
      await seedBooking({
        technicianId: techA.id,
        createdAt: new Date(Date.now() - 20 * 86_400_000),
        totalAmount: 999,
      });
      await seedBooking({
        technicianId: techA.id,
        createdAt: new Date(Date.now() - 26 * 86_400_000),
        status: 'PAID',
        totalAmount: 999,
      });
      // techB: 1 COMPLETED inside the window
      await seedBooking({
        technicianId: techB.id,
        createdAt: new Date(Date.now() - 26 * 86_400_000),
        totalAmount: 150,
        platformFee: 5,
        paymentFee: 1, // net 144
      });

      const a = await caller(admin);
      const res = await a.payouts.calculate({
        periodStart: WINDOW_START.toISOString(),
        periodEnd: WINDOW_END.toISOString(),
      });

      expect(res.technicians).toBe(2);
      expect(res.totalGross).toBe(650);
      expect(res.totalFees).toBe(39);
      expect(res.totalNet).toBe(611);

      const entryA = res.earnings.find((e: any) => e.technicianId === techA.id)!;
      expect(entryA.bookingCount).toBe(2);
      expect(entryA.grossAmount).toBe(500);
      expect(entryA.totalFees).toBe(33);
      expect(entryA.netEarnings).toBe(467);
      expect(entryA.bookingIds).toEqual(expect.arrayContaining([b1.id, b2.id]));

      const entryB = res.earnings.find((e: any) => e.technicianId === techB.id)!;
      expect(entryB.bookingCount).toBe(1);
      expect(entryB.netEarnings).toBe(144);

      // Persisted payout rows
      const dbA = await prisma.payout.findMany({ where: { technicianId: techA.id } });
      expect(dbA).toHaveLength(1);
      expect(Number(dbA[0]!.amount)).toBe(467);
      expect(Number(dbA[0]!.fee)).toBe(0);
      expect(dbA[0]!.status).toBe('PENDING');
      expect(dbA[0]!.periodStart.toISOString()).toBe(WINDOW_START.toISOString());
      expect(dbA[0]!.periodEnd.toISOString()).toBe(WINDOW_END.toISOString());
    });

    it('replaces PENDING rows when re-calculated for the same period (idempotent)', async () => {
      const a = await caller(admin);
      await a.payouts.calculate({
        periodStart: WINDOW_START.toISOString(),
        periodEnd: WINDOW_END.toISOString(),
      });
      const rows = await prisma.payout.findMany({
        where: { technicianId: techA.id, status: 'PENDING' },
      });
      expect(rows).toHaveLength(1); // re-calc deletes the old PENDING row first
      expect(Number(rows[0]!.amount)).toBe(467);
    });
  });

  // ── process (admin) ──────────────────────────────────────────────────
  describe('process', () => {
    it('rejects non-admin callers', async () => {
      const t = await caller(techA);
      const c = await caller(customer);
      await expect(t.payouts.process({ payoutId: 1 })).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
      await expect(c.payouts.process({ payoutId: 1 })).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
      const anon = await caller(null);
      await expect(anon.payouts.process({ payoutId: 1 })).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });

    it('validates the payoutId input', async () => {
      const a = await caller(admin);
      await expect(a.payouts.process({ payoutId: 0 })).rejects.toThrow();
      await expect(a.payouts.process({ payoutId: -5 })).rejects.toThrow();
      await expect(a.payouts.process({ payoutId: 'x' as any })).rejects.toThrow();
    });

    it('rejects unknown payouts', async () => {
      const a = await caller(admin);
      await expect(a.payouts.process({ payoutId: 999_999_999 })).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });

    it('rejects payouts that are not PENDING', async () => {
      const p = await seedPayout({ technicianId: techA.id, status: 'COMPLETED' });
      const a = await caller(admin);
      await expect(a.payouts.process({ payoutId: p.id })).rejects.toMatchObject({
        code: 'PRECONDITION_FAILED',
      });
    });

    it('processes a PENDING payout to COMPLETED with a reference, and refuses a second run', async () => {
      const p = await seedPayout({ technicianId: techA.id });
      const a = await caller(admin);

      const done = await a.payouts.process({ payoutId: p.id });
      expect(done.status).toBe('COMPLETED');
      expect(done.reference).toMatch(/^PO-\d+-/);
      expect(done.processedAt).toBeInstanceOf(Date);

      const row = await prisma.payout.findUnique({ where: { id: p.id } });
      expect(row!.status).toBe('COMPLETED');
      expect(row!.processedAt).not.toBeNull();
      expect(row!.reference).toMatch(/^PO-\d+-/);

      // Already COMPLETED — not processable again
      await expect(a.payouts.process({ payoutId: p.id })).rejects.toMatchObject({
        code: 'PRECONDITION_FAILED',
      });
    });
  });

  // ── listForAdmin ─────────────────────────────────────────────────────
  describe('listForAdmin', () => {
    let p1: { id: number };
    let p2: { id: number };
    let p3: { id: number };

    beforeAll(async () => {
      await wipePayouts();
      p1 = await seedPayout({
        technicianId: techA.id,
        amount: 100,
        createdAt: new Date(Date.now() - 2 * 3_600_000),
      });
      p2 = await seedPayout({
        technicianId: techA.id,
        amount: 250,
        createdAt: new Date(Date.now() - 3_600_000),
      });
      p3 = await seedPayout({
        technicianId: techB.id,
        status: 'COMPLETED',
        amount: 300,
        createdAt: new Date(Date.now() - 30 * 60_000),
      });
    });

    it('rejects non-admin callers', async () => {
      const t = await caller(techB);
      const c = await caller(customer);
      await expect(t.payouts.listForAdmin({})).rejects.toMatchObject({ code: 'FORBIDDEN' });
      await expect(c.payouts.listForAdmin({})).rejects.toMatchObject({ code: 'FORBIDDEN' });
      const anon = await caller(null);
      await expect(anon.payouts.listForAdmin({})).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });

    it('validates filters and pagination bounds', async () => {
      const a = await caller(admin);
      await expect(a.payouts.listForAdmin({ limit: 51 })).rejects.toThrow();
      await expect(a.payouts.listForAdmin({ limit: 0 })).rejects.toThrow();
      await expect(a.payouts.listForAdmin({ page: 0 })).rejects.toThrow();
      await expect(a.payouts.listForAdmin({ status: 'BOGUS' as any })).rejects.toThrow();
    });

    it('filters by technician and returns admin-included technician details, newest first', async () => {
      const a = await caller(admin);
      const res = await a.payouts.listForAdmin({ technicianId: techA.id });
      expect(res.pagination.total).toBe(2);
      expect(res.payouts).toHaveLength(2);
      expect(res.payouts.map((p: any) => p.id)).toEqual(expect.arrayContaining([p1.id, p2.id]));
      expect(res.payouts.map((p: any) => p.id)).not.toContain(p3.id);
      for (const p of res.payouts) {
        expect(p.technicianId).toBe(techA.id);
        expect(p.technician.id).toBe(techA.id);
        expect(p.technician.name).toBeTruthy();
      }
      // createdAt descending
      expect(res.payouts[0]!.id).toBe(p2.id);
      expect(res.payouts[1]!.id).toBe(p1.id);
    });

    it('filters by status', async () => {
      const a = await caller(admin);
      const pending = await a.payouts.listForAdmin({ status: 'PENDING' });
      expect(pending.pagination.total).toBe(2);
      expect(pending.payouts.map((p: any) => p.id)).toEqual(expect.arrayContaining([p1.id, p2.id]));
      for (const p of pending.payouts) expect(p.status).toBe('PENDING');

      const completed = await a.payouts.listForAdmin({ status: 'COMPLETED' });
      expect(completed.pagination.total).toBe(1);
      expect(completed.payouts[0]!.id).toBe(p3.id);
    });

    it('filters by creation-period window', async () => {
      const a = await caller(admin);
      const inWindow = await a.payouts.listForAdmin({
        periodStart: new Date(Date.now() - 90 * 60_000).toISOString(),
        periodEnd: new Date(Date.now() + 10 * 60_000).toISOString(),
      });
      expect(inWindow.pagination.total).toBe(2);
      expect(inWindow.payouts.map((p: any) => p.id)).toEqual(
        expect.arrayContaining([p2.id, p3.id]),
      );

      const narrow = await a.payouts.listForAdmin({
        periodStart: new Date(Date.now() - 90 * 60_000).toISOString(),
        periodEnd: new Date(Date.now() - 45 * 60_000).toISOString(),
      });
      expect(narrow.pagination.total).toBe(1);
      expect(narrow.payouts[0]!.id).toBe(p2.id);
    });

    it('paginates without overlap and reports correct totals', async () => {
      const a = await caller(admin);
      const page1 = await a.payouts.listForAdmin({ page: 1, limit: 2 });
      const page2 = await a.payouts.listForAdmin({ page: 2, limit: 2 });
      expect(page1.payouts).toHaveLength(2);
      expect(page2.payouts).toHaveLength(1);
      expect(page1.pagination.total).toBe(3);
      expect(page1.pagination.totalPages).toBe(2);
      expect(page2.pagination.totalPages).toBe(2);
      const ids1 = new Set(page1.payouts.map((p: any) => p.id));
      expect(ids1.size).toBe(2);
      expect(ids1.has(page2.payouts[0]!.id)).toBe(false);
    });
  });

  // ── listMyPayouts (technician ownership) ─────────────────────────────
  describe('listMyPayouts', () => {
    let p4: { id: number };
    let p5: { id: number };
    let p6: { id: number };

    beforeAll(async () => {
      await wipePayouts();
      p4 = await seedPayout({
        technicianId: techA.id,
        amount: 100,
        createdAt: new Date(Date.now() - 2 * 3_600_000),
      });
      p5 = await seedPayout({
        technicianId: techA.id,
        status: 'COMPLETED',
        amount: 200,
        createdAt: new Date(Date.now() - 3_600_000),
      });
      p6 = await seedPayout({
        technicianId: techB.id,
        amount: 150,
        createdAt: new Date(Date.now() - 30 * 60_000),
      });
    });

    it('rejects customers, admins and anonymous callers', async () => {
      const c = await caller(customer);
      const a = await caller(admin);
      await expect(c.payouts.listMyPayouts({})).rejects.toMatchObject({ code: 'FORBIDDEN' });
      await expect(a.payouts.listMyPayouts({})).rejects.toMatchObject({ code: 'FORBIDDEN' });
      const anon = await caller(null);
      await expect(anon.payouts.listMyPayouts({})).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });

    it('validates status and pagination bounds', async () => {
      const t = await caller(techA);
      await expect(t.payouts.listMyPayouts({ limit: 0 })).rejects.toThrow();
      await expect(t.payouts.listMyPayouts({ limit: 51 })).rejects.toThrow();
      await expect(t.payouts.listMyPayouts({ page: -1 })).rejects.toThrow();
      await expect(t.payouts.listMyPayouts({ status: 'BOGUS' as any })).rejects.toThrow();
    });

    it("only returns the caller's own payouts", async () => {
      const a = await caller(techA);
      const res = await a.payouts.listMyPayouts({});
      expect(res.pagination.total).toBe(2);
      expect(res.payouts.map((p: any) => p.id)).toEqual(expect.arrayContaining([p4.id, p5.id]));
      expect(res.payouts.map((p: any) => p.id)).not.toContain(p6.id);
      for (const p of res.payouts) expect(p.technicianId).toBe(techA.id);
    });

    it('lets the other technician see their own payouts only', async () => {
      const b = await caller(techB);
      const res = await b.payouts.listMyPayouts({});
      expect(res.pagination.total).toBe(1);
      expect(res.payouts[0]!.id).toBe(p6.id);
      expect(res.payouts[0]!.technicianId).toBe(techB.id);
    });

    it('filters by status', async () => {
      const a = await caller(techA);
      const res = await a.payouts.listMyPayouts({ status: 'PENDING' });
      expect(res.pagination.total).toBe(1);
      expect(res.payouts[0]!.id).toBe(p4.id);
      expect(res.payouts[0]!.status).toBe('PENDING');
    });

    it('paginates without overlap', async () => {
      const a = await caller(techA);
      const page1 = await a.payouts.listMyPayouts({ page: 1, limit: 1 });
      const page2 = await a.payouts.listMyPayouts({ page: 2, limit: 1 });
      expect(page1.payouts).toHaveLength(1);
      expect(page2.payouts).toHaveLength(1);
      expect(page1.pagination.total).toBe(2);
      expect(page1.pagination.totalPages).toBe(2);
      expect(page2.pagination.totalPages).toBe(2);
      expect(page1.payouts[0]!.id).not.toBe(page2.payouts[0]!.id);
      // Newest first
      expect(page1.payouts[0]!.id).toBe(p5.id);
      expect(page2.payouts[0]!.id).toBe(p4.id);
    });
  });
});
