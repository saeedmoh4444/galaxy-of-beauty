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

  // Purchase/reserve a ticket
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
      return {
        ticketId: `TKT-${ctx.user.id}-${input.eventId}-${Date.now()}`,
        eventId: input.eventId,
        eventName: (event.nameJson as Record<string, string>)?.ar ?? '',
        attendeeName: input.attendeeName,
        price: Number(event.price ?? 0),
        status: 'RESERVED',
      };
    }),

  // My tickets
  myTickets: customerProcedure.query(async () => ({ tickets: [] })),
});
