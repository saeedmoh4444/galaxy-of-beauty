/**
 * 8.1c — influencer program.
 *
 * Admin CRUD + public resolve, booking.create acceptance/validation of
 * influencerCode, and commission crediting on booking completion
 * (wallet when the influencer is linked to a user; counters otherwise).
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
const newIdemKey = () => `mob_influencer_${Date.now()}_${uid++}`;

async function seedSlot(): Promise<number> {
  const slot = await prisma.availabilitySlot.create({
    data: {
      technicianId: technicianRecordId,
      startAt: new Date(Date.now() + 86400000 * 2),
      endAt: new Date(Date.now() + 86400000 * 2 + 3600000),
      isBooked: false,
    },
  });
  return slot.id;
}

const createdInfluencerIds: number[] = [];

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
          label: 'اختبار المؤثر',
          city: 'الرياض',
          area: 'التجريبي',
          street: 'شارع الاختبار',
        },
      })
    ).id;
}, 30000);

afterAll(async () => {
  try {
    await prisma.influencer.deleteMany({ where: { id: { in: createdInfluencerIds } } });
  } catch {
    /* best-effort */
  }
});

describe('influencers router', () => {
  it('lets an admin create an influencer with an auto code and resolve it publicly', async () => {
    const c = await authCaller(admin);
    const created = await c.influencers.create({ name: 'نورة', socialHandle: '@nora.beauty' });
    createdInfluencerIds.push(created.id);
    expect(created.code).toMatch(/^INF-[A-Z0-9]{6}$/);
    expect(Number(created.commissionRate)).toBe(10);

    const pub = await anonCaller();
    const resolved = await pub.influencers.resolve({ code: created.code });
    expect(resolved).toMatchObject({
      code: created.code,
      name: 'نورة',
      socialHandle: '@nora.beauty',
    });
  });

  it('rejects non-admin create and list', async () => {
    const c = await authCaller(customer);
    await expect(c.influencers.create({ name: 'X' })).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(c.influencers.list()).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('rejects unknown and inactive codes on resolve', async () => {
    const pub = await anonCaller();
    await expect(pub.influencers.resolve({ code: 'INF-NOPE' })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
    const c = await authCaller(admin);
    const made = await c.influencers.create({ name: 'خاملة', commissionRate: 5 });
    createdInfluencerIds.push(made.id);
    await c.influencers.update({ id: made.id, isActive: false });
    await expect(pub.influencers.resolve({ code: made.code })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('accepts a valid influencerCode on booking.create and rejects unknown codes', async () => {
    const c = await authCaller(admin);
    const infl = await c.influencers.create({
      name: 'لين',
      commissionRate: 10,
      userId: customer.id,
    });
    createdInfluencerIds.push(infl.id);

    const cust = await authCaller(customer);
    const booking = await cust.bookings.create({
      serviceId,
      technicianId: technicianUserId,
      addressId,
      slotId: await seedSlot(),
      startAt: new Date(Date.now() + 86400000 * 2).toISOString(),
      endAt: new Date(Date.now() + 86400000 * 2 + 3600000).toISOString(),
      idempotencyKey: newIdemKey(),
      influencerCode: infl.code,
    });
    expect(booking.influencerCode).toBe(infl.code);

    await expect(
      cust.bookings.create({
        serviceId,
        technicianId: technicianUserId,
        addressId,
        slotId: await seedSlot(),
        startAt: new Date(Date.now() + 86400000 * 2).toISOString(),
        endAt: new Date(Date.now() + 86400000 * 2 + 3600000).toISOString(),
        idempotencyKey: newIdemKey(),
        influencerCode: 'INF-MISSING',
      }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('credits commission to the linked user on completion', async () => {
    const c = await authCaller(admin);
    const infl = await c.influencers.create({
      name: 'ريم',
      commissionRate: 10,
      userId: customer.id,
    });
    createdInfluencerIds.push(infl.id);

    const cust = await authCaller(customer);
    const booking = await cust.bookings.create({
      serviceId,
      technicianId: technicianUserId,
      addressId,
      slotId: await seedSlot(),
      startAt: new Date(Date.now() + 86400000 * 2).toISOString(),
      endAt: new Date(Date.now() + 86400000 * 2 + 3600000).toISOString(),
      idempotencyKey: newIdemKey(),
      influencerCode: infl.code,
    });
    const expectedCommission = Number((Number(booking.totalAmount) * 0.1).toFixed(2));

    const walletBefore = await prisma.wallet.findUniqueOrThrow({
      where: { userId: customer.id },
    });

    const tech = await authCaller(technician);
    await tech.bookings.transition({ id: booking.id, action: 'accept' });
    await tech.bookings.transition({ id: booking.id, action: 'start' });
    const done = await tech.bookings.transition({ id: booking.id, action: 'complete' });
    expect(done.status).toBe('COMPLETED');

    const walletAfter = await prisma.wallet.findUniqueOrThrow({
      where: { userId: customer.id },
    });
    expect(Number(walletAfter.bonusBalance) - Number(walletBefore.bonusBalance)).toBeCloseTo(
      expectedCommission,
      2,
    );

    const tx = await prisma.walletTransaction.findFirst({
      where: { source: 'INFLUENCER_COMMISSION', referenceId: `influencer_${booking.id}` },
    });
    expect(tx).not.toBeNull();
    expect(Number(tx!.amount)).toBeCloseTo(expectedCommission, 2);

    const after = await prisma.influencer.findUniqueOrThrow({ where: { id: infl.id } });
    expect(after.totalBookings).toBe(1);
    expect(Number(after.totalCommission)).toBeCloseTo(expectedCommission, 2);
  });

  it('accumulates counters only when the influencer has no linked user', async () => {
    const c = await authCaller(admin);
    const infl = await c.influencers.create({ name: 'بدون حساب', commissionRate: 10 });
    createdInfluencerIds.push(infl.id);

    const cust = await authCaller(customer);
    const booking = await cust.bookings.create({
      serviceId,
      technicianId: technicianUserId,
      addressId,
      slotId: await seedSlot(),
      startAt: new Date(Date.now() + 86400000 * 2).toISOString(),
      endAt: new Date(Date.now() + 86400000 * 2 + 3600000).toISOString(),
      idempotencyKey: newIdemKey(),
      influencerCode: infl.code,
    });

    const tech = await authCaller(technician);
    await tech.bookings.transition({ id: booking.id, action: 'accept' });
    await tech.bookings.transition({ id: booking.id, action: 'start' });
    await tech.bookings.transition({ id: booking.id, action: 'complete' });

    const after = await prisma.influencer.findUniqueOrThrow({ where: { id: infl.id } });
    expect(after.totalBookings).toBe(1);
    expect(Number(after.totalCommission)).toBeGreaterThan(0);
    const tx = await prisma.walletTransaction.findFirst({
      where: { source: 'INFLUENCER_COMMISSION', referenceId: `influencer_${booking.id}` },
    });
    expect(tx).toBeNull();
  });
});
