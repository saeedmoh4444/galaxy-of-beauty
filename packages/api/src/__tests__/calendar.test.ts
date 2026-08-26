/**
 * Calendar router tests — Google Calendar OAuth connect/status/disconnect,
 * booking push sync, event pull matching, and single-event unsync, with a
 * mocked fetch for the Google API (ok and throw paths).
 * (Coverage ratchet target: src/routers/calendar.ts — was 9.5%)
 */
import crypto from 'crypto';
import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { buildUser, buildBooking } from './factories';
import type { JwtPayload } from '../lib/jwt';

let techUserId: number;
let techEmail: string;
let techNoProfileId: number;
let customerUserId: number;
let customerName: string;
let addressId: number;
let serviceId: number;

const createdBookingIds: number[] = [];
const GOOGLE_ENV = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'] as const;

function setGoogleConfig(): void {
  process.env['GOOGLE_CLIENT_ID'] = 'client-123';
  process.env['GOOGLE_CLIENT_SECRET'] = 'secret-456';
}

function jsonResponse(body: unknown, ok = true): Response {
  return new Response(JSON.stringify(body), {
    status: ok ? 200 : 500,
    headers: { 'Content-Type': 'application/json' },
  });
}

const FUTURE = () => new Date(Date.now() + 7 * 86_400_000);
const PAST = () => new Date(Date.now() - 7 * 86_400_000);

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

const techCaller = () => caller({ id: techUserId, role: 'TECHNICIAN', email: techEmail });

async function setTechTokens(opts: {
  token?: string | null;
  refresh?: string | null;
  expiry?: Date | null;
  email?: string | null;
}): Promise<void> {
  await prisma.technician.update({
    where: { userId: techUserId },
    data: {
      googleCalendarToken: opts.token ?? null,
      googleRefreshToken: opts.refresh ?? null,
      googleTokenExpiry: opts.expiry ?? null,
      googleCalendarEmail: opts.email ?? null,
    },
  });
}

async function createBookingRow(opts: {
  status?: string;
  googleEventId?: string | null;
  startAt?: Date;
  bookingCode?: string;
  technicianId?: number;
}): Promise<number> {
  const booking = await prisma.booking.create({
    data: {
      ...buildBooking({
        customerId: customerUserId,
        technicianId: opts.technicianId ?? techUserId,
        serviceId,
        status: opts.status ?? 'ACCEPTED',
        startAt: opts.startAt ?? FUTURE(),
        bookingCode:
          opts.bookingCode ?? `GOB-CAL-${crypto.randomUUID().replace(/-/g, '').slice(0, 8)}`,
      }),
      addressId,
      googleEventId: opts.googleEventId ?? null,
    } as any,
  });
  createdBookingIds.push(booking.id);
  return booking.id;
}

async function clearMyBookings(): Promise<void> {
  if (createdBookingIds.length > 0) {
    await prisma.booking.deleteMany({ where: { id: { in: createdBookingIds } } });
  }
}

function uniquePhone(): string {
  return `+9665${crypto.randomUUID().replace(/-/g, '').slice(0, 8)}`;
}

beforeAll(async () => {
  const techUser = await prisma.user.create({
    data: buildUser({ role: 'TECHNICIAN', name: 'فنية التقويم', phone: uniquePhone() }),
  });
  techUserId = techUser.id;
  techEmail = techUser.email;
  // NOTE: buildTechnician() from factories.ts emits isAvailable/isVerified,
  // which no longer exist on the Technician model — construct inline instead.
  await prisma.technician.create({
    data: {
      userId: techUserId,
      city: 'الرياض',
      bioJson: { ar: 'ملف فنية اختبار', en: 'Test technician profile' },
    },
  });

  const noProfile = await prisma.user.create({
    data: buildUser({ role: 'TECHNICIAN', name: 'فنية بدون ملف', phone: uniquePhone() }),
  });
  techNoProfileId = noProfile.id;

  customerName = 'عميلة التقويم';
  const customer = await prisma.user.create({
    data: buildUser({ role: 'CUSTOMER', name: customerName, phone: uniquePhone() }),
  });
  customerUserId = customer.id;

  const address = await prisma.address.create({
    data: { userId: customerUserId, label: 'منزل', city: 'الرياض', area: 'اختبار', street: 'شارع' },
  });
  addressId = address.id;

  const service = await prisma.service.findFirst({ orderBy: { id: 'asc' } });
  if (!service) throw new Error('No service in seed data');
  serviceId = service.id;
}, 15000);

