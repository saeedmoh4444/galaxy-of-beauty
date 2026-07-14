import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import crypto from 'crypto';
import { prisma } from '@galaxy/db';
import { protectedProcedure, router } from '../trpc';
import { emitToUser } from '../socket/index';

export const videoRouter = router({
  // Start a video session for a booking
  startSession: protectedProcedure
    .input(z.object({ bookingId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const booking = await prisma.booking.findUnique({ where: { id: input.bookingId } });
      if (!booking) throw new TRPCError({ code: 'NOT_FOUND' });
      if (booking.customerId !== ctx.user.id && booking.technicianId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      const existing = await prisma.videoSession.findUnique({ where: { bookingId: input.bookingId } });
      if (existing) {
        await prisma.videoSession.update({
          where: { id: existing.id },
          data: { status: 'IN_PROGRESS', startedAt: new Date() },
        });
        return existing;
      }

      const roomId = `video-${crypto.randomUUID().slice(0, 12)}`;
      const session = await prisma.videoSession.create({
        data: { bookingId: input.bookingId, roomId, initiatorId: ctx.user.id, status: 'WAITING' },
      });

      // Notify the other party
      const otherId = ctx.user.id === booking.customerId ? booking.technicianId : booking.customerId;
      emitToUser(otherId, 'video_call_started', { roomId, bookingId: input.bookingId });

      return session;
    }),

  // Get session by booking ID
  getByBooking: protectedProcedure
    .input(z.object({ bookingId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const booking = await prisma.booking.findUnique({ where: { id: input.bookingId } });
      if (!booking || (booking.customerId !== ctx.user.id && booking.technicianId !== ctx.user.id)) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      return prisma.videoSession.findUnique({ where: { bookingId: input.bookingId } });
    }),

  // End a session
  endSession: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .mutation(async ({ input }) => {
      const session = await prisma.videoSession.findUnique({ where: { roomId: input.roomId } });
      if (!session) throw new TRPCError({ code: 'NOT_FOUND' });

      const endTime = new Date();
      const duration = session.startedAt
        ? Math.round((endTime.getTime() - session.startedAt.getTime()) / 1000)
        : 0;

      return prisma.videoSession.update({
        where: { id: session.id },
        data: { status: 'ENDED', endedAt: endTime, durationSec: duration },
      });
    }),
});
