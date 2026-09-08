/**
 * E9 — real customer Google Calendar sync (the calendarSync router used to
 * be a hardcoded mock). OAuth connect/disconnect against the BeautyIntegration
 * store, real upcoming bookings, and cycle-event sync — all graceful when
 * Google credentials are not configured.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser, buildBooking, buildTechnician, buildCategory, buildService } from './factories';

let user: JwtPayload;
const createdUserIds: number[] = [];

async function caller(u: JwtPayload | null) {
  return (appRouter as any).createCaller({ user: u, ip: '127.0.0.1' });
}

describe('customer calendar sync (E9)', () => {
  beforeAll(async () => {
    const u = await prisma.user.create({ data: buildUser() });
    user = { id: u.id, role: 'CUSTOMER', email: u.email };
    createdUserIds.push(u.id);

    // Real upcoming booking for the caller (Booking.addressId is required).
    const techUser = await prisma.user.create({ data: buildUser() });
    createdUserIds.push(techUser.id);
    await prisma.technician.create({ data: buildTechnician({ userId: techUser.id }) });
    const addr = await prisma.address.create({
      data: {
        userId: u.id,
        label: 'المنزل',
        city: 'الرياض',
        area: 'النخيل',
        street: 'طريق الملك',
      },
    });
    const cat = await prisma.category.create({ data: buildCategory() });
    const svc = await prisma.service.create({ data: buildService({ categoryId: cat.id }) });
    await prisma.booking.create({
      data: {
        ...buildBooking({
          customerId: u.id,
          technicianId: techUser.id,
          serviceId: svc.id,
          status: 'ACCEPTED',
        }),
        addressId: addr.id,
      },
    });
  }, 20000);

  afterAll(async () => {
    try {
      await prisma.booking.deleteMany({ where: { customerId: { in: createdUserIds } } });
    } catch {}
    try {
      await prisma.address.deleteMany({ where: { userId: { in: createdUserIds } } });
    } catch {}
    try {
      await prisma.beautyIntegration.deleteMany({ where: { userId: { in: createdUserIds } } });
    } catch {}
    try {
      await prisma.technician.deleteMany({ where: { userId: { in: createdUserIds } } });
    } catch {}
    try {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    } catch {}
  });

  it('rejects anonymous access', async () => {
    const anon = await caller(null);
    await expect(anon.calendarSync.status()).rejects.toThrow();
    await expect(anon.calendarSync.authUrl({})).rejects.toThrow();
    await expect(anon.calendarSync.connect({ authCode: 'x' })).rejects.toThrow();
    await expect(anon.calendarSync.disconnect()).rejects.toThrow();
    await expect(anon.calendarSync.upcoming()).rejects.toThrow();
    await expect(anon.calendarSync.syncCycleEvents()).rejects.toThrow();
  });

  it('status defaults to disconnected for a fresh user', async () => {
    const c = await caller(user);
    const status = await c.calendarSync.status();
    expect(status.connected).toBe(false);
    expect(status.provider).toBe('google');
  });

  it('upcoming returns the caller real bookings, not the mock', async () => {
    const c = await caller(user);
    const upcoming = await c.calendarSync.upcoming();
    expect(upcoming.length).toBeGreaterThanOrEqual(1);
    expect(upcoming.every((e: any) => e.date)).toBe(true);
    expect(upcoming[0].technician).toBeTruthy();
  });

  it('connect without Google credentials fails cleanly (NOT_IMPLEMENTED)', async () => {
    const configured = !!process.env['GOOGLE_CLIENT_ID'] && !!process.env['GOOGLE_CLIENT_SECRET'];
    const c = await caller(user);
    if (configured) {
      // Fake auth code → Google rejects → graceful disconnected result.
      const res = await c.calendarSync.connect({ authCode: 'fake-code' });
      expect(res.connected).toBe(false);
    } else {
      await expect(c.calendarSync.connect({ authCode: 'fake-code' })).rejects.toThrow(
        /configured|NOT_IMPLEMENTED/i,
      );
    }
  });

  it('disconnect removes the stored integration row', async () => {
    await prisma.beautyIntegration.create({
      data: {
        userId: user.id,
        provider: 'google_calendar',
        accessToken: 'at',
        refreshToken: 'rt',
      },
    });
    const c = await caller(user);
    const status = await c.calendarSync.status();
    expect(status.connected).toBe(true);

    await c.calendarSync.disconnect();
    const row = await prisma.beautyIntegration.findUnique({
      where: { userId_provider: { userId: user.id, provider: 'google_calendar' } },
    });
    expect(row).toBeNull();
  });

  it('syncCycleEvents reports connected=false without an integration', async () => {
    const c = await caller(user);
    const res = await c.calendarSync.syncCycleEvents();
    expect(res.connected).toBe(false);
    expect(res.synced).toBe(0);
  });

  it('authUrl returns null or a google URL without throwing', async () => {
    const c = await caller(user);
    const url = await c.calendarSync.authUrl({});
    expect(url === null || typeof url === 'string').toBe(true);
  });
});