afterEach(() => {
  for (const key of GOOGLE_ENV) delete process.env[key];
  vi.unstubAllGlobals();
});

afterAll(async () => {
  // FK order: bookings (reference address/user) → addresses → users
  // (technician profiles cascade with their user).
  await prisma.booking.deleteMany({
    where: { technicianId: { in: [techUserId, techNoProfileId] } },
  });
  await prisma.address.deleteMany({ where: { userId: customerUserId } });
  await prisma.user.deleteMany({
    where: { id: { in: [techUserId, techNoProfileId, customerUserId] } },
  });
}, 15000);

describe('calendar router', () => {
  describe('authorization', () => {
    it('rejects anonymous callers and non-technician roles', async () => {
      const anon = await caller(null);
      await expect(anon.calendar.status()).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
      await expect(anon.calendar.authUrl()).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
      await expect(anon.calendar.connect({ authCode: 'c' })).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
      await expect(anon.calendar.disconnect()).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
      await expect(anon.calendar.sync()).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
      await expect(anon.calendar.pull()).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
      await expect(anon.calendar.unsyncBooking({ bookingId: 1 })).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });

      const customer = {
        id: customerUserId,
        role: 'CUSTOMER',
        email: 'c@test.example',
      } as JwtPayload;
      const c = await caller(customer);
      await expect(c.calendar.status()).rejects.toMatchObject({ code: 'FORBIDDEN' });
      await expect(c.calendar.sync()).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });
  });

  describe('status', () => {
    it('reports disconnected when no tokens are stored', async () => {
      await setTechTokens({});
      const r = await (await techCaller()).calendar.status();
      expect(r).toEqual({ connected: false, email: null });
    });

    it('reports connected with the account email', async () => {
      await setTechTokens({
        token: 'at-1',
        refresh: 'rt-1',
        expiry: FUTURE(),
        email: 't@example.com',
      });
      const r = await (await techCaller()).calendar.status();
      expect(r).toEqual({ connected: true, email: 't@example.com' });
    });

    it('rejects a technician user without a profile', async () => {
      const c = await caller({ id: techNoProfileId, role: 'TECHNICIAN', email: 'np@test.example' });
      await expect(c.calendar.status()).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });
  });

  describe('authUrl', () => {
    it('throws NOT_IMPLEMENTED when Google OAuth is not configured', async () => {
      await expect((await techCaller()).calendar.authUrl()).rejects.toMatchObject({
        code: 'NOT_IMPLEMENTED',
      });
    });

    it('builds a consent URL carrying the returned state', async () => {
      setGoogleConfig();
      const r = await (await techCaller()).calendar.authUrl();
      expect(r.url).toContain('client_id=client-123');
      expect(r.url).toContain('redirect_uri=');
      expect(r.url).toContain('access_type=offline');
      expect(r.url).toContain(`state=${r.state}`);
    });
  });

  describe('connect', () => {
    it('fails cleanly when Google OAuth is not configured', async () => {
      await expect(
        (await techCaller()).calendar.connect({ authCode: 'code-1' }),
      ).rejects.toMatchObject({
        code: 'BAD_REQUEST',
      });
    });

    it('exchanges the code and persists the tokens', async () => {
      setGoogleConfig();
      vi.stubGlobal(
        'fetch',
        vi
          .fn()
          .mockResolvedValue(
            jsonResponse({ access_token: 'at-1', refresh_token: 'rt-1', expires_in: 3600 }),
          ),
      );
      const r = await (await techCaller()).calendar.connect({ authCode: 'code-1' });
      expect(r).toEqual({ connected: true, message: 'Google Calendar connected' });

      const row = await prisma.technician.findUnique({ where: { userId: techUserId } });
      expect(row!.googleCalendarToken).toBe('at-1');
      expect(row!.googleRefreshToken).toBe('rt-1');
      expect(row!.googleTokenExpiry).toBeInstanceOf(Date);
    });

    it('fails when the token exchange throws', async () => {
      setGoogleConfig();
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')));
      await expect(
        (await techCaller()).calendar.connect({ authCode: 'code-1' }),
      ).rejects.toMatchObject({
        code: 'BAD_REQUEST',
      });
    });
  });

  describe('disconnect', () => {
    it('rejects when not connected', async () => {
      await setTechTokens({});
      await expect((await techCaller()).calendar.disconnect()).rejects.toMatchObject({
        code: 'BAD_REQUEST',
      });
    });

    it('rejects a technician user without a profile', async () => {
      const c = await caller({ id: techNoProfileId, role: 'TECHNICIAN', email: 'np@test.example' });
      await expect(c.calendar.disconnect()).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('clears tokens with nothing to clean up', async () => {
      await clearMyBookings();
      await setTechTokens({
        token: 'at-1',
        refresh: 'rt-1',
        expiry: FUTURE(),
        email: 't@example.com',
      });
      const r = await (await techCaller()).calendar.disconnect();
      expect(r).toEqual({
        connected: false,
        cleaned: 0,
        message: 'Google Calendar disconnected',
      });

      const row = await prisma.technician.findUnique({ where: { userId: techUserId } });
      expect(row!.googleCalendarToken).toBeNull();
      expect(row!.googleRefreshToken).toBeNull();
      expect(row!.googleTokenExpiry).toBeNull();
      expect(row!.googleCalendarEmail).toBeNull();
    });

    it('deletes synced events and clears the booking ids', async () => {
      await clearMyBookings();
      await setTechTokens({
        token: 'at-1',
        refresh: 'rt-1',
        expiry: FUTURE(),
        email: 't@example.com',
      });
      const bookingId = await createBookingRow({ googleEventId: 'evt-sync-1' });
      const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
      vi.stubGlobal('fetch', fetchMock);

      const r = await (await techCaller()).calendar.disconnect();
      expect(r.connected).toBe(false);
      expect(r.cleaned).toBe(1);
      expect(r.message).toContain('1 event(s) cleaned up');

      const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toContain(`/calendars/primary/events/evt-sync-1`);
      expect(init.method).toBe('DELETE');
      expect(
        (await prisma.booking.findUnique({ where: { id: bookingId } }))!.googleEventId,
      ).toBeNull();
    });

    it('keeps the booking event ids when deletion fails', async () => {
      await clearMyBookings();
      await setTechTokens({
        token: 'at-1',
        refresh: 'rt-1',
        expiry: FUTURE(),
        email: 't@example.com',
      });
      const bookingId = await createBookingRow({ googleEventId: 'evt-sync-2' });
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')));

      const r = await (await techCaller()).calendar.disconnect();
      expect(r.cleaned).toBe(0);
      expect(r.message).toBe('Google Calendar disconnected');
      expect((await prisma.booking.findUnique({ where: { id: bookingId } }))!.googleEventId).toBe(
        'evt-sync-2',
      );
    });
  });

  describe('sync', () => {
    it('rejects when not connected', async () => {
      await setTechTokens({});
      await expect((await techCaller()).calendar.sync()).rejects.toMatchObject({
        code: 'BAD_REQUEST',
      });
    });

    it('creates Google events only for upcoming ACCEPTED/PAID/IN_PROGRESS bookings', async () => {
      await clearMyBookings();
      await setTechTokens({
        token: 'at-1',
        refresh: 'rt-1',
        expiry: FUTURE(),
        email: 't@example.com',
      });
      const accepted = await createBookingRow({ status: 'ACCEPTED' });
      const paid = await createBookingRow({ status: 'PAID' });
      const inProgress = await createBookingRow({ status: 'IN_PROGRESS' });
      const requested = await createBookingRow({ status: 'REQUESTED' }); // excluded by status
      const past = await createBookingRow({ status: 'ACCEPTED', startAt: PAST() }); // excluded by time

      // Fresh Response per call — a shared Response body can only be
      // consumed once, which would fail the 2nd/3rd event creation.
      const fetchMock = vi
        .fn()
        .mockImplementation(() => Promise.resolve(jsonResponse({ id: 'evt-new' })));
      vi.stubGlobal('fetch', fetchMock);

      const r = await (await techCaller()).calendar.sync();
      expect(r.synced).toBe(3);
      expect(r.message).toContain('3 booking(s) synced');

      const updated = await prisma.booking.findMany({
        where: { id: { in: [accepted, paid, inProgress] } },
      });
      expect(updated.every((b) => b.googleEventId === 'evt-new')).toBe(true);
      expect(
        (await prisma.booking.findUnique({ where: { id: requested } }))!.googleEventId,
      ).toBeNull();
      expect((await prisma.booking.findUnique({ where: { id: past } }))!.googleEventId).toBeNull();

      // Three create-event POSTs, each with the bearer token and the customer name
      const calls = fetchMock.mock.calls as Array<[string, RequestInit]>;
      expect(calls).toHaveLength(3);
      for (const [url, init] of calls) {
        expect(url).toContain('/calendars/primary/events');
        expect(String((init.headers as any)['Authorization'])).toBe('Bearer at-1');
        expect(String(init.body)).toContain(customerName);
      }
    });

    it('refreshes an expired token before syncing', async () => {
      await clearMyBookings();
      setGoogleConfig(); // refreshGoogleToken needs OAuth env before it fetches
      await setTechTokens({
        token: 'at-stale',
        refresh: 'rt-1',
        expiry: PAST(),
        email: 't@example.com',
      });
      await createBookingRow({ status: 'ACCEPTED' });
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(jsonResponse({ access_token: 'at-new', expires_in: 3600 }))
        .mockResolvedValueOnce(jsonResponse({ id: 'evt-refreshed' }));
      vi.stubGlobal('fetch', fetchMock);

      const r = await (await techCaller()).calendar.sync();
      expect(r.synced).toBe(1);

      const row = await prisma.technician.findUnique({ where: { userId: techUserId } });
      expect(row!.googleCalendarToken).toBe('at-new');

      const calls = fetchMock.mock.calls as Array<[string, RequestInit]>;
      expect(calls).toHaveLength(2);
      expect(String((calls[1][1].headers as any)['Authorization'])).toBe('Bearer at-new');
    });

    it('falls back to the stored token when the refresh fails', async () => {
      await clearMyBookings();
      setGoogleConfig(); // refreshGoogleToken needs OAuth env before it fetches
      await setTechTokens({
        token: 'at-stale',
        refresh: 'rt-1',
        expiry: PAST(),
        email: 't@example.com',
      });
      await createBookingRow({ status: 'ACCEPTED' });
      const fetchMock = vi
        .fn()
        .mockRejectedValueOnce(new Error('down')) // refresh attempt fails
        .mockResolvedValueOnce(jsonResponse({ id: 'evt-stale' })); // create still runs
      vi.stubGlobal('fetch', fetchMock);

      const r = await (await techCaller()).calendar.sync();
      expect(r.synced).toBe(1);

      const row = await prisma.technician.findUnique({ where: { userId: techUserId } });
      expect(row!.googleCalendarToken).toBe('at-stale');

      const calls = fetchMock.mock.calls as Array<[string, RequestInit]>;
      expect(String((calls[1][1].headers as any)['Authorization'])).toBe('Bearer at-stale');
    });

    it('counts nothing when the Google event creation fails', async () => {
      await clearMyBookings();
      await setTechTokens({
        token: 'at-1',
        refresh: 'rt-1',
        expiry: FUTURE(),
        email: 't@example.com',
      });
      await createBookingRow({ status: 'ACCEPTED' });
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')));

      const r = await (await techCaller()).calendar.sync();
      expect(r.synced).toBe(0);
    });

    it('makes no Google calls when nothing qualifies', async () => {
      await clearMyBookings();
      await setTechTokens({ token: 'at-1', expiry: FUTURE() });
      await createBookingRow({ status: 'ACCEPTED', startAt: PAST() });
      const fetchMock = vi.fn();
      vi.stubGlobal('fetch', fetchMock);

      const r = await (await techCaller()).calendar.sync();
      expect(r.synced).toBe(0);
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe('pull', () => {
    it('rejects when not connected', async () => {
      await setTechTokens({});
      await expect((await techCaller()).calendar.pull()).rejects.toMatchObject({
        code: 'BAD_REQUEST',
      });
    });

    it('matches GOB booking codes in event descriptions', async () => {
      await clearMyBookings();
      await setTechTokens({ token: 'at-1', expiry: FUTURE() });
      const matched = await createBookingRow({ status: 'ACCEPTED', bookingCode: 'PULLMATCH' });
      await createBookingRow({ status: 'ACCEPTED', bookingCode: 'NOGOB' });

      const fetchMock = vi.fn().mockResolvedValue(
        jsonResponse({
          items: [
            { id: 'evt-p1', description: 'GOB-PULLMATCH' },
            { id: 'evt-p2', description: 'no code here' },
          ],
        }),
      );
      vi.stubGlobal('fetch', fetchMock);

      const r = await (await techCaller()).calendar.pull();
      expect(r.pulled).toBe(2);
      expect(r.matched).toBe(1);
      expect(r.message).toContain('2 event(s) found in Google Calendar, 1 matched');

      expect((await prisma.booking.findUnique({ where: { id: matched } }))!.googleEventId).toBe(
        'evt-p1',
      );

      const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toContain('calendar/v3/calendars/primary/events');
      expect(url).toContain('timeMin=');
      expect(String((init.headers as any)['Authorization'])).toBe('Bearer at-1');
    });

    it('throws BAD_REQUEST on a non-ok Google response', async () => {
      await clearMyBookings();
      await setTechTokens({ token: 'at-1', expiry: FUTURE() });
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({}, false)));
      await expect((await techCaller()).calendar.pull()).rejects.toMatchObject({
        code: 'BAD_REQUEST',
      });
    });

    it('surfaces a TRPCError when the Google fetch throws', async () => {
      // Fixed 2026-08-19: fetch failures were propagated as raw
      // TypeErrors; they now surface as BAD_REQUEST TRPCErrors.
      await setTechTokens({ token: 'at-1', expiry: FUTURE() });
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')));
      await expect((await techCaller()).calendar.pull()).rejects.toMatchObject({
        code: 'BAD_REQUEST',
      });
    });
  });

  describe('unsyncBooking', () => {
    it('validates the booking id with zod', async () => {
      await expect(
        (await techCaller()).calendar.unsyncBooking({ bookingId: 1.5 }),
      ).rejects.toThrow();
    });

    it('rejects a missing booking', async () => {
      // -1 would fail the zod .positive() check (BAD_REQUEST) before the
      // lookup — use a valid but non-existent id to reach NOT_FOUND.
      await expect(
        (await techCaller()).calendar.unsyncBooking({ bookingId: 999_999_999 }),
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });

    it('rejects a booking owned by another technician', async () => {
      const bookingId = await createBookingRow({
        googleEventId: 'evt-other',
        technicianId: techNoProfileId,
      });
      await expect(
        (await techCaller()).calendar.unsyncBooking({ bookingId }),
      ).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
    });

    it('rejects a booking that was never synced', async () => {
      const bookingId = await createBookingRow({ googleEventId: null });
      await expect(
        (await techCaller()).calendar.unsyncBooking({ bookingId }),
      ).rejects.toMatchObject({
        code: 'BAD_REQUEST',
      });
    });

    it('deletes the remote event and clears the local id', async () => {
      await clearMyBookings();
      await setTechTokens({ token: 'at-1', expiry: FUTURE() });
      const bookingId = await createBookingRow({ googleEventId: 'evt-unsync-1' });
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })));

      const r = await (await techCaller()).calendar.unsyncBooking({ bookingId });
      expect(r).toEqual({ success: true, message: 'Event removed from Google Calendar' });
      expect(
        (await prisma.booking.findUnique({ where: { id: bookingId } }))!.googleEventId,
      ).toBeNull();
    });

    it('reports failure when the remote delete fails', async () => {
      await clearMyBookings();
      await setTechTokens({ token: 'at-1', expiry: FUTURE() });
      const bookingId = await createBookingRow({ googleEventId: 'evt-unsync-2' });
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')));

      const r = await (await techCaller()).calendar.unsyncBooking({ bookingId });
      expect(r).toEqual({ success: false, message: 'Failed to delete event' });
      expect((await prisma.booking.findUnique({ where: { id: bookingId } }))!.googleEventId).toBe(
        'evt-unsync-2',
      );
    });
  });
});
