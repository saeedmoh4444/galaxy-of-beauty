import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import { DEFAULT_PAGE_SIZE } from '@galaxy/shared';
import { publicProcedure, adminProcedure, customerProcedure, router } from '../trpc';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- EventRegistration has no relations in Prisma schema (legacy include)
const db = prisma as any;

export const beautyEventRouter = router({
  upcoming: publicProcedure.query(async () =>
    db.beautyEvent.findMany({
      where: { isPublished: true, startsAt: { gte: new Date() } },
      orderBy: { startsAt: 'asc' },
      take: DEFAULT_PAGE_SIZE,
    }),
  ),
  // Public: ALL published events — the /events page filters client-side
  // by type and shows past + upcoming (was missing entirely: the page
  // called beautyEvents.list and every visit 404ed the procedure).
  list: publicProcedure.query(async () =>
    db.beautyEvent.findMany({
      where: { isPublished: true },
      orderBy: { startsAt: 'asc' },
    }),
  ),
  listAll: adminProcedure.query(async () =>
    db.beautyEvent.findMany({ orderBy: { startsAt: 'desc' }, take: 100 }),
  ),

  create: adminProcedure
    .input(
      z.object({
        nameAr: z.string(),
        nameEn: z.string(),
        descriptionAr: z.string().optional(),
        descriptionEn: z.string().optional(),
        eventType: z.enum(['workshop', 'masterclass', 'launch', 'seasonal']),
        location: z.string().optional(),
        price: z.number().optional(),
        maxAttendees: z.number().optional(),
        startsAt: z.string().datetime(),
        endsAt: z.string().datetime(),
        imageUrl: z.string().optional(),
        isPublished: z.boolean().default(false),
      }),
    )
    .mutation(async ({ input }) =>
      db.beautyEvent.create({
        data: {
          nameJson: { ar: input.nameAr, en: input.nameEn },
          descriptionJson: input.descriptionAr
            ? { ar: input.descriptionAr, en: input.descriptionEn }
            : undefined,
          eventType: input.eventType,
          location: input.location,
          price: input.price,
          maxAttendees: input.maxAttendees,
          startsAt: new Date(input.startsAt),
          endsAt: new Date(input.endsAt),
          imageUrl: input.imageUrl,
          isPublished: input.isPublished,
        },
      }),
    ),

  // 2.4a — capacity-aware registration: overflow lands on the waitlist,
  // and re-registering never downgrades or re-queues an existing row.
  register: customerProcedure
    .input(z.object({ eventId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const event = await prisma.beautyEvent.findUnique({
        where: { id: input.eventId },
      });
      if (!event) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' });
      }
      if (event.startsAt < new Date()) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Event has already started' });
      }

      return prisma.$transaction(async (tx) => {
        const existing = await tx.eventRegistration.findUnique({
          where: { eventId_userId: { eventId: input.eventId, userId: ctx.user.id } },
        });
        if (existing) return existing;

        const registeredCount = await tx.eventRegistration.count({
          where: { eventId: input.eventId, status: 'REGISTERED' },
        });
        const status =
          event.maxAttendees !== null && registeredCount >= event.maxAttendees
            ? 'WAITLIST'
            : 'REGISTERED';
        return tx.eventRegistration.create({
          data: { eventId: input.eventId, userId: ctx.user.id, status },
        });
      });
    }),

  myRegistrations: customerProcedure.query(async ({ ctx }) =>
    db.eventRegistration.findMany({
      where: { userId: ctx.user.id },
      include: { event: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
  ),

  // 2.4a — cancelling a REGISTERED spot promotes the oldest waiter.
  cancelRegistration: customerProcedure
    .input(z.object({ eventId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return prisma.$transaction(async (tx) => {
        const row = await tx.eventRegistration.findUnique({
          where: { eventId_userId: { eventId: input.eventId, userId: ctx.user.id } },
        });
        let promotedUserId: number | null = null;
        if (row) {
          await tx.eventRegistration.delete({ where: { id: row.id } });
          if (row.status === 'REGISTERED') {
            const oldestWaiter = await tx.eventRegistration.findFirst({
              where: { eventId: input.eventId, status: 'WAITLIST' },
              orderBy: { id: 'asc' },
            });
            if (oldestWaiter) {
              await tx.eventRegistration.update({
                where: { id: oldestWaiter.id },
                data: { status: 'REGISTERED' },
              });
              promotedUserId = oldestWaiter.userId;
            }
          }
        }
        return { success: true, promotedUserId };
      });
    }),

  // 2.4a — 1-based position among the waitlisted (0 when not waiting).
  waitlistPosition: customerProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ ctx, input }) => {
      const mine = await prisma.eventRegistration.findUnique({
        where: { eventId_userId: { eventId: input.eventId, userId: ctx.user.id } },
      });
      if (!mine || mine.status !== 'WAITLIST') return { position: 0 };
      const ahead = await prisma.eventRegistration.count({
        where: { eventId: input.eventId, status: 'WAITLIST', id: { lt: mine.id } },
      });
      return { position: ahead + 1 };
    }),
});
