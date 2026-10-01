/**
 * Mobile error batch contracts (audit 2026-09-30, M2).
 *
 * The customer invoices screen used to call the ADMIN-only
 * zatca.listInvoices (FORBIDDEN, masked by a fake `?? {}` fallback).
 * The new customer-gated zatca.myInvoices must return only the caller's
 * own invoices.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';
import type { JwtPayload } from '../lib/jwt';
import { buildUser, buildCategory, buildService, buildBooking } from './factories';

const CSRF = 'a'.repeat(64);

async function caller(user?: JwtPayload) {
  const ctx = await createTRPCContext({ user, csrfCookie: CSRF, csrfHeader: CSRF });
  return (appRouter as any).createCaller(ctx);
}

let customer: JwtPayload;
let other: JwtPayload;
const created: { users: number[]; bookings: number[]; invoices: number[]; others: number[] } = {
  users: [],
  bookings: [],
  invoices: [],
  others: [],
};

describe('zatca.myInvoices — customer-owned invoices (M2)', () => {
  beforeAll(async () => {
    const u = await prisma.user.create({ data: buildUser() });
    const o = await prisma.user.create({ data: buildUser() });
    customer = { id: u.id, role: 'CUSTOMER', email: u.email };
    other = { id: o.id, role: 'CUSTOMER', email: o.email };
    created.users.push(u.id, o.id);

    const cat = await prisma.category.create({ data: buildCategory() });
    created.others.push(cat.id);
    const svc = await prisma.service.create({ data: buildService({ categoryId: cat.id }) });
    created.others.push(svc.id);

    const addr = await prisma.address.create({
      data: { userId: u.id, label: 'M2-test', city: 'الرياض', area: 'x', street: 'y' },
    });
    const addr2 = await prisma.address.create({
      data: { userId: o.id, label: 'M2-test', city: 'الرياض', area: 'x', street: 'y' },
    });
    created.others.push(addr.id, addr2.id);

    const b1 = await prisma.booking.create({
      data: {
        ...buildBooking({ customerId: u.id, technicianId: o.id, serviceId: svc.id }),
        status: 'REQUESTED',
        addressId: addr.id,
      },
    });
    const b2 = await prisma.booking.create({
      data: {
        ...buildBooking({ customerId: o.id, technicianId: u.id, serviceId: svc.id }),
        status: 'REQUESTED',
        addressId: addr2.id,
      },
    });
    created.bookings.push(b1.id, b2.id);

    const inv1 = await prisma.zatcaInvoice.create({
      data: { bookingId: b1.id, invoiceNumber: `M2-${u.id}-${Date.now()}` },
    });
    const inv2 = await prisma.zatcaInvoice.create({
      data: { bookingId: b2.id, invoiceNumber: `M2-${o.id}-${Date.now()}` },
    });
    created.invoices.push(inv1.id, inv2.id);
  }, 20000);

  afterAll(async () => {
    try {
      await prisma.zatcaInvoice.deleteMany({ where: { id: { in: created.invoices } } });
    } catch {}
    try {
      await prisma.booking.deleteMany({ where: { id: { in: created.bookings } } });
    } catch {}
    try {
      await prisma.address.deleteMany({ where: { id: { in: created.others } } });
    } catch {}
    try {
      await prisma.service.deleteMany({ where: { id: { in: created.others } } });
    } catch {}
    try {
      await prisma.category.deleteMany({ where: { id: { in: created.others } } });
    } catch {}
    try {
      await prisma.user.deleteMany({ where: { id: { in: created.users } } });
    } catch {}
  });

  it('returns only the caller invoices', async () => {
    const c = await caller(customer);
    const mine = await c.zatca.myInvoices({});
    expect(Array.isArray(mine.items)).toBe(true);
    expect(mine.items.length).toBeGreaterThanOrEqual(1);
    for (const inv of mine.items) {
      expect(inv.booking.customer.name).toBeTruthy();
    }
    const invoiceIds = mine.items.map((i: { id: number }) => i.id);
    expect(invoiceIds).toContain(created.invoices[0]);
    expect(invoiceIds).not.toContain(created.invoices[1]);
  });

  it('rejects anonymous access', async () => {
    const anon = await caller();
    await expect(anon.zatca.myInvoices({})).rejects.toThrow();
  });
});
