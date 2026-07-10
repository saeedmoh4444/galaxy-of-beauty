import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import {
  router,
  protectedProcedure,
  adminProcedure,
} from '../trpc';

export const disputeRouter = router({
  // ── Create dispute ────────────────────────────────────────────────────────
  create: protectedProcedure
    .input(
      z.object({
        bookingId: z.number(),
        reason: z.string().min(1, 'Reason is required'),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { bookingId, reason, description } = input;

      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        select: { customerId: true, technicianId: true },
      });

      if (!booking) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Booking not found' });
      }

      if (booking.customerId !== ctx.user.id && booking.technicianId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You are not a participant in this booking',
        });
      }

      const dispute = await prisma.dispute.create({
        data: {
          bookingId,
          raisedBy: ctx.user.id,
          reason,
          description,
          status: 'OPEN',
        },
      });

      return dispute;
    }),

  // ── Resolve dispute (admin) ──────────────────────────────────────────────
  resolve: adminProcedure
    .input(
      z.object({
        disputeId: z.number(),
        resolution: z.string().min(1, 'Resolution is required'),
        status: z.enum(['RESOLVED_CUSTOMER', 'RESOLVED_TECHNICIAN', 'CLOSED']),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { disputeId, resolution, status } = input;

      const existing = await prisma.dispute.findUnique({
        where: { id: disputeId },
        select: { id: true, status: true },
      });

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Dispute not found' });
      }

      if (existing.status === 'CLOSED') {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Cannot resolve a closed dispute',
        });
      }

      const dispute = await prisma.dispute.update({
        where: { id: disputeId },
        data: {
          status,
          resolution,
          resolvedBy: ctx.user.id,
          resolvedAt: new Date(),
        },
      });

      return dispute;
    }),

  // ── List disputes for current user ────────────────────────────────────────
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, limit } = input;
      const skip = (page - 1) * limit;

      const where = {
        raisedBy: ctx.user.id,
      };

      const [items, total] = await Promise.all([
        prisma.dispute.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            booking: {
              select: {
                id: true,
                bookingCode: true,
                status: true,
              },
            },
          },
        }),
        prisma.dispute.count({ where }),
      ]);

      return {
        items,
        total,
        page,
        limit,
        hasMore: skip + items.length < total,
        totalPages: Math.ceil(total / limit),
      };
    }),

  // ── List all disputes (admin) ────────────────────────────────────────────
  listAdmin: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        status: z.string().optional(),
        raisedBy: z.number().optional(),
      }),
    )
    .query(async ({ input }) => {
      const { page, limit, status, raisedBy } = input;
      const skip = (page - 1) * limit;

      const where: Record<string, unknown> = {};
      if (status) {
        where.status = status;
      }
      if (raisedBy) {
        where.raisedBy = raisedBy;
      }

      const [items, total] = await Promise.all([
        prisma.dispute.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            booking: {
              select: {
                id: true,
                bookingCode: true,
                status: true,
              },
            },
            raiser: { select: { id: true, name: true, email: true } },
            resolver: { select: { id: true, name: true, email: true } },
          },
        }),
        prisma.dispute.count({ where }),
      ]);

      return {
        items,
        total,
        page,
        limit,
        hasMore: skip + items.length < total,
        totalPages: Math.ceil(total / limit),
      };
    }),

  // ── Get dispute by ID ─────────────────────────────────────────────────────
  getById: protectedProcedure
    .input(z.object({ disputeId: z.number() }))
    .query(async ({ ctx, input }) => {
      const dispute = await prisma.dispute.findUnique({
        where: { id: input.disputeId },
        include: {
          booking: {
            select: {
              id: true,
              bookingCode: true,
              status: true,
              customerId: true,
              technicianId: true,
            },
          },
          raiser: { select: { id: true, name: true, email: true } },
          resolver: { select: { id: true, name: true, email: true } },
        },
      });

      if (!dispute) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Dispute not found' });
      }

      // Only participants or admins can view
      if (
        dispute.raisedBy !== ctx.user.id &&
        dispute.booking.customerId !== ctx.user.id &&
        dispute.booking.technicianId !== ctx.user.id
      ) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
      }

      return dispute;
    }),
});
