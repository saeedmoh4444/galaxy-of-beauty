import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { technicianProcedure, router } from '../trpc';
import { prisma } from '@galaxy/db';
import {
  exchangeGoogleCode,
  refreshGoogleToken,
  createGoogleCalendarEvent,
  getGoogleAuthUrl,
} from '../lib/googleCalendar';

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

    await prisma.technician.update({
      where: { userId: ctx.user.id },
      data: { googleCalendarToken: null, googleRefreshToken: null, googleTokenExpiry: null, googleCalendarEmail: null },
    });

    return { connected: false, message: 'Google Calendar disconnected' };
  }),

  // ── Sync bookings to Google Calendar ───────────────────
  sync: technicianProcedure.mutation(async ({ ctx }) => {
    const tech = await prisma.technician.findUnique({
      where: { userId: ctx.user.id },
      select: { googleCalendarToken: true, googleRefreshToken: true, googleTokenExpiry: true },
    });

    if (!tech?.googleCalendarToken) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'Not connected' });
    }

    // Refresh token if expired
    let accessToken = tech.googleCalendarToken;
    if (tech.googleTokenExpiry && tech.googleTokenExpiry < new Date() && tech.googleRefreshToken) {
      const newTokens = await refreshGoogleToken(tech.googleRefreshToken);
      if (newTokens) {
        accessToken = newTokens.accessToken;
        await prisma.technician.update({
          where: { userId: ctx.user.id },
          data: { googleCalendarToken: accessToken, googleTokenExpiry: new Date(newTokens.expiryDate) },
        });
      }
    }

    // Fetch upcoming bookings
    const bookings = await prisma.booking.findMany({
      where: {
        technicianId: ctx.user.id,
        status: { in: ['ACCEPTED', 'PAID', 'IN_PROGRESS'] },
        startAt: { gte: new Date() },
      },
      include: { service: { select: { titleJson: true } }, customer: { select: { name: true } } },
      orderBy: { startAt: 'asc' },
    });

    let synced = 0;
    for (const booking of bookings) {
      if (!booking.googleEventId && booking.startAt && booking.endAt) {
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
});
