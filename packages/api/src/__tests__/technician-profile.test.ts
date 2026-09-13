/**
 * technicianRouter.updateProfile tests — live router over the seeded DB.
 * Coverage for B.8: the tech profile form's stub save gets a real endpoint.
 * (Coverage ratchet target: src/routers/technicians.ts)
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

let admin: JwtPayload;
let customer: JwtPayload;

const createdUserIds: number[] = [];
const createdTechIds: number[] = [];

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

async function makeTechnicianUser() {
  const user = await prisma.user.create({ data: buildUser({ role: 'TECHNICIAN' }) });
  // buildTechnician() in factories.ts is stale (references removed columns) —
  // construct the row inline.
  const tech = await prisma.technician.create({
    data: { userId: user.id, city: 'الرياض' },
  });
  createdUserIds.push(user.id);
  createdTechIds.push(tech.id);
  return { user, tech };
}

describe('technicianRouter.updateProfile', () => {
  beforeAll(async () => {
    const adminUser = await prisma.user.findFirstOrThrow({ where: { role: 'ADMIN' } });
    admin = { id: adminUser.id, role: 'ADMIN', email: adminUser.email };
    const customerUser = await prisma.user.findFirstOrThrow({ where: { role: 'CUSTOMER' } });
    customer = { id: customerUser.id, role: 'CUSTOMER', email: customerUser.email };
  }, 15000);

  afterAll(async () => {
    try {
      await prisma.technician.deleteMany({ where: { id: { in: createdTechIds } } });
    } catch {}
    try {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    } catch {}
  });

  it('rejects anonymous and non-technician callers', async () => {
    const anon = await caller(null);
    await expect(anon.technicians.updateProfile({ city: 'جدة' })).rejects.toThrow();

    // CUSTOMER is blocked at the procedure level (technicianProcedure).
    const c = await caller(customer);
    await expect(c.technicians.updateProfile({ city: 'جدة' })).rejects.toThrow(
      /Insufficient permissions/,
    );
  });

  it('returns NOT_FOUND for a TECHNICIAN user without a profile row', async () => {
    const user = await prisma.user.create({ data: buildUser({ role: 'TECHNICIAN' }) });
    createdUserIds.push(user.id);
    const c = await caller({ id: user.id, role: 'TECHNICIAN', email: user.email });

    await expect(c.technicians.updateProfile({ city: 'جدة' })).rejects.toThrow(
      /Technician profile/,
    );
  });

  it('updates city/area/bio/buffer/eco fields on the own profile', async () => {
    const { user } = await makeTechnicianUser();
    const c = await caller({ id: user.id, role: 'TECHNICIAN', email: user.email });

    const updated = await c.technicians.updateProfile({
      city: 'جدة',
      area: 'الحمراء',
      bioAr: 'خبيرة تجميل بخبرة ١٠ سنوات',
      bioEn: 'Beautician with 10 years of experience',
      bufferMinutes: 30,
      isEcoFriendly: true,
    });

    expect(updated.city).toBe('جدة');
    expect(updated.area).toBe('الحمراء');
    expect((updated.bioJson as { ar: string; en: string }).ar).toContain('١٠ سنوات');
    expect((updated.bioJson as { ar: string; en: string }).en).toContain('10 years');
    expect(updated.bufferMinutes).toBe(30);
    expect(updated.isEcoFriendly).toBe(true);

    // Persisted, not just echoed.
    const row = await prisma.technician.findUniqueOrThrow({ where: { userId: user.id } });
    expect(row.city).toBe('جدة');
    expect(row.area).toBe('الحمراء');
    expect((row.bioJson as { ar: string; en: string }).en).toContain('10 years');
    expect(row.bufferMinutes).toBe(30);
    expect(row.isEcoFriendly).toBe(true);
  });

  it('partial updates preserve the other bio language and other fields', async () => {
    const { user } = await makeTechnicianUser();
    await prisma.technician.update({
      where: { userId: user.id },
      data: {
        city: 'الرياض',
        area: 'النخيل',
        bioJson: { ar: 'السيرة الأصلية', en: 'Original bio' },
        bufferMinutes: 15,
        isEcoFriendly: false,
      },
    });
    const c = await caller({ id: user.id, role: 'TECHNICIAN', email: user.email });

    // Only the Arabic bio changes.
    const updated = await c.technicians.updateProfile({ bioAr: 'سيرة جديدة' });

    expect(updated.city).toBe('الرياض');
    expect(updated.area).toBe('النخيل');
    expect((updated.bioJson as { ar: string; en: string }).ar).toBe('سيرة جديدة');
    expect((updated.bioJson as { ar: string; en: string }).en).toBe('Original bio');
    expect(updated.bufferMinutes).toBe(15);
    expect(updated.isEcoFriendly).toBe(false);
  });

  it('rejects empty-object calls with no fields to change', async () => {
    const { user } = await makeTechnicianUser();
    const c = await caller({ id: user.id, role: 'TECHNICIAN', email: user.email });
    await expect(c.technicians.updateProfile({})).rejects.toThrow();
  });
});
