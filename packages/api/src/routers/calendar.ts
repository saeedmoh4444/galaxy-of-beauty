import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { technicianProcedure, router } from '../trpc';
import { prisma } from '@galaxy/db';

export const calendarRouter = router({
  status: technicianProcedure.query(async ({ ctx }) => {
    const technician = await prisma.technician.findUnique({
      where: { userId: ctx.user.id },
      select: {
        googleCalendarToken: true,
        googleCalendarEmail: true,
      },
    });

    if (!technician) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Technician profile not found',
      });
    }

    return {
      connected: technician.googleCalendarToken !== null,
      email: technician.googleCalendarEmail ?? null,
      lastSync: null, // TODO: track last sync timestamp
    };
  }),

  connect: technicianProcedure
    .input(z.object({ authCode: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // TODO: Implement actual Google OAuth flow
      // Exchange authCode for tokens using googleapis
      const stubEmail = `technician-${ctx.user.id}@gmail.com`;

      await prisma.technician.update({
        where: { userId: ctx.user.id },
        data: {
          googleCalendarToken: `stub-token-${input.authCode}`,
          googleCalendarEmail: stubEmail,
        },
      });

      return {
        connected: true,
        email: stubEmail,
        message: 'Google Calendar connected successfully',
      };
    }),

  disconnect: technicianProcedure.mutation(async ({ ctx }) => {
    const technician = await prisma.technician.findUnique({
      where: { userId: ctx.user.id },
    });
    if (!technician) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Technician profile not found',
      });
    }

    if (!technician.googleCalendarToken) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Google Calendar is not connected',
      });
    }

    await prisma.technician.update({
      where: { userId: ctx.user.id },
      data: {
        googleCalendarToken: null,
        googleCalendarEmail: null,
      },
    });

    return {
      connected: false,
      message: 'Google Calendar disconnected successfully',
    };
  }),

  sync: technicianProcedure.mutation(async ({ ctx }) => {
    const technician = await prisma.technician.findUnique({
      where: { userId: ctx.user.id },
      select: { googleCalendarToken: true },
    });

    if (!technician?.googleCalendarToken) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Google Calendar is not connected. Please connect first.',
      });
    }

    // TODO: Implement actual Google Calendar sync
    // 1. Fetch upcoming bookings for this technician
    // 2. Create/update events in Google Calendar
    // 3. Sync events from Google Calendar to availability slots

    return {
      synced: 0,
      message: 'Calendar sync completed. (Stub: 0 events synced)',
    };
  }),
});
