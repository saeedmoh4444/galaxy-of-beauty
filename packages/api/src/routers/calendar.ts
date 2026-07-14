import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { technicianProcedure, router } from '../trpc';
import { prisma } from '@galaxy/db';
import {
  exchangeGoogleCode,
  refreshGoogleToken,
  createGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
  getGoogleAuthUrl,
} from '../lib/googleCalendar';

// ── Helper: get valid access token (with refresh) ────────
async function getValidAccessToken(userId: number): Promise<string> {
  const tech = await prisma.technician.findUnique({
    where: { userId },
    select: { googleCalendarToken: true, googleRefreshToken: true, googleTokenExpiry: true },
  });

  if (!tech?.googleCalendarToken) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Google Calendar not connected' });
  }

  if (tech.googleTokenExpiry && tech.googleTokenExpiry < new Date() && tech.googleRefreshToken) {
    const newTokens = await refreshGoogleToken(tech.googleRefreshToken);
    if (newTokens) {
      await prisma.technician.update({
        where: { userId },
        data: {
          googleCalendarToken: newTokens.accessToken,
          googleTokenExpiry: new Date(newTokens.expiryDate),
        },
      });
      return newTokens.accessToken;
    }
  }

  return tech.googleCalendarToken;
}

export const calendarRouter = router({
  // ── Get connection status ──────────────────────────────
  status: technicianProcedure.query(async ({ ctx }) => {
    const tech = await prisma.technician.findUnique({
      where: { userId: ctx.user.id },
      select: { googleCalendarToken: true, googleCalendarEmail: true, googleRefreshToken: true },
    });

    if (!tech) throw new TRPCError({ code: 'NOT_FOUND', message: 'Technician profile not found' });

    return {
      connected: tech.googleCalendarToken !== null,
      email: tech.googleCalendarEmail ?? null,
    };
  }),

  // ── Get OAuth URL ──────────────────────────────────────
  authUrl: technicianProcedure.query(() => {
    const redirectUri = `${process.env['NEXT_PUBLIC_APP_URL'] || 'http://localhost:3000'}/tech/calendar/callback`;
    const state = crypto.randomUUID?.() || Math.random().toString(36).slice(2);
    const url = getGoogleAuthUrl(redirectUri, state);
    if (!url) throw new TRPCError({ code: 'NOT_IMPLEMENTED', message: 'Google OAuth not configured' });
    return { url, state };
  }),

  // ── Connect with OAuth code ────────────────────────────
  connect: technicianProcedure
    .input(z.object({ authCode: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const redirectUri = `${process.env['NEXT_PUBLIC_APP_URL'] || 'http://localhost:3000'}/tech/calendar/callback`;
      const tokens = await exchangeGoogleCode(input.authCode, redirectUri);

      if (!tokens) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Failed to exchange authorization code' });
      }

      // Store tokens in technician profile
      await prisma.technician.update({
        where: { userId: ctx.user.id },
        data: {
          googleCalendarToken: tokens.accessToken,
          googleRefreshToken: tokens.refreshToken,
          googleTokenExpiry: new Date(tokens.expiryDate),
        },
      });

      return { connected: true, message: 'Google Calendar connected' };
    }),

  // ── Disconnect ─────────────────────────────────────────
  disconnect: technicianProcedure.mutation(async ({ ctx }) => {
    const tech = await prisma.technician.findUnique({ where: { userId: ctx.user.id } });
    if (!tech) throw new TRPCError({ code: 'NOT_FOUND' });
    if (!tech.googleCalendarToken) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Not connected' });

    // Clean up synced Google events before disconnecting
    const syncedBookings = await prisma.booking.findMany({
      where: { technicianId: ctx.user.id, googleEventId: { not: null } },
      select: { id: true, googleEventId: true },
    });

    let cleaned = 0;
    if (syncedBookings.length > 0) {
      const accessToken = await getValidAccessToken(ctx.user.id).catch(() => null);
      if (accessToken) {
        for (const b of syncedBookings) {
          if (b.googleEventId && (await deleteGoogleCalendarEvent(accessToken, b.googleEventId))) {
            await prisma.booking.update({
              where: { id: b.id },
              data: { googleEventId: null },
            });
            cleaned++;
          }
        }
      }
    }

    await prisma.technician.update({
      where: { userId: ctx.user.id },
      data: { googleCalendarToken: null, googleRefreshToken: null, googleTokenExpiry: null, googleCalendarEmail: null },
    });

    return { connected: false, cleaned, message: `Google Calendar disconnected${cleaned > 0 ? `. ${cleaned} event(s) cleaned up.` : ''}` };
  }),

  // ── Sync bookings to Google Calendar (push) ─────────────
  sync: technicianProcedure.mutation(async ({ ctx }) => {
    const accessToken = await getValidAccessToken(ctx.user.id);

    // Fetch upcoming bookings without Google events
    const bookings = await prisma.booking.findMany({
      where: {
        technicianId: ctx.user.id,
        status: { in: ['ACCEPTED', 'PAID', 'IN_PROGRESS'] },
        googleEventId: null,
        startAt: { gte: new Date() },
      },
      include: { service: { select: { titleJson: true } }, customer: { select: { name: true } } },
      orderBy: { startAt: 'asc' },
    });

    let synced = 0;
    for (const booking of bookings) {
      if (booking.startAt && booking.endAt) {
        const serviceName = ((booking.service.titleJson as Record<string, string>)['ar']) || 'Booking';
        const eventId = await createGoogleCalendarEvent(accessToken, {
          summary: `${serviceName} - ${booking.customer.name}`,
          description: `GOB-${booking.bookingCode}`,
          start: booking.startAt.toISOString(),
          end: booking.endAt.toISOString(),
          timezone: 'Asia/Riyadh',
        });

        if (eventId) {
          await prisma.booking.update({
            where: { id: booking.id },
            data: { googleEventId: eventId },
          });
          synced++;
        }
      }
    }

    return { synced, message: `${synced} booking(s) synced to Google Calendar` };
  }),

  // ── Pull events from Google Calendar (bidirectional) ────
  pull: technicianProcedure.mutation(async ({ ctx }) => {
    const accessToken = await getValidAccessToken(ctx.user.id);

    // Fetch events from Google Calendar (upcoming 30 days)
    const timeMin = new Date().toISOString();
    const timeMax = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!response.ok) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'Failed to fetch Google Calendar events' });
    }

    const data = (await response.json()) as Record<string, unknown>;
    const events = (data['items'] as Array<Record<string, unknown>>) || [];

    // Map events to existing bookings by GOB code in description
    let matched = 0;
    const existingBookings = await prisma.booking.findMany({
      where: {
        technicianId: ctx.user.id,
        googleEventId: null,
        status: { in: ['ACCEPTED', 'PAID', 'IN_PROGRESS'] },
        startAt: { gte: new Date() },
      },
      select: { id: true, bookingCode: true, startAt: true, endAt: true },
    });

    for (const event of events) {
      const desc = (event['description'] as string) || '';
      const gobMatch = desc.match(/GOB-(\w+)/);
      if (gobMatch) {
        const bookingCode = gobMatch[1];
        const booking = existingBookings.find((b) => b.bookingCode === bookingCode);
        if (booking && event['id']) {
          await prisma.booking.update({
            where: { id: booking.id },
            data: { googleEventId: event['id'] as string },
          });
          matched++;
        }
      }
    }

    return {
      pulled: events.length,
      matched,
      message: `${events.length} event(s) found in Google Calendar, ${matched} matched to bookings`,
    };
  }),

  // ── Delete a single synced event ────────────────────────
  unsyncBooking: technicianProcedure
    .input(z.object({ bookingId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const booking = await prisma.booking.findUnique({
        where: { id: input.bookingId },
        select: { id: true, technicianId: true, googleEventId: true },
      });

      if (!booking) throw new TRPCError({ code: 'NOT_FOUND' });
      if (booking.technicianId !== ctx.user.id) throw new TRPCError({ code: 'FORBIDDEN' });
      if (!booking.googleEventId) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Not synced to Google Calendar' });

      const accessToken = await getValidAccessToken(ctx.user.id);
      const deleted = await deleteGoogleCalendarEvent(accessToken, booking.googleEventId);

      if (deleted) {
        await prisma.booking.update({
          where: { id: booking.id },
          data: { googleEventId: null },
        });
      }

      return { success: deleted, message: deleted ? 'Event removed from Google Calendar' : 'Failed to delete event' };
    }),
});
