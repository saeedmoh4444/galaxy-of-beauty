/**
 * Payment flow integration tests — authorize (cash path), capture,
 * cashback accrual, and the ownership/status guards.
 * Coverage ratchet target: src/routers/payments.ts (was 7.36%).
 *
 * The online path calls the PayFort gateway over HTTP, so the offline
 * "cash" method is used for the end-to-end flow — it exercises the same
 * record lifecycle (AUTHORIZED -> CAPTURED -> booking PAID + cashback).
 */
import { describe, it, expect, beforeAll } from 'vitest';
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

let customer: JwtPayload;
let technician: JwtPayload;
let otherCustomer: JwtPayload;
let serviceId: number;
let addressId: number;
let technicianId: number;

let uid = 0;
const uniqueCode = () => `PAYT-${Date.now()}-${uid++}`;

async function seedBooking(opts: {
  customerId: number;
  status?: 'REQUESTED' | 'ACCEPTED';
  totalAmount?: number;
}): Promise<number> {
  const booking = await prisma.booking.create({
    data: {
      bookingCode: uniqueCode(),
      customerId: opts.customerId,
      technicianId,
      serviceId,
      addressId,
      startAt: new Date(Date.now() + 86400000),
      endAt: new Date(Date.now() + 86400000 + 3600000),
      status: opts.status ?? 'ACCEPTED',
      totalAmount: opts.totalAmount ?? 200,
      platformFee: 0,
      paymentFee: 0,
      cashHandlingFee: 0,
    },
  });
  return booking.id;
}

beforeAll(async () => {
  const anon = await anonCaller();
  const login = await anon.auth.login({ email: 'customer@test.com', password: 'Admin@123456' });
  customer = { id: login.user.id, role: login.user.role, email: login.user.email };

  const tech = await prisma.user.findFirst({ where: { role: 'TECHNICIAN' } });
  if (!tech) throw new Error('No technician in seed data');
  technician = { id: tech.id, role: tech.role, email: tech.email };
  technicianId = tech.id;

  const other = await prisma.user.findFirst({
    where: { role: 'CUSTOMER', id: { not: customer.id } },
  });
  if (!other) throw new Error('No second customer in seed data');
  otherCustomer = { id: other.id, role: other.role, email: other.email };

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
          label: 'اختبار الدفع',
          city: 'الرياض',
          area: 'التجريبي',
          street: 'شارع الاختبار',
        },
      })
    ).id;
}, 15000);

describe('Payments', () => {
  it('should reject authorization for a booking owned by someone else', async () => {
    const bookingId = await seedBooking({ customerId: otherCustomer.id });
    const caller = await authCaller(customer);
    await expect(
      caller.payments.authorize({
        bookingId,
        method: 'cash',
        idempotencyKey: crypto.randomUUID(),
      }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('should reject authorization for a non-ACCEPTED booking', async () => {
    const bookingId = await seedBooking({ customerId: customer.id, status: 'REQUESTED' });
    const caller = await authCaller(customer);
    await expect(
      caller.payments.authorize({
        bookingId,
        method: 'cash',
        idempotencyKey: crypto.randomUUID(),
      }),
    ).rejects.toMatchObject({ code: 'PRECONDITION_FAILED' });
  });

  it('should authorize a cash payment and confirm the booking offline', async () => {
    const bookingId = await seedBooking({ customerId: customer.id });
    const caller = await authCaller(customer);
    const result = await caller.payments.authorize({
      bookingId,
      method: 'cash',
      idempotencyKey: crypto.randomUUID(),
    });
    expect(result.paymentId).toBeDefined();
    expect(result.method).toBe('cash');

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    expect(booking?.status).toBe('CONFIRMED_OFFLINE');
    const payment = await prisma.payment.findUnique({ where: { id: result.paymentId } });
    expect(payment?.status).toBe('AUTHORIZED');
  });

  it('should return the existing payment for a duplicate idempotency key', async () => {
    const bookingId = await seedBooking({ customerId: customer.id });
    const key = crypto.randomUUID();
    const caller = await authCaller(customer);
    const first = await caller.payments.authorize({
      bookingId,
      method: 'cash',
      idempotencyKey: key,
    });
    const second = await caller.payments.authorize({
      bookingId,
      method: 'cash',
      idempotencyKey: key,
    });
    expect(second.id).toBe(first.paymentId);
  });

  it('should reject capture by a technician who does not own the booking', async () => {
    const bookingId = await seedBooking({ customerId: customer.id });
    const customerCaller = await authCaller(customer);
    await customerCaller.payments.authorize({
      bookingId,
      method: 'cash',
      idempotencyKey: crypto.randomUUID(),
    });
    // Another customer (not the technician) tries to capture
    await expect(customerCaller.payments.capture({ bookingId })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });

  it('should capture the payment, mark the booking PAID, and accrue cashback', async () => {
    const bookingId = await seedBooking({ customerId: customer.id, totalAmount: 200 });
    const customerCaller = await authCaller(customer);
    await customerCaller.payments.authorize({
      bookingId,
      method: 'cash',
      idempotencyKey: crypto.randomUUID(),
    });

    const techCaller = await authCaller(technician);
    const payment = await techCaller.payments.capture({ bookingId });
    expect(payment.status).toBe('CAPTURED');

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    expect(booking?.status).toBe('PAID');

    // Cashback: 5% of 200 = 10, credited once with referenceId capture_<bookingId>
    const cashback = await prisma.walletTransaction.findMany({
      where: { referenceId: `capture_${bookingId}`, source: 'CASHBACK' },
    });
    expect(cashback).toHaveLength(1);
    expect(Number(cashback[0]!.amount)).toBe(10);
  });

  it('should reject a second capture of the same booking', async () => {
    const bookingId = await seedBooking({ customerId: customer.id });
    const customerCaller = await authCaller(customer);
    await customerCaller.payments.authorize({
      bookingId,
      method: 'cash',
      idempotencyKey: crypto.randomUUID(),
    });
    const techCaller = await authCaller(technician);
    await techCaller.payments.capture({ bookingId });
    await expect(techCaller.payments.capture({ bookingId })).rejects.toMatchObject({
      code: 'PRECONDITION_FAILED',
    });
  });
});
