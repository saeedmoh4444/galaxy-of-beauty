/**
 * 6.1a — ZATCA audit trail + compliance dashboard.
 *
 * Every invoice lifecycle event lands in a hash-chained, immutable
 * ZatcaAuditLog row. Covers: GENERATED on generateInvoice, REPORTED /
 * REPORT_FAILED on reportInvoice, chain verification (incl. tamper
 * detection), the admin dashboard totals, and role guards.
 *
 * Fixture invoices are generated from fixture bookings; cleanup is
 * best-effort per step (the audit table may predate the migration when
 * this file first runs).
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';
import type { JwtPayload } from '../lib/jwt';

const CSRF = 'a'.repeat(64);

async function anonCaller() {
  const ctx = await createTRPCContext({ csrfCookie: CSRF, csrfHeader: CSRF });
  return (appRouter as any).createCaller(ctx);
}

async function authCaller(user: JwtPayload) {
  const ctx = await createTRPCContext({ user, csrfCookie: CSRF, csrfHeader: CSRF });
  return (appRouter as any).createCaller(ctx);
}

let admin: JwtPayload;
let customer: JwtPayload;
let technician: JwtPayload;
let serviceId: number;
let addressId: number;
let technicianUserId: number;
let technicianRecordId: number;

let uid = 0;
const newIdemKey = () => `zatca_audit_${Date.now()}_${uid++}`;

async function seedSlot(): Promise<number> {
  const slot = await prisma.availabilitySlot.create({
    data: {
      technicianId: technicianRecordId,
      startAt: new Date(Date.now() + 86400000 * 3),
      endAt: new Date(Date.now() + 86400000 * 3 + 3600000),
      isBooked: false,
    },
  });
  return slot.id;
}

const fixtureBookingIds: number[] = [];

async function createBooking(): Promise<number> {
  const cust = await authCaller(customer);
  const booking = await cust.bookings.create({
    serviceId,
    technicianId: technicianUserId,
    addressId,
    slotId: await seedSlot(),
    startAt: new Date(Date.now() + 86400000 * 3).toISOString(),
    endAt: new Date(Date.now() + 86400000 * 3 + 3600000).toISOString(),
    idempotencyKey: newIdemKey(),
  });
  fixtureBookingIds.push(booking.id);
  return booking.id;
}

beforeAll(async () => {
  const anon = await anonCaller();
  const adminLogin = await anon.auth.login({
    email: 'admin@galaxyofbeauty.sa',
    password: 'Admin@123456',
  });
  admin = { id: adminLogin.user.id, role: adminLogin.user.role, email: adminLogin.user.email };

  const customerLogin = await anon.auth.login({
    email: 'customer@test.com',
    password: 'Admin@123456',
  });
  customer = {
    id: customerLogin.user.id,
    role: customerLogin.user.role,
    email: customerLogin.user.email,
  };

  const tech = await prisma.technician.findFirst({
    include: { user: true },
    where: { user: { role: 'TECHNICIAN' } },
  });
  if (!tech) throw new Error('No technician in seed data');
  technician = { id: tech.userId, role: 'TECHNICIAN', email: tech.user.email };
  technicianUserId = tech.userId;
  technicianRecordId = tech.id;

  const service = await prisma.service.findFirst();
  if (!service) throw new Error('No service in seed data');
  serviceId = service.id;

  const address = await prisma.address.findFirst({ where: { userId: customer.id } });
  addressId =
    address?.id ??
    (
      await prisma.address.create({
        data: {
          userId: customer.id,
          label: 'اختبار الزكاة',
          city: 'الرياض',
          area: 'التجريبي',
          street: 'شارع الاختبار',
        },
      })
    ).id;
}, 30000);

afterAll(async () => {
  try {
    await prisma.zatcaInvoice.deleteMany({
      where: { bookingId: { in: fixtureBookingIds } },
    });
  } catch {
    /* best-effort */
  }
  try {
    await prisma.booking.deleteMany({ where: { id: { in: fixtureBookingIds } } });
  } catch {
    /* best-effort */
  }
});

