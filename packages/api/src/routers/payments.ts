import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import {
  router,
  publicProcedure,
  protectedProcedure,
  customerProcedure,
  technicianProcedure,
  adminProcedure,
} from '../trpc';
import { emitToUser, emitToAdmin } from '../socket/index';
import { authorizePayment, verifyWebhookSignature } from '../lib/payfort';

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

const authorizeSchema = z.object({
  bookingId: z.number().int().positive(),
  method: z.enum(['online', 'cash']).default('online'),
  idempotencyKey: z.string().uuid(),
});

const bookingIdSchema = z.object({
  bookingId: z.number().int().positive(),
});

const webhookSchema = z.object({
  gatewayRef: z.string(),
  status: z.string(),
  signature: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export const paymentRouter = router({

  // -----------------------------------------------------------------------
  // authorize — Customer initiates payment for an accepted booking
  // -----------------------------------------------------------------------
  authorize: customerProcedure
    .input(authorizeSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // 1. Idempotency check
        const existing = await prisma.payment.findUnique({
          where: { idempotencyKey: input.idempotencyKey },
        });
        if (existing) {
          return existing;
        }

        // 2. Find booking and verify ownership + status
        const booking = await prisma.booking.findUnique({
          where: { id: input.bookingId },
          include: { service: true },
        });

        if (!booking) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Booking not found',
          });
        }

        if (booking.customerId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not own this booking',
          });
        }

        if (booking.status !== 'ACCEPTED') {
          throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message: `Booking must be ACCEPTED to authorize payment, current status: ${booking.status}`,
          });
        }

        // 3-4. Create payment record
        const payment = await prisma.payment.create({
          data: {
            bookingId: booking.id,
            amount: booking.totalAmount,
            currency: 'SAR',
            status: 'AUTHORIZED',
            idempotencyKey: input.idempotencyKey,
          },
        });

        if (input.method === 'cash') {
          // Cash on arrival — mark booking as confirmed offline
          await prisma.booking.update({
            where: { id: booking.id },
            data: { status: 'CONFIRMED_OFFLINE' },
          });
        } else {
          // Online — PayFort/APS payment gateway integration
          const user = await prisma.user.findUnique({
            where: { id: ctx.user.id },
            select: { email: true, name: true },
          });

          const appUrl = process.env['NEXT_PUBLIC_APP_URL'] || 'http://localhost:3000';

          const payfortResult = await authorizePayment({
            amount: Number(booking.totalAmount),
            currency: 'SAR',
            customerEmail: user?.email || '',
            customerName: user?.name || 'Customer',
            merchantReference: `GOB-BOOKING-${booking.id}`,
            returnUrl: `${appUrl}/bookings/${booking.id}`,
          });

          // Update payment with gateway reference
          const updateData: Record<string, string | null> = {};
          if (payfortResult.gatewayRef) {
            updateData.gatewayRef = payfortResult.gatewayRef;
          }

          if (Object.keys(updateData).length > 0) {
            await prisma.payment.update({
              where: { id: payment.id },
              data: updateData as { gatewayRef?: string },
            });
          }

          if (!payfortResult.success) {
            // Payment gateway returned an error
            await prisma.payment.update({
              where: { id: payment.id },
              data: { status: 'FAILED' },
            });
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: `Payment failed: ${payfortResult.message}`,
            });
          }

          return {
            paymentUrl: payfortResult.paymentUrl,
            paymentId: payment.id,
            gatewayRef: payfortResult.gatewayRef,
          };
        }

        return {
          paymentId: payment.id,
          status: payment.status,
          method: input.method,
        };
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to authorize payment',
          cause: err,
        });
      }
    }),

  // -----------------------------------------------------------------------
  // capture — Technician confirms payment receipt / capture
  // -----------------------------------------------------------------------
  capture: technicianProcedure
    .input(bookingIdSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // 1. Find booking and verify technician owns it
        const booking = await prisma.booking.findUnique({
          where: { id: input.bookingId },
          include: { payment: true },
        });

        if (!booking) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Booking not found',
          });
        }

        if (booking.technicianId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You are not the technician for this booking',
          });
        }

        if (!booking.payment) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'No payment record found for this booking',
          });
        }

        if (booking.payment.status !== 'AUTHORIZED') {
          throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message: `Payment must be AUTHORIZED to capture, current status: ${booking.payment.status}`,
          });
        }

        // 2-3. Update payment to CAPTURED
        const payment = await prisma.payment.update({
          where: { id: booking.payment.id },
          data: { status: 'CAPTURED' },
        });

        // 4. Update booking to PAID
        await prisma.booking.update({
          where: { id: booking.id },
          data: { status: 'PAID' },
        });

        // 5. Cashback — credit 5% to customer's wallet
        const cashbackAmount = Number(booking.totalAmount) * 0.05;

        // Ensure wallet exists for the customer
        let wallet = await prisma.wallet.findUnique({
          where: { userId: booking.customerId },
        });

        if (!wallet) {
          wallet = await prisma.wallet.create({
            data: { userId: booking.customerId },
          });
        }

        await prisma.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: 'CREDIT',
            source: 'CASHBACK',
            amount: cashbackAmount,
            description: `Cashback on booking #${booking.id}`,
            referenceId: String(booking.id),
          },
        });

        await prisma.wallet.update({
          where: { id: wallet.id },
          data: { bonusBalance: { increment: cashbackAmount } },
        });

        // Emit real-time events
        emitToUser(booking.customerId, 'payment_success', {
          bookingId: booking.id,
          amount: booking.totalAmount,
          cashback: cashbackAmount,
        });
        emitToUser(booking.customerId, 'wallet_updated', {
          bookingId: booking.id,
        });
        emitToAdmin('admin_update', {
          type: 'payment_captured',
          bookingId: booking.id,
          amount: booking.totalAmount,
        });

        return payment;
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to capture payment',
          cause: err,
        });
      }
    }),

  // -----------------------------------------------------------------------
  // refund — Admin refunds a captured payment
  // -----------------------------------------------------------------------
  refund: adminProcedure
    .input(bookingIdSchema)
    .mutation(async ({ input }) => {
      try {
        // 1. Find payment with booking
        const payment = await prisma.payment.findUnique({
          where: { bookingId: input.bookingId },
          include: { booking: true },
        });

        if (!payment) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Payment not found for this booking',
          });
        }

        if (payment.status !== 'CAPTURED') {
          throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message: `Payment must be CAPTURED to refund, current status: ${payment.status}`,
          });
        }

        // 2. Update payment to REFUNDED
        const updated = await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'REFUNDED' },
        });

        // 3. Reverse wallet transactions associated with this booking
        const walletTransactions = await prisma.walletTransaction.findMany({
          where: { referenceId: String(input.bookingId) },
        });

        for (const txn of walletTransactions) {
          if (txn.source === 'CASHBACK') {
            // Reverse cashback credit by debiting the wallet
            await prisma.wallet.update({
              where: { id: txn.walletId },
              data: { bonusBalance: { decrement: txn.amount } },
            });

            await prisma.walletTransaction.create({
              data: {
                walletId: txn.walletId,
                type: 'DEBIT',
                source: 'REFUND',
                amount: txn.amount,
                description: `Reversal of cashback for booking #${input.bookingId}`,
                referenceId: String(input.bookingId),
              },
            });
          }
        }

        return updated;
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to refund payment',
          cause: err,
        });
      }
    }),

  // -----------------------------------------------------------------------
  // getByBooking — Fetch payment details for a booking (owner or tech)
  // -----------------------------------------------------------------------
  getByBooking: protectedProcedure
    .input(bookingIdSchema)
    .query(async ({ ctx, input }) => {
      try {
        const payment = await prisma.payment.findUnique({
          where: { bookingId: input.bookingId },
          include: { booking: { select: { customerId: true, technicianId: true } } },
        });

        if (!payment) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'No payment found for this booking',
          });
        }

        // Only the booking owner or assigned technician can view
        if (
          payment.booking.customerId !== ctx.user.id &&
          payment.booking.technicianId !== ctx.user.id
        ) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You are not authorized to view this payment',
          });
        }

        return payment;
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve payment',
          cause: err,
        });
      }
    }),

  // -----------------------------------------------------------------------
  // webhook — PayFort / APS webhook handler
  // Handles post-payment callbacks: capture, decline, refund notifications
  // -----------------------------------------------------------------------
  webhook: publicProcedure
    .input(webhookSchema)
    .mutation(async ({ input }) => {
      try {
        // Verify webhook signature if provided
        if (input.signature) {
          const paramsToVerify: Record<string, string> = {
            gatewayRef: input.gatewayRef,
            status: input.status,
          };
          if (!verifyWebhookSignature(paramsToVerify, input.signature)) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'Invalid webhook signature',
            });
          }
        }

        // Find payment by gateway reference
        const payment = await prisma.payment.findFirst({
          where: { gatewayRef: input.gatewayRef },
        });

        if (!payment) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'No payment found for the given gateway reference',
          });
        }

        // Map common PayFort status codes to internal status
        // 14 = success (captured), 2 = declined, 5 = reversed, 8 = refunded
        let newStatus: 'CAPTURED' | 'FAILED' | 'REFUNDED' | null = null;

        if (input.status === '14') {
          newStatus = 'CAPTURED';
        } else if (['2', '5'].includes(input.status)) {
          newStatus = 'FAILED';
        } else if (input.status === '8') {
          newStatus = 'REFUNDED';
        }

        if (!newStatus) {
          return {
            received: true,
            processed: false,
            reason: `Unhandled gateway status: ${input.status}`,
          };
        }

        // Update payment status
        const updated = await prisma.payment.update({
          where: { id: payment.id },
          data: { status: newStatus },
        });

        // On successful capture, update booking to PAID + emit events
        if (newStatus === 'CAPTURED') {
          await prisma.booking.update({
            where: { id: payment.bookingId },
            data: { status: 'PAID' },
          });

          // Emit real-time payment success to the customer (we need the booking to get customerId)
          const booking = await prisma.booking.findUnique({
            where: { id: payment.bookingId },
            select: { customerId: true, totalAmount: true },
          });
          if (booking) {
            emitToUser(booking.customerId, 'payment_success', {
              bookingId: payment.bookingId,
              amount: booking.totalAmount,
            });
            emitToUser(booking.customerId, 'wallet_updated', {
              bookingId: payment.bookingId,
            });
          }
          emitToAdmin('admin_update', {
            type: 'payment_webhook_captured',
            bookingId: payment.bookingId,
          });
        }

        return {
          received: true,
          processed: true,
          paymentId: updated.id,
          status: updated.status,
        };
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to process webhook',
          cause: err,
        });
      }
    }),
});
