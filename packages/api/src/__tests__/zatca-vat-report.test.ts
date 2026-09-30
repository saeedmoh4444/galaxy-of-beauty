/**
 * 6.1b — ZATCA VAT reports (monthly/quarterly aggregation + CSV).
 *
 * Fixture invoices are pinned to fixed months (2026-01 / 2026-02) via
 * direct row creation against fixture bookings, so window math is
 * deterministic regardless of seeded data; totals are asserted as >=
 * fixture sums (a long-lived dev DB may hold other invoices in the
 * window).
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';
import type { JwtPayload } from '../lib/jwt';
import { safeFutureDate } from './factories';

const CSRF = 'a'.repeat(64);
const VAT_RATE = 0.15;

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
const newIdemKey = () => `vat_report_${Date.now()}_${uid++}`;
const fixtureBookingIds: number[] = [];
const fixtureInvoiceNumbers: string[] = [];

async function seedSlot(): Promise<number> {
  const slot = await prisma.availabilitySlot.create({
    data: {
      technicianId: technicianRecordId,
      startAt: safeFutureDate(4),
      endAt: new Date(Date.now() + 86400000 * 4 + 3600000),
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
    startAt: safeFutureDate(4).toISOString(),
    endAt: new Date(Date.now() + 86400000 * 4 + 3600000).toISOString(),
    idempotencyKey: newIdemKey(),
  });
  fixtureBookingIds.push(booking.id);
  return booking.id;
}

async function seedInvoice(bookingId: number, number: string, createdAt: Date): Promise<number> {
  const inv = await prisma.zatcaInvoice.create({
    data: {
      bookingId,
      invoiceNumber: number,
      invoiceHash: 'a'.repeat(64),
      cryptographicStamp: 'b'.repeat(64),
      qrCode: 'cQ==',
      status: 'REPORTED',
      reportedAt: createdAt,
      createdAt,
    },
  });
  fixtureInvoiceNumbers.push(number);
  return inv.id;
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
          label: 'اختبار تقارير الضريبة',
          city: 'الرياض',
          area: 'التجريبي',
          street: 'شارع الاختبار',
        },
      })
    ).id;

  await seedInvoice(await createBooking(), `VAT-FIX-${uid++}`, new Date(Date.UTC(2026, 0, 15)));
  await seedInvoice(await createBooking(), `VAT-FIX-${uid++}`, new Date(Date.UTC(2026, 1, 10)));
}, 30000);

afterAll(async () => {
  try {
    await prisma.zatcaInvoice.deleteMany({
      where: { invoiceNumber: { in: fixtureInvoiceNumbers } },
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

describe('zatca VAT reports', () => {
  it('aggregates a monthly window with correct VAT math per row', async () => {
    const caller = await authCaller(admin);
    const rep = await caller.zatca.vatReport({ year: 2026, period: 'monthly', index: 1 });
    expect(rep.window.start).toBe('2026-01-01T00:00:00.000Z');
    expect(rep.window.end).toBe('2026-02-01T00:00:00.000Z');

    const jan = rep.rows.find((r: any) => r.invoiceNumber === fixtureInvoiceNumbers[0]);
    expect(jan).toBeDefined();
    const total = Number(jan!.total);
    const vat = Number(jan!.vat);
    expect(vat).toBeCloseTo((total * VAT_RATE) / (1 + VAT_RATE), 2);
    expect(Number(jan!.subtotal)).toBeCloseTo(total - vat, 2);

    const feb = rep.rows.find((r: any) => r.invoiceNumber === fixtureInvoiceNumbers[1]);
    expect(feb).toBeUndefined(); // February is outside January's window

    expect(rep.totals.count).toBeGreaterThanOrEqual(1);
    expect(rep.totals.vat).toBeGreaterThanOrEqual(Number(jan!.vat));
  });

  it('aggregates quarters (Jan–Mar) and excludes adjacent quarters', async () => {
    const caller = await authCaller(admin);
    const q1 = await caller.zatca.vatReport({ year: 2026, period: 'quarterly', index: 1 });
    const inQ1 = q1.rows.filter((r: any) => fixtureInvoiceNumbers.includes(r.invoiceNumber));
    expect(inQ1).toHaveLength(2);

    const q2 = await caller.zatca.vatReport({ year: 2026, period: 'quarterly', index: 2 });
    const inQ2 = q2.rows.filter((r: any) => fixtureInvoiceNumbers.includes(r.invoiceNumber));
    expect(inQ2).toHaveLength(0);
  });

  it('exports a CSV with a UTF-8 BOM and header', async () => {
    const caller = await authCaller(admin);
    const out = await caller.zatca.vatReportCsv({ year: 2026, period: 'monthly', index: 1 });
    expect(out.csv.charCodeAt(0)).toBe(0xfeff); // BOM
    expect(out.csv).toContain('InvoiceNumber,Date,Status,Subtotal,VAT,Total');
    expect(out.csv).toContain(fixtureInvoiceNumbers[0]);
  });

  it('rejects invalid windows', async () => {
    const caller = await authCaller(admin);
    await expect(
      caller.zatca.vatReport({ year: 2026, period: 'monthly', index: 13 }),
    ).rejects.toThrow();
    await expect(
      caller.zatca.vatReport({ year: 2026, period: 'quarterly', index: 5 }),
    ).rejects.toThrow();
  });

  it('rejects non-admin callers', async () => {
    const caller = await authCaller(customer);
    await expect(
      caller.zatca.vatReport({ year: 2026, period: 'monthly', index: 1 }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(
      caller.zatca.vatReportCsv({ year: 2026, period: 'monthly', index: 1 }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});