describe('zatca audit trail', () => {
  it('appends a GENERATED entry when an invoice is created', async () => {
    const bookingId = await createBooking();
    const caller = await authCaller(admin);
    const invoice = await caller.zatca.generateInvoice({ bookingId });

    const entries = await prisma.zatcaAuditLog.findMany({
      where: { invoiceId: invoice.id },
      orderBy: { id: 'asc' },
    });
    expect(entries).toHaveLength(1);
    expect(entries[0]!.event).toBe('GENERATED');
    expect(entries[0]!.actorId).toBe(admin.id);
    expect(entries[0]!.previousHash).toBe('0'.repeat(64)); // genesis link
    expect(entries[0]!.entryHash).toHaveLength(64);
  });

  it('appends REPORT_REQUESTED + REPORTED on a simulated successful report', async () => {
    process.env['ZATCA_SIMULATE'] = 'true';
    try {
      const bookingId = await createBooking();
      const caller = await authCaller(admin);
      const invoice = await caller.zatca.generateInvoice({ bookingId });
      const res = await caller.zatca.reportInvoice({ invoiceId: invoice.id });
      expect(res.success).toBe(true);

      const events = (
        await prisma.zatcaAuditLog.findMany({
          where: { invoiceId: invoice.id },
          orderBy: { id: 'asc' },
        })
      ).map((e) => e.event);
      expect(events).toContain('REPORT_REQUESTED');
      expect(events).toContain('REPORTED');
      expect(events).not.toContain('REPORT_FAILED');
    } finally {
      delete process.env['ZATCA_SIMULATE'];
    }
  });

  it('appends REPORT_FAILED when the API is unreachable and no sim is on', async () => {
    process.env['ZATCA_SIMULATE'] = 'false';
    process.env['ZATCA_API_KEY'] = '';
    process.env['ZATCA_API_SECRET'] = '';
    try {
      const bookingId = await createBooking();
      const caller = await authCaller(admin);
      const invoice = await caller.zatca.generateInvoice({ bookingId });
      const res = await caller.zatca.reportInvoice({ invoiceId: invoice.id });
      expect(res.success).toBe(false);

      const events = (
        await prisma.zatcaAuditLog.findMany({
          where: { invoiceId: invoice.id },
          orderBy: { id: 'asc' },
        })
      ).map((e) => e.event);
      expect(events).toContain('REPORT_FAILED');
    } finally {
      delete process.env['ZATCA_SIMULATE'];
      delete process.env['ZATCA_API_KEY'];
      delete process.env['ZATCA_API_SECRET'];
    }
  });

  it('verifies the hash chain and detects tampering', async () => {
    const bookingId = await createBooking();
    const caller = await authCaller(admin);
    const invoice = await caller.zatca.generateInvoice({ bookingId });

    const ok = await caller.zatca.verifyChain({ invoiceId: invoice.id });
    expect(ok.valid).toBe(true);

    // Tamper with the stored hash — verification must fail.
    const entry = await prisma.zatcaAuditLog.findFirstOrThrow({
      where: { invoiceId: invoice.id },
      orderBy: { id: 'asc' },
    });
    await prisma.zatcaAuditLog.update({
      where: { id: entry.id },
      data: { entryHash: 'f'.repeat(64) },
    });
    try {
      const bad = await caller.zatca.verifyChain({ invoiceId: invoice.id });
      expect(bad.valid).toBe(false);
    } finally {
      // Best-effort restore so later runs stay deterministic.
      await prisma.zatcaAuditLog.update({
        where: { id: entry.id },
        data: { entryHash: entry.entryHash },
      });
    }
  });

  it('exposes a compliance dashboard with totals', async () => {
    const caller = await authCaller(admin);
    const dash = await caller.zatca.dashboard();
    expect(dash.totalInvoices).toBeGreaterThanOrEqual(1);
    expect(dash).toHaveProperty('statusCounts');
    expect(dash).toHaveProperty('totalVatCollected');
    expect(dash).toHaveProperty('clearanceRate');
    expect(dash).toHaveProperty('recentActivity');
    expect(Array.isArray(dash.recentActivity)).toBe(true);
  });

  it('rejects non-admin callers for audit endpoints', async () => {
    const caller = await authCaller(customer);
    await expect(caller.zatca.dashboard()).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(caller.zatca.auditTrail({ invoiceId: 1 })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
    await expect(caller.zatca.verifyChain({ invoiceId: 1 })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });
});
