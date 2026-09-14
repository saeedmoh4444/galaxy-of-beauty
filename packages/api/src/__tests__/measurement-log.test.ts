/**
 * E4b — body measurement history. logMeasurement records a MeasurementLog row
 * AND keeps the profile's latest measurements in sync; progress compares the
 * earliest log against the latest.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

let user: JwtPayload;
const createdUserIds: number[] = [];

async function caller(u: JwtPayload | null) {
  return (appRouter as any).createCaller({ user: u, ip: '127.0.0.1' });
}

describe('measurement history (E4b)', () => {
  beforeAll(async () => {
    const u = await prisma.user.create({ data: buildUser() });
    user = { id: u.id, role: 'CUSTOMER', email: u.email };
    createdUserIds.push(u.id);
  }, 15000);

  afterAll(async () => {
    try {
      await prisma.measurementLog.deleteMany({ where: { userId: { in: createdUserIds } } });
    } catch {}
    try {
      await prisma.beautyProfile.deleteMany({ where: { userId: { in: createdUserIds } } });
    } catch {}
    try {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    } catch {}
  });

  it('rejects anonymous access', async () => {
    const anon = await caller(null);
    await expect(anon.beautyProfile.logMeasurement({ weightKg: 60 })).rejects.toThrow();
    await expect(anon.beautyProfile.measurementHistory({})).rejects.toThrow();
    await expect(anon.beautyProfile.measurementProgress()).rejects.toThrow();
  });

  it('logMeasurement persists the row and syncs the profile', async () => {
    const c = await caller(user);
    const log = await c.beautyProfile.logMeasurement({
      weightKg: 62.5,
      waistCm: 74,
      hipCm: 98,
      notes: 'بداية الخطة',
    });

    const stored = await prisma.measurementLog.findUniqueOrThrow({ where: { id: log.id } });
    expect(stored.weightKg).toBe(62.5);
    expect(stored.waistCm).toBe(74);
    expect(stored.notes).toBe('بداية الخطة');

    const profile = await prisma.beautyProfile.findUniqueOrThrow({ where: { userId: user.id } });
    expect((profile.measurements as any).weightKg).toBe(62.5);
    expect((profile.measurements as any).waistCm).toBe(74);
    expect((profile.measurements as any).hipCm).toBe(98);
  });

  it('requires at least one measurement value', async () => {
    const c = await caller(user);
    await expect(c.beautyProfile.logMeasurement({ notes: 'فقط ملاحظة' })).rejects.toThrow();
  });

  it('history returns own logs, newest first', async () => {
    const c = await caller(user);
    await c.beautyProfile.logMeasurement({ weightKg: 61.8 });
    const history = await c.beautyProfile.measurementHistory({});
    expect(history.length).toBeGreaterThanOrEqual(2);
    // Newest first.
    expect(new Date(history[0]!.createdAt).getTime()).toBeGreaterThanOrEqual(
      new Date(history[1]!.createdAt).getTime(),
    );
    expect(history.every((h: any) => h.userId === user.id)).toBe(true);
  });

  it('progress compares the earliest log against the latest', async () => {
    const c = await caller(user);
    const progress = await c.beautyProfile.measurementProgress();
    expect(progress.count).toBeGreaterThanOrEqual(2);
    // weight dropped 62.5 → 61.8.
    expect(progress.weightKg?.first).toBe(62.5);
    expect(progress.weightKg?.latest).toBe(61.8);
    expect(progress.weightKg?.delta).toBeCloseTo(-0.7, 1);
    // waist never changed after the first log → no delta movement.
    expect(progress.waistCm?.delta ?? 0).toBe(0);
  });
});
