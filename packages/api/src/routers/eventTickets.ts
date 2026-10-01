import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { DEFAULT_PAGE_SIZE } from '@galaxy/shared';
import { customerProcedure, publicProcedure, router } from '../trpc';

const db = prisma;

export const eventTicketsRouter = router({
  // List events with available tickets
  available: publicProcedure.query(async () => {
    const events = await db.beautyEvent.findMany({
      where: { isPublished: true, startsAt: { gte: new Date() } },
      orderBy: { startsAt: 'asc' },
      take: DEFAULT_PAGE_SIZE,
    });
    return events.map((e: any) => ({ ...e, price: Number(e.price ?? 0) }));
  }),

  // Purchase/reserve a ticket — persisted (W9)
  reserve: customerProcedure
    .input(
      z.object({
        eventId: z.number(),
        attendeeName: z.string().min(1),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const event = await db.beautyEvent.findUnique({ where: { id: input.eventId } });
      if (!event) throw new Error('الفعالية غير موجودة');

      if (event.maxAttendees) {
        const booked = await db.eventTicket.count({
          where: { eventId: event.id, status: { not: 'CANCELLED' } },
        });
        if (booked >= event.maxAttendees) throw new Error('التذاكر نفدت');
      }

      const ticket = await db.eventTicket.create({
        data: {
          eventId: event.id,
          userId: ctx.user.id,
          attendeeName: input.attendeeName,
          notes: input.notes,
          status: 'RESERVED',
        },
      });

      return {
        ticketId: ticket.id,
        eventId: event.id,
        eventName: (event.nameJson as Record<string, string>)?.ar ?? '',
        attendeeName: ticket.attendeeName,
        price: Number(event.price ?? 0),
        status: ticket.status,
      };
    }),

  // My tickets — real rows (W9)
  myTickets: customerProcedure.query(async ({ ctx }) => {
    const tickets = await db.eventTicket.findMany({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: 'desc' },
      include: { event: { select: { nameJson: true, startsAt: true, location: true } } },
    });
    return {
      tickets: tickets.map((t) => ({
        id: t.id,
        eventId: t.eventId,
        eventName: (t.event.nameJson as Record<string, string>)?.ar ?? '',
        startsAt: t.event.startsAt,
        location: t.event.location,
        attendeeName: t.attendeeName,
        notes: t.notes,
        status: t.status,
        createdAt: t.createdAt,
      })),
    };
  }),
});
