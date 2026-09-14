import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import { computeCyclePredictions, GOOGLE_OAUTH_REDIRECT_URI } from '@galaxy/shared';
import { customerProcedure, router } from '../trpc';
import {
  exchangeGoogleCode,
  createGoogleCalendarEvent,
  getGoogleAuthUrl,
} from '../lib/googleCalendar';

const db = prisma;
const PROVIDER = 'google_calendar';

const redirectUri = process.env['GOOGLE_OAUTH_REDIRECT_URI'] ?? GOOGLE_OAUTH_REDIRECT_URI;

function isConfigured(): boolean {
  return !!(process.env['GOOGLE_CLIENT_ID'] && process.env['GOOGLE_CLIENT_SECRET']);
}

/**
 * E9 — real customer Google Calendar sync (was a hardcoded mock). OAuth
 * tokens live on BeautyIntegration; the calendar itself is only touched
 * when Google credentials are configured — everything else degrades
 * gracefully.
 */
export const calendarSyncRouter = router({
  /** authUrl — the Google OAuth consent URL to start the connect flow. */
  authUrl: customerProcedure.input(z.object({}).optional()).query(({ ctx }) => {
    const url = getGoogleAuthUrl(redirectUri, `gob-${ctx.user.id}`);
    return url; // null when credentials are not configured
  }),

  /** status — real integration state (was a module-level mock). */
  status: customerProcedure.query(async ({ ctx }) => {
    const integration = await db.beautyIntegration.findUnique({
      where: { userId_provider: { userId: ctx.user.id, provider: PROVIDER } },
    });
    return {
      connected: !!integration && integration.status === 'CONNECTED',
      lastSynced: integration?.updatedAt?.toISOString() ?? null,
      upcomingEvents: 0,
      provider: 'google',
      configured: isConfigured(),
    };
  }),

  /** connect — exchange the OAuth code and store the tokens. */
  connect: customerProcedure
    .input(z.object({ authCode: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      if (!isConfigured()) {
        throw new TRPCError({
          code: 'NOT_IMPLEMENTED',
          message: 'Google Calendar is not configured on the server',
        });
      }
      const tokens = await exchangeGoogleCode(input.authCode, redirectUri);
      if (!tokens) {
        return { connected: false, message: 'تعذر التحقق من رمز التفويض' };
      }

      await db.beautyIntegration.upsert({
        where: { userId_provider: { userId: ctx.user.id, provider: PROVIDER } },
        create: {
          userId: ctx.user.id,
          provider: PROVIDER,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          tokenExpiry: new Date(tokens.expiryDate),
          status: 'CONNECTED',
        },
        update: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          tokenExpiry: new Date(tokens.expiryDate),
          status: 'CONNECTED',
        },
      });
      return { connected: true, message: 'تم ربط التقويم بنجاح! 🎉', upcomingEvents: 0 };
    }),

  /** disconnect — remove the stored integration. */
  disconnect: customerProcedure.mutation(async ({ ctx }) => {
    await db.beautyIntegration.deleteMany({
      where: { userId: ctx.user.id, provider: PROVIDER },
    });
    return { disconnected: true };
  }),

  /** upcoming — the caller's REAL upcoming bookings (was a mock list). */
  upcoming: customerProcedure.query(async ({ ctx }) => {
    const bookings = await db.booking.findMany({
      where: {
        customerId: ctx.user.id,
        status: { in: ['ACCEPTED', 'CONFIRMED_OFFLINE', 'PAID', 'IN_PROGRESS'] },
        startAt: { gte: new Date() },
      },
      orderBy: { startAt: 'asc' },
      take: 5,
      include: {
        technician: { select: { name: true } },
        service: { select: { titleJson: true } },
      },
    });
    return bookings.map((b) => ({
      id: b.id,
      title: ((b.service?.titleJson as Record<string, string> | null)?.ar ?? '') || 'حجز',
      date: b.startAt.toISOString(),
      technician: b.technician?.name ?? '',
      emoji: '💅',
      // Booking auto-sync (E9 follow-up): true when the event already
      // lives on the customer's Google Calendar.
      synced: !!b.googleEventId,
    }));
  }),

  /**
   * syncBookings — backfill push of the caller's upcoming active bookings
   * that are not yet on their Google Calendar (googleEventId IS NULL —
   * e.g. bookings made before the auto-sync feature). Synchronous so the
   * UI can show a per-run count; each Google failure is swallowed.
   */
  syncBookings: customerProcedure.mutation(async ({ ctx }) => {
    const integration = await db.beautyIntegration.findUnique({
      where: { userId_provider: { userId: ctx.user.id, provider: PROVIDER } },
    });
    if (!integration || integration.status !== 'CONNECTED' || !integration.accessToken) {
      return { connected: false, synced: 0 };
    }

    const bookings = await db.booking.findMany({
      where: {
        customerId: ctx.user.id,
        status: { in: ['ACCEPTED', 'CONFIRMED_OFFLINE', 'PAID', 'IN_PROGRESS'] },
        startAt: { gte: new Date() },
        googleEventId: null,
      },
      orderBy: { startAt: 'asc' },
      include: { service: { select: { titleJson: true } } },
    });

    let synced = 0;
    for (const b of bookings) {
      try {
        const title = ((b.service?.titleJson as Record<string, string> | null)?.ar ?? '') || 'حجز';
        const eventId = await createGoogleCalendarEvent(integration.accessToken, {
          summary: `💅 ${title} — ${b.bookingCode}`,
          description: 'حجز من منصة دلال — Dalal booking',
          start: b.startAt.toISOString(),
          end: b.endAt.toISOString(),
        });
        if (eventId) {
          await db.booking.update({
            where: { id: b.id },
            data: { googleEventId: eventId },
          });
          synced++;
        }
      } catch (err) {
        console.log(`[CalendarSync] backfill failed for booking #${b.id}:`, err);
      }
    }
    return { connected: true, synced };
  }),

  /**
   * syncCycleEvents — push the next 3 predicted periods to the connected
   * Google Calendar. Graceful: no integration → connected:false.
   */
  syncCycleEvents: customerProcedure.mutation(async ({ ctx }) => {
    const integration = await db.beautyIntegration.findUnique({
      where: { userId_provider: { userId: ctx.user.id, provider: PROVIDER } },
    });
    if (!integration || !integration.accessToken) {
      return { connected: false, synced: 0 };
    }

    const settings = await db.cycleSettings.findUnique({ where: { userId: ctx.user.id } });
    const p = computeCyclePredictions({
      cycleLength: settings?.cycleLength ?? 28,
      lastPeriodStart: settings?.lastPeriodStart ?? null,
      avgCycleLength: settings?.avgCycleLength,
    });
    if (!p.nextPeriodDate) return { connected: true, synced: 0 };

    let synced = 0;
    const start = new Date(p.nextPeriodDate);
    for (let i = 0; i < 3; i++) {
      const periodStart = new Date(start.getTime() + i * p.cycleLength * 86_400_000);
      const periodEnd = new Date(
        periodStart.getTime() + (settings?.periodLength ?? 5) * 86_400_000,
      );
      const eventId = await createGoogleCalendarEvent(integration.accessToken, {
        summary: `🩸 الدورة المتوقعة ${i === 0 ? '(القادمة)' : ''}`,
        description: 'توقع من مجرة الجمال — سجلي دورتك لتحديث التوقعات',
        start: periodStart.toISOString(),
        end: periodEnd.toISOString(),
      });
      if (eventId) synced++;
    }
    return { connected: true, synced };
  }),
});
