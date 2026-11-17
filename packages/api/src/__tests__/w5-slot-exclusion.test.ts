/**
 * W5-3 — availability_slots overlap guard (migration
 * 20261115170000_w5_slot_exclusion): one technician cannot hold two
 * overlapping slots. tsrange-based exclusion (tstzrange on the timestamp
 * columns is not IMMUTABLE and failed the index build).
 */
import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { buildUser } from './factories';

const createdUserIds: number[] = [];
let techProfileId: number;

beforeAll(async () => {
  const tu = await prisma.user.create({ data: buildUser({ role: 'TECHNICIAN' }) });
  createdUserIds.push(tu.id);
  const profile = await prisma.technician.create({
    data: { userId: tu.id, city: 'الرياض', bioJson: { ar: 't', en: 't' } },
  });
  techProfileId = profile.id;
}, 30000);

afterAll(async () => {
  await prisma.availabilitySlot.deleteMany({ where: { technicianId: techProfileId } });
  await prisma.technician.deleteMany({ where: { id: techProfileId } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

describe('availability_slots overlap exclusion (W5-3)', () => {
  it('rejects an overlapping slot for the same technician', async () => {
    const base = new Date(Date.now() + 40 * 86_400_000);
    base.setUTCHours(9, 0, 0, 0);
    await prisma.availabilitySlot.create({
      data: {
        technicianId: techProfileId,
        startAt: base,
        endAt: new Date(base.getTime() + 3_600_000),
      },
    });

    let rejected = false;
    try {
      await prisma.availabilitySlot.create({
        data: {
          technicianId: techProfileId,
          startAt: new Date(base.getTime() + 1_800_000),
          endAt: new Date(base.getTime() + 5_400_000),
        },
      });
    } catch {
      rejected = true;
    }
    expect(rejected, 'expected the exclusion to reject the overlap').toBe(true);
  });

  it('accepts a non-overlapping slot (adjacent boundary)', async () => {
    const base = new Date(Date.now() + 40 * 86_400_000);
    base.setUTCHours(15, 0, 0, 0);
    await prisma.availabilitySlot.create({
      data: {
        technicianId: techProfileId,
        startAt: base,
        endAt: new Date(base.getTime() + 3_600_000),
      },
    });
    const adjacent = await prisma.availabilitySlot.create({
      data: {
        technicianId: techProfileId,
        startAt: new Date(base.getTime() + 3_600_000),
        endAt: new Date(base.getTime() + 7_200_000),
      },
    });
    expect(adjacent.id).toBeGreaterThan(0);
  });
});
