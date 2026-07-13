import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import { protectedProcedure, router } from '../trpc';
import { emitToUser } from '../socket/index';

export const chatRouter = router({
  // Get messages for a booking's chat room
  messages: protectedProcedure
    .input(z.object({ bookingId: z.number().int().positive(), page: z.number().default(1), limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      const booking = await prisma.booking.findUnique({ where: { id: input.bookingId } });
      if (!booking) throw new TRPCError({ code: 'NOT_FOUND' });
      if (booking.customerId !== ctx.user.id && booking.technicianId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      const skip = (input.page - 1) * input.limit;
      const [items, total] = await Promise.all([
        prisma.chatMessage.findMany({
          where: { receiverId: ctx.user.id },
          orderBy: { createdAt: 'desc' },
          skip, take: input.limit,
        }),
        prisma.chatMessage.count({ where: { receiverId: ctx.user.id } }),
      ]);

      return { items, total, page: input.page };
    }),

  // Send a message
  send: protectedProcedure
    .input(z.object({
      receiverId: z.number().int().positive(),
      bookingId: z.number().int().positive().optional(),
      content: z.string().min(1).max(2000),
    }))
    .mutation(async ({ ctx, input }) => {
      const msg = await prisma.chatMessage.create({
        data: {
          senderId: ctx.user.id,
          receiverId: input.receiverId,
          bookingId: input.bookingId,
          content: input.content,
        },
        include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
      });

      // Emit real-time message to receiver
      emitToUser(input.receiverId, 'new_message', msg);
      return msg;
    }),

  // List conversations (preview last message per booking)
  conversations: protectedProcedure.query(async ({ ctx }) => {
    // Get distinct booking chats the user is part of
    const bookings = await prisma.booking.findMany({
      where: {
        OR: [{ customerId: ctx.user.id }, { technicianId: ctx.user.id }],
        status: { notIn: ['CANCELLED', 'REJECTED', 'COMPLETED'] },
      },
      include: {
        customer: { select: { id: true, name: true, avatarUrl: true } },
        technician: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });

    return bookings.map((b) => ({
      bookingId: b.id,
      bookingCode: b.bookingCode,
      otherParty: ctx.user.id === b.customerId ? b.technician : b.customer,
    }));
  }),
});
