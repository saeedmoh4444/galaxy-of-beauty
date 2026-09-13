/**
 * Phase 3 sprint 1 — trust layer data. The home stat row is fed by
 * technicians.list (verified count) + a new public technicians.coverage
 * procedure (distinct areas/cities — the home stat falls back to the city
 * count when no verified technician has an area set, as in the main seed).
 */
import { describe, it, expect } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';

/** Anonymous caller — both procedures must be public (guest home). */
function caller() {
  return (appRouter as any).createCaller({ user: null, ip: '127.0.0.1' });
}

describe('trust layer — technician count + coverage (Phase 3 sprint 1)', () => {
  it('technicians.list is public and its total matches verified technicians', async () => {
    const c = caller();
    const list = await c.technicians.list({ limit: 1 });
    const expected = await prisma.technician.count({ where: { kycStatus: 'VERIFIED' } });
    expect(list.total).toBe(expected);
    expect(list.total).toBeGreaterThan(0);
  });

  it('technicians.coverage is public and returns distinct areas + cities', async () => {
    const c = caller();
    const res = await c.technicians.coverage();
    expect(Array.isArray(res.areas)).toBe(true);
    expect(Array.isArray(res.cities)).toBe(true);

    const expectedAreas = await prisma.technician.findMany({
      where: { kycStatus: 'VERIFIED', area: { not: null } },
      distinct: ['area'],
      select: { area: true },
      orderBy: { area: 'asc' },
    });
    expect(res.areas).toEqual(expectedAreas.map((e) => e.area));

    // City is required on Technician, so the city count is the stable
    // fallback the home stat can always use.
    const expectedCities = await prisma.technician.findMany({
      where: { kycStatus: 'VERIFIED' },
      distinct: ['city'],
      select: { city: true },
      orderBy: { city: 'asc' },
    });
    expect(res.cities).toEqual(expectedCities.map((e) => e.city));
    expect(res.cities.length).toBeGreaterThan(0);
    expect(res.cities.every((c: string) => c.trim().length > 0)).toBe(true);
  });
});
