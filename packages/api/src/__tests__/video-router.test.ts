/**
 * A4 follow-up — technician room UI: video router role-parity tests.
 *
 * The technician-facing room UI (web /tech/video + mobile tech screens)
 * relies on the video router accepting either booking participant. These
 * tests lock that contract: customer AND technician can start/fetch a
 * session, strangers are FORBIDDEN.
 */
import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';
import { generateCsrfToken } from '../lib/csrf';
import { buildUser } from './factories';
import type { JwtPayload } from '../lib/jwt';

const CSRF = generateCsrfToken();

async function authCaller(user: JwtPayload) {
  const ctx = await createTRPCContext({ user, csrfCookie: CSRF, csrfHeader: CSRF });
  return (appRouter as any).createCaller(ctx);
}

let customer: JwtPayload;
let technician: JwtPayload;
let stranger: JwtPayload;
let bookingId: number;
const createdUserIds: number[] = [];

beforeAll(async () => {
  const [cu, tu, su] = await Promise.all([
    prisma.user.create({ data: buildUser() }),
    prisma.user.create({ data: buildUser() }),
    prisma.user.create({ data: buildUser() }),
  ]);
  createdUserIds.push(cu.id, tu.id, su.id);
  customer = { id: cu.id, role: 'CUSTOMER', email: cu.email };
  technician = { id: tu.id, role: 'TECHNICIAN', email: tu.email };
  stranger = { id: su.id, role: 'CUSTOMER', email: su.email };

  const [service, address] = await Promise.all([
    prisma.service.findFirst({ select: { id: true } }),
    prisma.address.findFirst({ select: { id: true } }),
  ]);
  const booking = await prisma.booking.create({
    data: {
      bookingCode: `GOB-VR-${Date.now()}`,
      customerId: cu.id,
      technicianId: tu.id,
      serviceId: service?.id ?? 1,
      addressId: address?.id ?? 1,
      startAt: new Date(Date.now() + 86_400_000),
      endAt: new Date(Date.now() + 86_400_000 + 3_600_000),
      totalAmount: 100,
    },
  });
  bookingId = booking.id;
}, 30000);

afterAll(async () => {
  try {
    await prisma.videoSession.deleteMany({ where: { bookingId } });
  } catch {}
  try {
    await prisma.booking.deleteMany({ where: { id: bookingId } });
  } catch {}
  try {
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  } catch {}
});

describe('video router — role parity (A4 technician UI)', () => {
  it('customer can start a session for their booking', async () => {
    const caller = await authCaller(customer);
    const session = await caller.video.startSession({ bookingId });
    expect(session.roomId).toMatch(/^video-/);
    expect(session.status).toBe('WAITING');
  });

  it('technician can fetch and re-open the same session', async () => {
    const caller = await authCaller(technician);
    const session = await caller.video.getByBooking({ bookingId });
    expect(session.bookingId).toBe(bookingId);
    expect(session.roomId).toMatch(/^video-/);

    // Re-starting flips an existing session to IN_PROGRESS (joinable).
    const reopened = await caller.video.startSession({ bookingId });
    expect(reopened.status).toBe('IN_PROGRESS');
  });

  it('a non-participant is FORBIDDEN', async () => {
    const caller = await authCaller(stranger);
    await expect(caller.video.getByBooking({ bookingId })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
    await expect(caller.video.startSession({ bookingId })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });

  it('a missing booking is NOT_FOUND', async () => {
    const caller = await authCaller(customer);
    await expect(caller.video.startSession({ bookingId: 999_999_999 })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });
});
