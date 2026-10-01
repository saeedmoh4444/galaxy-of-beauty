import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import { notFound } from '../lib/errors';
import { router, protectedProcedure, adminProcedure } from '../trpc';

export const disputeRouter = router({
  // ── Create dispute ────────────────────────────────────────────────────────
  // Covers bookings AND store orders (stage 12 — store settlement). Exactly
  // one of bookingId / storeOrderId must be provided.
  create: protectedProcedure
    .input(
      z.object({
        bookingId: z.number().optional(),
        storeOrderId: z.number().optional(),
        reason: z.string().min(1, 'Reason is required'),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { bookingId, storeOrderId, reason, description } = input;
      if (!bookingId && !storeOrderId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Either bookingId or storeOrderId is required',
        });
      }
      if (bookingId && storeOrderId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Provide bookingId OR storeOrderId, not both',
        });
      }

      if (bookingId) {
        const booking = await prisma.booking.findUnique({
          where: { id: bookingId },
          select: { customerId: true, technicianId: true },
        });

        if (!booking) {
          throw notFound('Booking');
        }

        if (booking.customerId !== ctx.user.id && booking.technicianId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You are not a participant in this booking',
          });
        }
      } else {
        const order = await prisma.storeOrder.findUnique({
          where: { id: storeOrderId },
          select: { customerId: true, vendor: { select: { userId: true } } },
        });
        if (!order) {
          throw notFound('Store order');
        }
        const isVendorOwner = order.vendor.userId === ctx.user.id;
        if (order.customerId !== ctx.user.id && !isVendorOwner) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You are not a participant in this order',
          });
        }
      }

      const dispute = await prisma.dispute.create({
        data: {
          bookingId: bookingId ?? null,
          storeOrderId: storeOrderId ?? null,
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
        throw notFound('Dispute');
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

      // Store-order refunds (stage 12): a customer-favourable resolution
      // refunds the order — the settlement run then excludes it.
      if (dispute.storeOrderId && status === 'RESOLVED_CUSTOMER') {
        await prisma.storeOrder.update({
          where: { id: dispute.storeOrderId },
          data: { status: 'REFUNDED' },
        });
      }

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
        throw notFound('Dispute');
      }

      // Only participants or admins can view — booking disputes check the
      // booking parties; store disputes fall back to raiser/admin.
      if (
        dispute.raisedBy !== ctx.user.id &&
        (!dispute.booking ||
          (dispute.booking.customerId !== ctx.user.id &&
            dispute.booking.technicianId !== ctx.user.id))
      ) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
      }

      return dispute;
    }),
});
