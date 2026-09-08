/**
 * E6c — menopause/perimenopause mode: cycleSettings flags (pregnancy-mode
 * pattern), the curated content library, self-reported symptom logging,
 * the phase guess, and the clinic tie-in.
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

describe('menopause mode (E6c)', () => {
  beforeAll(async () => {
    const u = await prisma.user.create({ data: buildUser() });
    user = { id: u.id, role: 'CUSTOMER', email: u.email };
    createdUserIds.push(u.id);
  }, 15000);

  afterAll(async () => {
    try {
      await prisma.menopauseLog.deleteMany({ where: { userId: { in: createdUserIds } } });
    } catch {}
    try {
      await prisma.cycleSettings.deleteMany({ where: { userId: { in: createdUserIds } } });
    } catch {}
    try {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    } catch {}
  });

  it('rejects anonymous access', async () => {
    const anon = await caller(null);
    await expect(anon.menopause.status()).rejects.toThrow();
    await expect(anon.menopause.setMode({ enabled: true })).rejects.toThrow();
    await expect(anon.menopause.library()).rejects.toThrow();
    await expect(anon.menopause.logSymptom({ symptom: 'hot_flash' })).rejects.toThrow();
    await expect(anon.menopause.history({})).rejects.toThrow();
    await expect(anon.menopause.clinics()).rejects.toThrow();
  });

  it('setMode toggles the mode and records the last period date', async () => {
    const c = await caller(user);
    const lastPeriodAt = new Date(Date.now() - 400 * 86_400_000).toISOString();
    const result = await c.menopause.setMode({ enabled: true, lastPeriodAt });
    expect(result.menopauseMode).toBe(true);

    const stored = await prisma.cycleSettings.findUniqueOrThrow({ where: { userId: user.id } });
    expect(stored.menopauseMode).toBe(true);
    expect(stored.lastPeriodAt?.toISOString()).toBe(lastPeriodAt);

    await c.menopause.setMode({ enabled: false });
    const off = await prisma.cycleSettings.findUniqueOrThrow({ where: { userId: user.id } });
    expect(off.menopauseMode).toBe(false);
  });

  it('status reports the mode and guesses the phase', async () => {
    const c = await caller(user);
    // ~13 months since last period → menopause phase.
    const longAgo = new Date(Date.now() - 13 * 30 * 86_400_000).toISOString();
    await c.menopause.setMode({ enabled: true, lastPeriodAt: longAgo });
    const status = await c.menopause.status();
    expect(status.enabled).toBe(true);
    expect(status.phase).toBe('menopause');

    // Recent last period → perimenopause.
    const recent = new Date(Date.now() - 40 * 86_400_000).toISOString();
    await c.menopause.setMode({ enabled: true, lastPeriodAt: recent });
    const peri = await c.menopause.status();
    expect(peri.phase).toBe('perimenopause');
  });

  it('library returns bilingual phases, tips, signals and symptoms', async () => {
    const c = await caller(user);
    const lib = await c.menopause.library();
    expect(lib.phases).toHaveLength(3);
    expect(lib.phases[0].titleEn).toBeTruthy();
    expect(lib.tips.length).toBeGreaterThanOrEqual(4);
    expect(lib.signals.length).toBeGreaterThanOrEqual(3);
    expect(lib.symptoms).toHaveLength(6);
    expect(lib.symptoms[0].slug).toBe('hot_flash');
  });

  it('logSymptom persists entries; history is own-only, newest first', async () => {
    const c = await caller(user);
    const entry = await c.menopause.logSymptom({
      symptom: 'hot_flash',
      severity: 3,
      notes: 'مساءً',
    });
    expect(entry.severity).toBe(3);

    await expect(c.menopause.logSymptom({ symptom: 'nonsense' as never })).rejects.toThrow();

    await c.menopause.logSymptom({ symptom: 'sleep', severity: 1 });
    const history = await c.menopause.history({});
    expect(history.length).toBe(2);
    expect(history.every((h: any) => h.userId === user.id)).toBe(true);
    expect(new Date(history[0]!.createdAt).getTime()).toBeGreaterThanOrEqual(
      new Date(history[1]!.createdAt).getTime(),
    );
  });

  it('clinics returns the verified clinic tie-in list', async () => {
    const c = await caller(user);
    const clinics = await c.menopause.clinics();
    expect(Array.isArray(clinics)).toBe(true);
    expect(clinics.every((v: any) => v.type === 'CLINIC' && v.isVerified)).toBe(true);
  });
});
