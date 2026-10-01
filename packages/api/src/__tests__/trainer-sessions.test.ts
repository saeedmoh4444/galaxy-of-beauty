/**
 * E3 — TRAINER vertical (audit stage 12): "absent entirely — no role,
 * no booking path". Light parallel flow in the clinic/gym idiom:
 * verified TRAINER vendors offer 1:1 sessions (bookable through the
 * trainers router) with optional home visits. Money integrity: the price
 * comes from the trainer's vendor row, never from the client.
 */
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { buildUser, safeFutureDate } from './factories';
import type { JwtPayload } from '../lib/jwt';

const SUFFIX = Date.now();
const createdVendorIds: number[] = [];
const createdUserIds: number[] = [];
let customer: JwtPayload;
let verifiedTrainerId: number;
let unverifiedTrainerId: number;
let gymId: number;
let freeTrainerId: number;

async function authCaller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

beforeAll(async () => {
  const cust = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(cust.id);
  customer = { id: cust.id, role: 'CUSTOMER', email: cust.email };

  // Vendor.userId is @unique — one owner user per vendor.
  const mk = async (over: Record<string, unknown>, extra: Record<string, unknown> = {}) => {
    const owner = await prisma.user.create({
      data: buildUser({
        email: `trainer-owner-${Math.random().toString(36).slice(2, 8)}@test.local`,
      }),
    });
    createdUserIds.push(owner.id);
    return prisma.vendor.create({
      data: {
        storeName: `trainer-${Math.random().toString(36).slice(2, 8)}`,
        storeSlug: `trainer-${Math.random().toString(36).slice(2, 10)}`,
        userId: owner.id,
        ...over,
        ...extra,
      },
    });
  };

  const verified = await mk(
    { type: 'TRAINER', isVerified: true, isActive: true },
    { trainerSpecialty: 'yoga', trainerCity: 'Riyadh', trainerSessionPrice: 120 },
  );
  const unverified = await mk(
    { type: 'TRAINER', isVerified: false, isActive: true },
    { trainerSpecialty: 'strength' },
  );
  const gym = await mk({ type: 'GYM', isVerified: true, isActive: true }, { gymType: 'ladies' });
  const free = await mk(
    { type: 'TRAINER', isVerified: true, isActive: true },
    { trainerSpecialty: 'pilates', trainerSessionPrice: 0 },
  );
  verifiedTrainerId = verified.id;
  unverifiedTrainerId = unverified.id;
  gymId = gym.id;
  freeTrainerId = free.id;
  createdVendorIds.push(verified.id, unverified.id, gym.id, free.id);
}, 30000);

afterAll(async () => {
  try {
    await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  } catch {
    // cleanup is best-effort; the DB is re-seeded per run
  }
});

describe('trainers.list / detail — discovery (stage 12)', () => {
  it('lists only verified, active TRAINER vendors', async () => {
    const c = await authCaller(null);
    const rows = await c.trainers.list();
    const ids = rows.map((r: { id: number }) => r.id);
    expect(ids).toContain(verifiedTrainerId);
    expect(ids).toContain(freeTrainerId);
    expect(ids).not.toContain(unverifiedTrainerId);
    expect(ids).not.toContain(gymId);
  });

  it('returns trainer detail by slug', async () => {
    const c = await authCaller(null);
    const vendor = await prisma.vendor.findUnique({ where: { id: verifiedTrainerId } });
    const detail = await c.trainers.detail({ slug: vendor!.storeSlug });
    expect(detail.id).toBe(verifiedTrainerId);
    expect(detail.trainerSpecialty).toBe('yoga');
  });

  it('404s unknown slugs', async () => {
    const c = await authCaller(null);
    await expect(c.trainers.detail({ slug: `missing-${SUFFIX}` })).rejects.toThrow();
  });
});

describe('trainers.bookSession — the booking path (stage 12)', () => {
  it('books a 1:1 session at the trainer-set price', async () => {
    const c = await authCaller(customer);
    const session = await c.trainers.bookSession({
      trainerId: verifiedTrainerId,
      scheduledAt: safeFutureDate(3).toISOString(),
    });
    expect(session.status).toBe('REQUESTED');
    expect(session.code).toMatch(/^TRN-/);
    expect(Number(session.price)).toBe(120);
    expect(session.durationMin).toBe(60);
  });

  it('rejects trainers with no session price (contact-for-pricing)', async () => {
    const c = await authCaller(customer);
    await expect(
      c.trainers.bookSession({
        trainerId: freeTrainerId,
        scheduledAt: safeFutureDate(3).toISOString(),
      }),
    ).rejects.toThrow();
  });

  it('rejects past schedules', async () => {
    const c = await authCaller(customer);
    await expect(
      c.trainers.bookSession({
        trainerId: verifiedTrainerId,
        scheduledAt: new Date(Date.now() - 3600_000).toISOString(),
      }),
    ).rejects.toThrow();
  });

  it('rejects home visits without an address', async () => {
    const c = await authCaller(customer);
    await expect(
      c.trainers.bookSession({
        trainerId: verifiedTrainerId,
        scheduledAt: safeFutureDate(3).toISOString(),
        isHomeVisit: true,
      }),
    ).rejects.toThrow();
  });

  it('rejects unverified trainers and non-trainer vendors', async () => {
    const c = await authCaller(customer);
    await expect(
      c.trainers.bookSession({
        trainerId: unverifiedTrainerId,
        scheduledAt: safeFutureDate(3).toISOString(),
      }),
    ).rejects.toThrow();
    await expect(
      c.trainers.bookSession({ trainerId: gymId, scheduledAt: safeFutureDate(3).toISOString() }),
    ).rejects.toThrow();
  });

  it('rejects anonymous callers', async () => {
    const c = await authCaller(null);
    await expect(
      c.trainers.bookSession({
        trainerId: verifiedTrainerId,
        scheduledAt: safeFutureDate(3).toISOString(),
      }),
    ).rejects.toThrow();
  });
});

describe('trainers.mySessions / cancelSession — ownership', () => {
  it('lists only the caller sessions and allows cancelling their own', async () => {
    const c = await authCaller(customer);
    const session = await c.trainers.bookSession({
      trainerId: verifiedTrainerId,
      scheduledAt: safeFutureDate(4).toISOString(),
    });
    const mine = await c.trainers.mySessions();
    const ids = mine.map((s: { id: number }) => s.id);
    expect(ids).toContain(session.id);

    const other = await prisma.user.create({ data: buildUser() });
    createdUserIds.push(other.id);
    const otherC = await authCaller({ id: other.id, role: 'CUSTOMER', email: other.email });
    await expect(otherC.trainers.cancelSession({ sessionId: session.id })).rejects.toThrow();

    const cancelled = await c.trainers.cancelSession({ sessionId: session.id });
    expect(cancelled.status).toBe('CANCELLED');
  });
});
