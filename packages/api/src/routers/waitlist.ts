import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import {
  router,
  publicProcedure,
  customerProcedure,
  technicianProcedure,
} from '../trpc';

export const waitlistRouter = router({
  // ── Join waitlist ─────────────────────────────────────────────────────────
  join: customerProcedure
    .input(
      z.object({
        technicianId: z.number(),
        serviceId: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { technicianId, serviceId } = input;

      // Check technician exists
      const technician = await prisma.technician.findUnique({
        where: { userId: technicianId },
      });

      if (!technician) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Technician not found' });
      }

      // Check not already on waitlist for this technician
      const existing = await prisma.waitlistEntry.findUnique({
        where: {
          technicianId_customerId: {
            technicianId: technician.id,
            customerId: ctx.user.id,
          },
        },
      });

      if (existing && existing.status === 'WAITING') {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'You are already on the waitlist for this technician',
        });
      }

      // Calculate position
      const waitingCount = await prisma.waitlistEntry.count({
        where: {
          technicianId: technician.id,
          status: 'WAITING',
        },
      });

      const entry = await prisma.waitlistEntry.create({
        data: {
          customerId: ctx.user.id,
          technicianId: technician.id,
          serviceId,
          position: waitingCount + 1,
          status: 'WAITING',
        },
      });

      return {
        ...entry,
        position: waitingCount + 1,
      };
    }),

  // ── Leave waitlist ────────────────────────────────────────────────────────
  leave: customerProcedure
    .input(z.object({ technicianId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const technician = await prisma.technician.findUnique({
        where: { userId: input.technicianId },
        select: { id: true },
      });

      if (!technician) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Technician not found' });
      }

      const entry = await prisma.waitlistEntry.findUnique({
        where: {
          technicianId_customerId: {
            technicianId: technician.id,
            customerId: ctx.user.id,
          },
        },
      });

      if (!entry) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'You are not on the waitlist for this technician',
        });
      }

      await prisma.waitlistEntry.delete({
        where: { id: entry.id },
      });

      // Recalculate positions for remaining WAITING entries
      const remaining = await prisma.waitlistEntry.findMany({
        where: {
          technicianId: technician.id,
          status: 'WAITING',
        },
        orderBy: { position: 'asc' },
      });

      for (let i = 0; i < remaining.length; i++) {
        if (remaining[i]!.position !== i + 1) {
          await prisma.waitlistEntry.update({
            where: { id: remaining[i]!.id },
            data: { position: i + 1 },
          });
        }
      }

      return { success: true };
    }),

  // ── Get my position ───────────────────────────────────────────────────────
  getMyPosition: customerProcedure
    .input(z.object({ technicianId: z.number() }))
    .query(async ({ ctx, input }) => {
      const technician = await prisma.technician.findUnique({
        where: { userId: input.technicianId },
        select: { id: true },
      });

      if (!technician) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Technician not found' });
      }

      const entry = await prisma.waitlistEntry.findUnique({
        where: {
          technicianId_customerId: {
            technicianId: technician.id,
            customerId: ctx.user.id,
          },
        },
      });

      return {
        onWaitlist: !!entry,
        position: entry?.position ?? null,
        status: entry?.status ?? null,
      };
    }),

  // ── Get waitlist status for a technician (public) ─────────────────────────
  getStatus: publicProcedure
    .input(z.object({ technicianId: z.number() }))
    .query(async ({ input }) => {
      const technician = await prisma.technician.findUnique({
        where: { userId: input.technicianId },
        select: { id: true },
      });

      if (!technician) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Technician not found' });
      }

      const count = await prisma.waitlistEntry.count({
        where: {
          technicianId: technician.id,
          status: 'WAITING',
        },
      });

      return {
        technicianId: input.technicianId,
        waitlistCount: count,
      };
    }),

  // ── Notify next customer (technician) ─────────────────────────────────────
  notifyNext: technicianProcedure
    .input(z.object({ entryId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const entry = await prisma.waitlistEntry.findUnique({
        where: { id: input.entryId },
        include: {
          technician: { select: { userId: true } },
        },
      });

      if (!entry) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Waitlist entry not found' });
      }

      if (entry.technician.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only manage your own waitlist',
        });
      }

      if (entry.status !== 'WAITING') {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: `Entry is already ${entry.status.toLowerCase()}`,
        });
      }

      const updated = await prisma.waitlistEntry.update({
        where: { id: input.entryId },
        data: {
          status: 'NOTIFIED',
          notifiedAt: new Date(),
        },
      });

      // TODO: Send push notification to the customer
      console.log(
        `[Waitlist] tech=${ctx.user.id} notified customer=${entry.customerId} (entry=${entry.id})`,
      );

      return updated;
    }),

  // ── Claim waitlist entry (technician) ─────────────────────────────────────
  claim: technicianProcedure
    .input(z.object({ entryId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const entry = await prisma.waitlistEntry.findUnique({
        where: { id: input.entryId },
        include: {
          technician: { select: { userId: true } },
        },
      });

      if (!entry) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Waitlist entry not found' });
      }

      if (entry.technician.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only manage your own waitlist',
        });
      }

      if (entry.status !== 'NOTIFIED') {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Entry must be in NOTIFIED status before claiming',
        });
      }

      const updated = await prisma.waitlistEntry.update({
        where: { id: input.entryId },
        data: {
          status: 'CLAIMED',
          claimedAt: new Date(),
        },
      });

      return updated;
    }),
});
