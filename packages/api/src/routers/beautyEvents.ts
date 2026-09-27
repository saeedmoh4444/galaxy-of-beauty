import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import type { BeautyEvent } from '@galaxy/db';
import { DEFAULT_PAGE_SIZE } from '@galaxy/shared';
import { publicProcedure, adminProcedure, customerProcedure, router } from '../trpc';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- EventRegistration has no relations in Prisma schema (legacy include)
const db = prisma as any;

const stripAccess = <T extends { meetingUrl?: string | null; recordingUrl?: string | null }>(
  rows: T[],
): Array<Omit<T, 'meetingUrl' | 'recordingUrl'>> =>
  rows.map(({ meetingUrl: _meetingUrl, recordingUrl: _recordingUrl, ...rest }) => rest);

export const beautyEventRouter = router({
  upcoming: publicProcedure.query(async () =>
    stripAccess<BeautyEvent>(
      await db.beautyEvent.findMany({
        where: { isPublished: true, startsAt: { gte: new Date() } },
        orderBy: { startsAt: 'asc' },
        take: DEFAULT_PAGE_SIZE,
      }),
    ),
  ),
  // Public: ALL published events — the /events page filters client-side
  // by type and shows past + upcoming (was missing entirely: the page
  // called beautyEvents.list and every visit 404ed the procedure).
  list: publicProcedure.query(async () =>
    stripAccess<BeautyEvent>(
      await db.beautyEvent.findMany({
        where: { isPublished: true },
        orderBy: { startsAt: 'asc' },
      }),
    ),
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
        eventType: z.enum(['workshop', 'masterclass', 'launch', 'seasonal', 'retreat', 'webinar']),
        location: z.string().optional(),
        price: z.number().optional(),
        maxAttendees: z.number().optional(),
        startsAt: z.string().datetime(),
        endsAt: z.string().datetime(),
        imageUrl: z.string().optional(),
        isPublished: z.boolean().default(false),
        // 2.4b — tiers + online delivery.
        tier: z.enum(['FREE', 'PAID', 'VIP']).optional(),
        goodieBag: z.boolean().optional(),
        meetingProvider: z.enum(['zoom', 'gmeet']).optional(),
        meetingUrl: z.string().url().optional(),
        recordingUrl: z.string().url().optional(),
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
          tier: input.tier ?? 'PAID',
          goodieBag: input.goodieBag ?? false,
          meetingProvider: input.meetingProvider ?? null,
          meetingUrl: input.meetingUrl ?? null,
          recordingUrl: input.recordingUrl ?? null,
        },
      }),
    ),

  // 2.4b — admin partial update (tiers, capacity, publishing, links).
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        nameAr: z.string().optional(),
        nameEn: z.string().optional(),
        descriptionAr: z.string().optional(),
        descriptionEn: z.string().optional(),
        eventType: z
          .enum(['workshop', 'masterclass', 'launch', 'seasonal', 'retreat', 'webinar'])
          .optional(),
        location: z.string().nullable().optional(),
        price: z.number().nullable().optional(),
        maxAttendees: z.number().nullable().optional(),
        startsAt: z.string().datetime().optional(),
        endsAt: z.string().datetime().optional(),
        imageUrl: z.string().nullable().optional(),
        isPublished: z.boolean().optional(),
        tier: z.enum(['FREE', 'PAID', 'VIP']).optional(),
        goodieBag: z.boolean().optional(),
        meetingProvider: z.enum(['zoom', 'gmeet']).nullable().optional(),
        meetingUrl: z.string().url().nullable().optional(),
        recordingUrl: z.string().url().nullable().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, nameAr, nameEn, descriptionAr, descriptionEn, startsAt, endsAt, ...rest } = input;
      return db.beautyEvent.update({
        where: { id },
        data: {
          ...(nameAr ? { nameJson: { ar: nameAr, en: nameEn } } : {}),
          ...(descriptionAr !== undefined
            ? { descriptionJson: descriptionAr ? { ar: descriptionAr, en: descriptionEn } : null }
            : {}),
          ...(startsAt ? { startsAt: new Date(startsAt) } : {}),
          ...(endsAt ? { endsAt: new Date(endsAt) } : {}),
          ...rest,
        },
      });
    }),

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

  // 2.4b — meeting/recording links are served only to REGISTERED
  // attendees (waitlisted members do not get in-room links).
  accessDetails: customerProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ ctx, input }) => {
      const [event, registration] = await Promise.all([
        prisma.beautyEvent.findUnique({ where: { id: input.eventId } }),
        prisma.eventRegistration.findUnique({
          where: { eventId_userId: { eventId: input.eventId, userId: ctx.user.id } },
        }),
      ]);
      if (!event) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' });
      }
      if (!registration || registration.status !== 'REGISTERED') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only registered attendees can access this content',
        });
      }
      return {
        meetingProvider: event.meetingProvider,
        meetingUrl: event.meetingUrl,
        recordingUrl: event.recordingUrl,
        goodieBag: event.tier === 'VIP' && event.goodieBag,
        tier: event.tier,
      };
    }),

  // 2.4c — certificates of completion. One per REGISTERED attendee of a
  // finished professional event (workshop/masterclass/retreat).
  issueCertificates: adminProcedure
    .input(z.object({ eventId: z.number() }))
    .mutation(async ({ input }) => {
      const event = await prisma.beautyEvent.findUnique({ where: { id: input.eventId } });
      if (!event) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' });
      }
      if (event.endsAt > new Date()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Certificates can only be issued after the event ends',
        });
      }
      if (!['workshop', 'masterclass', 'retreat'].includes(event.eventType)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Certificates are only issued for professional courses',
        });
      }

      const registrations = await prisma.eventRegistration.findMany({
        where: { eventId: input.eventId, status: 'REGISTERED' },
        orderBy: { id: 'asc' },
      });
      const existing = new Set(
        (
          await prisma.eventCertificate.findMany({
            where: { registrationId: { in: registrations.map((r) => r.id) } },
            select: { registrationId: true },
          })
        ).map((c) => c.registrationId),
      );

      let issued = 0;
      for (const reg of registrations) {
        if (existing.has(reg.id)) continue;
        const number = `GOB-CERT-${String(event.id).padStart(4, '0')}-${String(reg.id).padStart(4, '0')}`;
        await prisma.eventCertificate.create({
          data: { registrationId: reg.id, certificateNumber: number },
        });
        issued++;
      }
      return { issued };
    }),

  myCertificates: customerProcedure.query(async ({ ctx }) => {
    const mine = await prisma.eventRegistration.findMany({
      where: { userId: ctx.user.id },
      select: { id: true, eventId: true, status: true },
    });
    const certs = await prisma.eventCertificate.findMany({
      where: { registrationId: { in: mine.map((r) => r.id) } },
      orderBy: { issuedAt: 'desc' },
    });
    const regById = new Map(mine.map((r) => [r.id, r]));
    return certs.map((c) => ({
      id: c.id,
      certificateNumber: c.certificateNumber,
      issuedAt: c.issuedAt,
      eventId: regById.get(c.registrationId)?.eventId ?? null,
    }));
  }),
});
