/**
 * C1 (PLATFORM_IMPROVEMENT_PLAN) — payment reconciliation.
 *
 * With no Fatoorah token the scan reports not-configured (CI default);
 * with a token + simulate mode the gateway answers Paid, so the diff
 * logic is fully exercised without a live key.
 */
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { prisma } from '@galaxy/db';
import { buildUser, buildBooking } from './factories';
import { reconcileRecentPayments } from '../lib/reconciliation';

const createdUserIds: number[] = [];
const createdBookingIds: number[] = [];
const createdPaymentIds: number[] = [];

const ORIGINAL_TOKEN = process.env['FATOORAH_API_TOKEN'];
const ORIGINAL_SIMULATE = process.env['FATOORAH_SIMULATE'];

beforeAll(async () => {
  const customer = await prisma.user.create({ data: buildUser() });
  const technician = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(customer.id, technician.id);
});

afterAll(async () => {
  await prisma.payment.deleteMany({ where: { id: { in: createdPaymentIds } } });
  await prisma.booking.deleteMany({ where: { id: { in: createdBookingIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

afterEach(() => {
  if (ORIGINAL_TOKEN === undefined) delete process.env['FATOORAH_API_TOKEN'];
  else process.env['FATOORAH_API_TOKEN'] = ORIGINAL_TOKEN;
  if (ORIGINAL_SIMULATE === undefined) delete process.env['FATOORAH_SIMULATE'];
  else process.env['FATOORAH_SIMULATE'] = ORIGINAL_SIMULATE;
});

async function makePayment(status: string): Promise<number> {
  const address = await prisma.address.create({
    data: {
      userId: createdUserIds[0]!,
      label: 'تسوية',
      city: 'الرياض',
      area: 'التجريبي',
      street: 'شارع الاختبار',
    },
  });
  const service = await prisma.service.findFirst();
  const base = buildBooking({
    customerId: createdUserIds[0]!,
    technicianId: createdUserIds[1]!,
    serviceId: service!.id,
    status: 'PAYMENT_AUTHORIZED',
  });
  // Prisma 7: relation objects win over scalar FK fields — drop the scalars.
  const { customerId, technicianId, serviceId: _svc, ...rest } = base;
  const booking = await prisma.booking.create({
    data: {
      ...rest,
      customer: { connect: { id: createdUserIds[0]! } },
      technician: { connect: { id: createdUserIds[1]! } },
      service: { connect: { id: service!.id } },
      address: { connect: { id: address.id } },
    },
  });
  createdBookingIds.push(booking.id);
  const payment = await prisma.payment.create({
    data: {
      booking: { connect: { id: booking.id } },
      amount: 100,
      gatewayRef: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      status: status as never,
    },
  });
  createdPaymentIds.push(payment.id);
  return payment.id;
}

describe('payment reconciliation', () => {
  it('reports not-configured without a Fatoorah token', async () => {
    delete process.env['FATOORAH_API_TOKEN'];
    delete process.env['FATOORAH_SIMULATE'];
    const result = await reconcileRecentPayments(36);
    expect(result.configured).toBe(false);
    expect(result.checked).toBe(0);
  });

  it('is clean when local CAPTURED matches the gateway Paid', async () => {
    process.env['FATOORAH_SIMULATE'] = 'true';
    const id = await makePayment('CAPTURED');
    const result = await reconcileRecentPayments(36);
    expect(result.configured).toBe(true);
    expect(result.mismatches.filter((m) => m.paymentId === id)).toHaveLength(0);
  });

  it('flags a local AUTHORIZED row when the gateway says Paid', async () => {
    process.env['FATOORAH_SIMULATE'] = 'true';
    const id = await makePayment('AUTHORIZED');
    const result = await reconcileRecentPayments(36);
    const mismatch = result.mismatches.find((m) => m.paymentId === id);
    expect(mismatch).toBeDefined();
    expect(mismatch?.kind).toBe('status_mismatch');
    expect(mismatch?.gatewayStatus).toBe('Paid');
  });
});
