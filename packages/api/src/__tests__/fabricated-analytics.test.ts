/**
 * Fabricated-analytics contracts (audit 2026-09-30, API-15/16/17).
 *
 * Money-integrity policy: no confirmation, stat, rating, metric, or
 * analytics value may be fabricated. Unwired verticals fail closed with an
 * explicit reason — never fake success. This file pins those contracts for
 * the previously fabricating routers (ride-hailing, last-mile, night-out,
 * IoT sync, smart pricing, predictive demand, service trends, try-on
 * sessions, kids + womens bookings).
 */
import { describe, it, expect } from 'vitest';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';
import type { JwtPayload } from '../lib/jwt';

const CSRF = 'a'.repeat(64);

async function caller(user?: JwtPayload) {
  const ctx = await createTRPCContext({ user, csrfCookie: CSRF, csrfHeader: CSRF });
  return (appRouter as any).createCaller(ctx);
}

const anon = () => caller();
const customer = () => caller({ id: 1, role: 'CUSTOMER', email: 'fabricated-test@test.local' });
const admin = () => caller({ id: 1, role: 'ADMIN', email: 'fabricated-test@test.local' });

describe('fabricated-analytics fail-closed contracts', () => {
  it('rideHailing.book returns booked:false with no fake ride, driver, or car', async () => {
    const c = await customer();
    const r = await c.rideHailing.book({ bookingId: 1, provider: 'uber', pickupAddress: 'x' });
    expect(r.booked).toBe(false);
    expect(r.status).toBe('PROVIDER_NOT_CONFIGURED');
    expect(r.reason).toBe('PROVIDER_NOT_CONFIGURED');
    expect(r).not.toHaveProperty('rideId');
    expect(r).not.toHaveProperty('driverName');
    expect(r).not.toHaveProperty('carModel');
    expect(r).not.toHaveProperty('plateNumber');
  });

  it('rideHailing.estimate carries no fabricated price or arrival time', async () => {
    const c = await customer();
    const e = await c.rideHailing.estimate({ bookingId: 1, provider: 'uber' });
    expect(e.available).toBe(false);
    expect(e.reason).toBe('PROVIDER_NOT_CONFIGURED');
    expect(e).not.toHaveProperty('estimatedPrice');
    expect(e).not.toHaveProperty('estimatedTime');
  });

  it('rideHailing.providers lists no fabricated fares', async () => {
    const c = await customer();
    const providers = await c.rideHailing.providers();
    for (const p of providers) {
      expect(p.available).toBe(false);
      expect(p).not.toHaveProperty('estimatedPrice');
      expect(p).not.toHaveProperty('estimatedTime');
    }
  });

  it('nightOut.book no longer fabricates a booking', async () => {
    const c = await customer();
    const r = await c.nightOut.book({ serviceIndex: 0 });
    expect(r.booked).toBe(false);
    expect(r.status).toBe('NOT_CONFIGURED');
    expect(r.reason).toBe('BOOKING_NOT_CREATED');
  });

  it('lastMileDelivery.order returns ordered:false with no fake tracking URL', async () => {
    const c = await customer();
    const r = await c.lastMileDelivery.order({
      productId: 1,
      address: 'x',
      paymentMethod: 'cod',
    });
    expect(r.ordered).toBe(false);
    expect(r.status).toBe('DELIVERY_NOT_CONFIGURED');
    expect(r).not.toHaveProperty('orderId');
    expect(r).not.toHaveProperty('trackingUrl');
  });

  it('iotSync.connect fails closed and never mutates shared device state', async () => {
    const c = await customer();
    const r = await c.iotSync.connect({ deviceKey: 'smart_mirror' });
    expect(r.connected).toBe(false);
    expect(r.reason).toBe('DEVICE_NOT_SUPPORTED');

    const devices = await c.iotSync.devices();
    expect(devices.find((d: any) => d.key === 'smart_mirror')!.status).toBe('disconnected');
  });

  it('iotSync.syncData returns synced:false with no invented health metrics', async () => {
    const c = await customer();
    const r = await c.iotSync.syncData({ deviceKey: 'skin_scanner' });
    expect(r.synced).toBe(false);
    expect(r.reason).toBe('NOT_CONFIGURED');
    expect(r).not.toHaveProperty('metrics');
    expect(r).not.toHaveProperty('insights');
  });

  it('smartPricing.current reports NOT_CONFIGURED instead of live-looking prices', async () => {
    const c = await anon();
    const r = await c.smartPricing.current();
    expect(r.configured).toBe(false);
    expect(r.prices).toEqual([]);
    expect(r.reason).toBe('NOT_CONFIGURED');
  });

  it('smartPricing.update fails closed for known and unknown services', async () => {
    const c = await admin();
    const r = await c.smartPricing.update({ service: 'مكياج', price: 999 });
    expect(r.updated).toBe(false);
    expect(r.reason).toBe('NOT_CONFIGURED');
  });

  it('predictiveDemand.forecast returns no invented prediction', async () => {
    const c = await admin();
    const r = await c.predictiveDemand.forecast();
    expect(r.status).toBe('NOT_CONFIGURED');
    expect(r.nextWeek).toBeNull();
    expect(r.nextMonth).toBeNull();
    expect(r.byService).toEqual([]);
  });

  it('predictiveDemand.myInsights returns no invented insights', async () => {
    const c = await customer();
    const r = await c.predictiveDemand.myInsights();
    expect(r.bestTimeToBook).toBeNull();
    expect(r.popularThisWeek).toEqual([]);
    expect(r.tip).toBeNull();
  });

  it('serviceTrends.trends marks itself unavailable instead of fake chart data', async () => {
    const c = await anon();
    const r = await c.serviceTrends.trends();
    expect(r.unavailable).toBe(true);
    expect(r.reason).toBe('TRENDS_NOT_AVAILABLE');
    expect(r.monthly).toEqual([]);
    expect(r.top).toEqual([]);
  });

  it('virtualTryOn.saveSession reports saved:false instead of a fake sessionId', async () => {
    const c = await customer();
    const r = await c.virtualTryOn.saveSession({
      makeupType: 'lips',
      colorId: 'red-1',
      colorHex: '#c0392b',
    });
    expect(r.saved).toBe(false);
    expect(r.reason).toBe('NOT_CONFIGURED');
    expect(r.sessionId).toBeNull();
  });

  it('kidsServices.book no longer returns a CONFIRMED booking', async () => {
    const c = await customer();
    const r = await c.kidsServices.book({
      serviceId: 'bb1',
      category: 'baby',
      childName: 'نورة',
      childAge: 3,
    });
    expect(r.booked).toBe(false);
    expect(r.status).toBe('NOT_CREATED');
    expect(r).not.toHaveProperty('bookingId');
    expect(r).not.toHaveProperty('message');
  });

  it('womensServices.book no longer returns a CONFIRMED booking', async () => {
    const c = await customer();
    const r = await c.womensServices.book({
      serviceId: 'ps1',
      category: 'pregnancy_safe',
      pregnancyTrimester: 2,
    });
    expect(r.booked).toBe(false);
    expect(r.status).toBe('NOT_CREATED');
    expect(r).not.toHaveProperty('bookingId');
    expect(r).not.toHaveProperty('message');
  });
});
