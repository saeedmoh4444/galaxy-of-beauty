/**
 * 6.1c — ZATCA clearance, REJECTED retries, and env-gated auto-report.
 *
 * Fixture invoices are generated from fixture bookings (seeded
 * customer/technician/service/address); sim mode makes reporting
 * deterministic. Cleanup is best-effort per step.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';
import type { JwtPayload } from '../lib/jwt';
import { safeFutureDate } from './factories';

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
const newIdemKey = () => `zatca_clear_${Date.now()}_${uid++}`;
const fixtureBookingIds: number[] = [];

async function seedSlot(): Promise<number> {
  const slot = await prisma.availabilitySlot.create({
    data: {
      technicianId: technicianRecordId,
      startAt: safeFutureDate(5),
      endAt: new Date(Date.now() + 86400000 * 5 + 3600000),
      isBooked: false,
    },
  });
  return slot.id;
}

async function createBooking(): Promise<number> {
  const cust = await authCaller(customer);
  const booking = await cust.bookings.create({
    serviceId,
    technicianId: technicianUserId,
    addressId,
    slotId: await seedSlot(),
    startAt: safeFutureDate(5).toISOString(),
    endAt: new Date(Date.now() + 86400000 * 5 + 3600000).toISOString(),
    idempotencyKey: newIdemKey(),
  });
  fixtureBookingIds.push(booking.id);
  return booking.id;
}

async function generateInvoice(): Promise<number> {
  const caller = await authCaller(admin);
  const bookingId = await createBooking();
  const invoice = await caller.zatca.generateInvoice({ bookingId });
  return invoice.id;
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
          label: 'اختبار التصفية',
          city: 'الرياض',
          area: 'التجريبي',
          street: 'شارع الاختبار',
        },
      })
    ).id;
}, 30000);

afterAll(async () => {
  try {
    await prisma.zatcaInvoice.deleteMany({ where: { bookingId: { in: fixtureBookingIds } } });
  } catch {
    /* best-effort */
  }
  try {
    await prisma.booking.deleteMany({ where: { id: { in: fixtureBookingIds } } });
  } catch {
    /* best-effort */
  }
});

describe('zatca clearance + retries', () => {
  it('clears a PENDING invoice (simplified flow) and audits CLEARED', async () => {
    const invoiceId = await generateInvoice();
    const caller = await authCaller(admin);
    const res = await caller.zatca.clearInvoice({ invoiceId, clearanceId: 'CLR-1' });
    expect(res.status).toBe('CLEARED');
    expect(res.clearedAt).toBeTruthy();

    const inv = await prisma.zatcaInvoice.findUniqueOrThrow({ where: { id: invoiceId } });
    expect(inv.status).toBe('CLEARED');
    expect(inv.clearanceId).toBe('CLR-1');

    const events = (
      await prisma.zatcaAuditLog.findMany({
        where: { invoiceId },
        orderBy: { id: 'asc' },
      })
    ).map((e) => e.event);
    expect(events).toContain('CLEARED');
  });

  it('clears a REPORTED invoice', async () => {
    process.env['ZATCA_SIMULATE'] = 'true';
    try {
      const invoiceId = await generateInvoice();
      const caller = await authCaller(admin);
      await caller.zatca.reportInvoice({ invoiceId });
      const res = await caller.zatca.clearInvoice({ invoiceId });
      expect(res.status).toBe('CLEARED');
    } finally {
      delete process.env['ZATCA_SIMULATE'];
    }
  });

  it('rejects clearing a CLEARED or REJECTED invoice', async () => {
    const invoiceId = await generateInvoice();
    const caller = await authCaller(admin);
    await caller.zatca.clearInvoice({ invoiceId });
    await expect(caller.zatca.clearInvoice({ invoiceId })).rejects.toMatchObject({
      code: 'BAD_REQUEST',
    });

    const rejectedId = await generateInvoice();
    await prisma.zatcaInvoice.update({
      where: { id: rejectedId },
      data: { status: 'REJECTED' },
    });
    await expect(caller.zatca.clearInvoice({ invoiceId: rejectedId })).rejects.toMatchObject({
      code: 'BAD_REQUEST',
    });
  });

  it('retries a REJECTED invoice on report and stays REJECTED on failure', async () => {
    const invoiceId = await generateInvoice();
    await prisma.zatcaInvoice.update({
      where: { id: invoiceId },
      data: { status: 'REJECTED', errorMessage: 'validation' },
    });

    // Failure path first: no sim, no creds -> stays REJECTED with REPORT_FAILED audit.
    process.env['ZATCA_SIMULATE'] = 'false';
    process.env['ZATCA_API_KEY'] = '';
    process.env['ZATCA_API_SECRET'] = '';
    try {
      const caller = await authCaller(admin);
      const res = await caller.zatca.reportInvoice({ invoiceId });
      expect(res.success).toBe(false);
      const inv = await prisma.zatcaInvoice.findUniqueOrThrow({ where: { id: invoiceId } });
      expect(inv.status).toBe('REJECTED'); // preserved
      const events = (
        await prisma.zatcaAuditLog.findMany({
          where: { invoiceId },
          orderBy: { id: 'asc' },
        })
      ).map((e) => e.event);
      expect(events.filter((e) => e === 'REPORT_FAILED').length).toBe(1);
    } finally {
      delete process.env['ZATCA_SIMULATE'];
      delete process.env['ZATCA_API_KEY'];
      delete process.env['ZATCA_API_SECRET'];
    }

    // Success path: sim mode -> REPORTED.
    process.env['ZATCA_SIMULATE'] = 'true';
    try {
      const caller = await authCaller(admin);
      const res = await caller.zatca.reportInvoice({ invoiceId });
      expect(res.success).toBe(true);
      const inv = await prisma.zatcaInvoice.findUniqueOrThrow({ where: { id: invoiceId } });
      expect(inv.status).toBe('REPORTED');
    } finally {
      delete process.env['ZATCA_SIMULATE'];
    }
  });

  it('auto-reports on generation when ZATCA_AUTO_REPORT is enabled', async () => {
    process.env['ZATCA_AUTO_REPORT'] = 'true';
    process.env['ZATCA_SIMULATE'] = 'true';
    try {
      const bookingId = await createBooking();
      const caller = await authCaller(admin);
      const invoice = await caller.zatca.generateInvoice({ bookingId });
      expect(invoice.status).toBe('REPORTED');
      const inv = await prisma.zatcaInvoice.findUniqueOrThrow({ where: { id: invoice.id } });
      expect(inv.status).toBe('REPORTED');
      const events = (
        await prisma.zatcaAuditLog.findMany({
          where: { invoiceId: invoice.id },
          orderBy: { id: 'asc' },
        })
      ).map((e) => e.event);
      expect(events).toContain('REPORTED');
    } finally {
      delete process.env['ZATCA_AUTO_REPORT'];
      delete process.env['ZATCA_SIMULATE'];
    }
  });

  it('rejects non-admin clearInvoice', async () => {
    const caller = await authCaller(customer);
    await expect(caller.zatca.clearInvoice({ invoiceId: 1 })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });
});
