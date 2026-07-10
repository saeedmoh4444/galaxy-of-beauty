import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import { router, adminProcedure, technicianProcedure } from '../trpc';
import { createPayoutSchema, processPayoutSchema } from '../validators/payment';

// ---------------------------------------------------------------------------
// Additional input schemas
// ---------------------------------------------------------------------------

const payoutQuerySchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']).optional(),
  technicianId: z.number().int().positive().optional(),
  periodStart: z.string().datetime().optional(),
  periodEnd: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export const payoutRouter = router({

  // -----------------------------------------------------------------------
  // calculate — Admin computes technician earnings for a date range
  // -----------------------------------------------------------------------
  calculate: adminProcedure
    .input(createPayoutSchema)
    .mutation(async ({ input }) => {
      try {
        const periodStart = new Date(input.periodStart);
        const periodEnd = new Date(input.periodEnd);

        // Find all COMPLETED bookings within the period
        const completedBookings = await prisma.booking.findMany({
          where: {
            status: 'COMPLETED',
            createdAt: { gte: periodStart, lte: periodEnd },
          },
          select: {
            id: true,
            technicianId: true,
            totalAmount: true,
            platformFee: true,
            paymentFee: true,
            cashHandlingFee: true,
          },
        });

        // Group by technician and aggregate earnings
        const earningsMap = new Map<
          number,
          {
            technicianId: number;
            bookingCount: number;
            grossAmount: number;
            totalFees: number;
            netEarnings: number;
            bookingIds: number[];
          }
        >();

        for (const booking of completedBookings) {
          const gross = Number(booking.totalAmount);
          const fees =
            Number(booking.platformFee) +
            Number(booking.paymentFee) +
            Number(booking.cashHandlingFee);
          const net = gross - fees;

          const existing = earningsMap.get(booking.technicianId);
          if (existing) {
            existing.bookingCount += 1;
            existing.grossAmount += gross;
            existing.totalFees += fees;
            existing.netEarnings += net;
            existing.bookingIds.push(booking.id);
          } else {
            earningsMap.set(booking.technicianId, {
              technicianId: booking.technicianId,
              bookingCount: 1,
              grossAmount: gross,
              totalFees: fees,
              netEarnings: net,
              bookingIds: [booking.id],
            });
          }
        }

        const earnings = Array.from(earningsMap.values());

        // Persist — create Payout records for each technician
        for (const entry of earnings) {
          await prisma.payout.create({
            data: {
              technicianId: entry.technicianId,
              periodStart,
              periodEnd,
              amount: entry.netEarnings,
              fee: 0, // Calculated at withdrawal time; platform fees already deducted
              status: 'PENDING',
            },
          });
        }

        return {
          periodStart: input.periodStart,
          periodEnd: input.periodEnd,
          technicians: earnings.length,
          totalGross: earnings.reduce((s, e) => s + e.grossAmount, 0),
          totalFees: earnings.reduce((s, e) => s + e.totalFees, 0),
          totalNet: earnings.reduce((s, e) => s + e.netEarnings, 0),
          earnings,
        };
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to calculate payouts',
          cause: err,
        });
      }
    }),

  // -----------------------------------------------------------------------
  // process — Admin marks a payout as PROCESSING then COMPLETED
  // -----------------------------------------------------------------------
  process: adminProcedure
    .input(processPayoutSchema)
    .mutation(async ({ input }) => {
      try {
        // Verify the payout exists and is in a processable state
        const payout = await prisma.payout.findUnique({
          where: { id: input.payoutId },
        });

        if (!payout) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Payout not found',
          });
        }

        if (payout.status !== 'PENDING') {
          throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message: `Payout must be PENDING to process, current status: ${payout.status}`,
          });
        }

        // Step 1: Mark as PROCESSING
        await prisma.payout.update({
          where: { id: input.payoutId },
          data: { status: 'PROCESSING' },
        });

        // In production this would integrate with a bank transfer / wallet API.
        // For now we complete immediately.

        // Step 2: Mark as COMPLETED
        const completed = await prisma.payout.update({
          where: { id: input.payoutId },
          data: {
            status: 'COMPLETED',
            reference: `PO-${Date.now()}-${input.payoutId}`,
            processedAt: new Date(),
          },
        });

        return completed;
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to process payout',
          cause: err,
        });
      }
    }),

  // -----------------------------------------------------------------------
  // listForAdmin — List all payouts with filtering & pagination
  // -----------------------------------------------------------------------
  listForAdmin: adminProcedure
    .input(payoutQuerySchema)
    .query(async ({ input }) => {
      try {
        const where: Record<string, unknown> = {};

        if (input.status) where.status = input.status;
        if (input.technicianId) where.technicianId = input.technicianId;
        if (input.periodStart || input.periodEnd) {
          where.createdAt = {};
          if (input.periodStart) (where.createdAt as Record<string, unknown>).gte = new Date(input.periodStart);
          if (input.periodEnd) (where.createdAt as Record<string, unknown>).lte = new Date(input.periodEnd);
        }

        const [payouts, total] = await Promise.all([
          prisma.payout.findMany({
            where,
            include: {
              technician: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            skip: (input.page - 1) * input.limit,
            take: input.limit,
          }),
          prisma.payout.count({ where }),
        ]);

        return {
          payouts,
          pagination: {
            page: input.page,
            limit: input.limit,
            total,
            totalPages: Math.ceil(total / input.limit),
          },
        };
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to list payouts',
          cause: err,
        });
      }
    }),

  // -----------------------------------------------------------------------
  // listMyPayouts — Technician views their own payout history
  // -----------------------------------------------------------------------
  listMyPayouts: technicianProcedure
    .input(
      z.object({
        status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']).optional(),
        page: z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const where: Record<string, unknown> = {
          technicianId: ctx.user.id,
        };

        if (input.status) where.status = input.status;

        const [payouts, total] = await Promise.all([
          prisma.payout.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (input.page - 1) * input.limit,
            take: input.limit,
          }),
          prisma.payout.count({ where }),
        ]);

        return {
          payouts,
          pagination: {
            page: input.page,
            limit: input.limit,
            total,
            totalPages: Math.ceil(total / input.limit),
          },
        };
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve your payouts',
          cause: err,
        });
      }
    }),
});
