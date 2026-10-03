import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma, Prisma } from '@galaxy/db';
import { notFound, forbidden } from '../lib/errors';
import {
  router,
  publicProcedure,
  protectedProcedure,
  customerProcedure,
  technicianProcedure,
  adminProcedure,
} from '../trpc';
import { emitToUser, emitToAdmin } from '../socket/index';
import {
  getCountries,
  getCities,
  calculateShippingCharge,
  sendPayment,
  getPaymentStatus,
  resolvePaymentState,
  FatoorahApiError,
  FatoorahNotConfiguredError,
} from '../lib/fatoorah';
import { readCartForCheckout, placeStoreOrders } from '../lib/storeCheckout';
import { getCashbackRatePct } from './cashback';

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

const statusCallbackSchema = z.object({
  paymentId: z.string().min(1),
});

const shippingCitiesSchema = z.object({
  countryCode: z.string().min(1),
  searchValue: z.string().optional(),
  shippingMethod: z.union([z.literal(1), z.literal(2)]).default(1),
});

const shippingChargeSchema = z.object({
  shippingMethod: z.union([z.literal(1), z.literal(2)]),
  countryCode: z.string().min(1),
  cityName: z.string().min(1),
  postalCode: z.string().min(1),
  items: z
    .array(
      z.object({
        name: z.string().min(1),
        quantity: z.number().int().positive(),
        weight: z.number().nonnegative().default(0),
        unitPrice: z.number().nonnegative(),
      }),
    )
    .min(1),
});

const payCartSchema = z.object({
  idempotencyKey: z.string().min(8).max(128),
  method: z.enum(['wallet', 'online']),
  shipping: z.object({
    personName: z.string().min(1),
    mobile: z.string().min(1),
    lineAddress: z.string().min(1),
    cityName: z.string().min(1),
    postalCode: z.string().min(1),
    countryCode: z.string().min(1),
    shippingMethod: z.union([z.literal(1), z.literal(2)]),
  }),
});

const verifyCartPaymentSchema = z.object({
  invoiceId: z.string().min(1).optional(),
  paymentId: z.string().min(1).optional(),
});

// Map gateway errors onto tRPC: unconfigured → 503, gateway validation
// errors → 400, anything else → 500 with cause.
function gatewayError(err: unknown, context: string): TRPCError {
  if (err instanceof FatoorahNotConfiguredError) {
    return new TRPCError({
      code: 'SERVICE_UNAVAILABLE',
      message: `MyFatoorah not configured (${context})`,
    });
  }
  if (err instanceof FatoorahApiError) {
    return new TRPCError({ code: 'BAD_REQUEST', message: err.message });
  }
  return new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: context, cause: err });
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export const paymentRouter = router({
  // -----------------------------------------------------------------------
  // authorize — Customer initiates payment for an accepted booking
  // -----------------------------------------------------------------------
  authorize: customerProcedure.input(authorizeSchema).mutation(async ({ ctx, input }) => {
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
        throw notFound('Booking');
      }

      if (booking.customerId !== ctx.user.id) {
        throw forbidden('You do not own this booking');
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
        // Online — MyFatoorah hosted invoice link (NotificationOption LNK).
        const user = await prisma.user.findUnique({
          where: { id: ctx.user.id },
          select: { email: true, name: true, phone: true },
        });

        const appUrl = process.env['NEXT_PUBLIC_APP_URL'] || 'http://localhost:3000';

        try {
          const invoice = await sendPayment({
            customerName: user?.name || 'Customer',
            customerMobile: user?.phone || '0500000000',
            customerEmail: user?.email || '',
            invoiceValue: Number(booking.totalAmount),
            invoiceItems: [
              {
                name: `Booking #${booking.id}`,
                quantity: 1,
                unitPrice: Number(booking.totalAmount),
              },
            ],
            displayCurrencyIso: 'SAR',
            customerReference: `GOB-BOOKING-${booking.id}`,
            callBackUrl: `${appUrl}/payments/status?paymentId={PaymentId}`,
            errorUrl: `${appUrl}/payments/status`,
          });

          await prisma.payment.update({
            where: { id: payment.id },
            data: { gatewayRef: invoice.invoiceId },
          });

          return {
            paymentId: payment.id,
            invoiceId: invoice.invoiceId,
            invoiceURL: invoice.invoiceURL,
            gatewayRef: invoice.invoiceId,
          };
        } catch (err) {
          // Gateway rejected the invoice — fail the payment record.
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'FAILED' },
          });
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Payment failed: ${(err as Error).message}`,
          });
        }
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
  capture: technicianProcedure.input(bookingIdSchema).mutation(async ({ ctx, input }) => {
    try {
      // 1. Find booking and verify technician owns it
      const booking = await prisma.booking.findUnique({
        where: { id: input.bookingId },
        include: { payment: true },
      });

      if (!booking) {
        throw notFound('Booking');
      }

      if (booking.technicianId !== ctx.user.id) {
        throw forbidden('You are not the technician for this booking');
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

      // 5. Cashback — credit the configured rate to the customer's wallet
      // (idempotent via referenceId). Rate comes from PlatformConfig with
      // the shared 5% default.
      const cashbackAmount = Number(booking.totalAmount) * ((await getCashbackRatePct()) / 100);
      const cashbackRefId = `capture_${booking.id}`;

      // Check for existing cashback to avoid double-accrual
      const existingCashback = await prisma.walletTransaction.findFirst({
        where: { referenceId: cashbackRefId, source: 'CASHBACK' },
      });

      if (!existingCashback) {
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
            referenceId: cashbackRefId,
          },
        });

        await prisma.wallet.update({
          where: { id: wallet.id },
          data: { bonusBalance: { increment: cashbackAmount } },
        });
      }

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
  refund: adminProcedure.input(bookingIdSchema).mutation(async ({ input }) => {
    try {
      // 1. Find payment with booking
      const payment = await prisma.payment.findUnique({
        where: { bookingId: input.bookingId },
        include: { booking: true },
      });

      if (!payment) {
        throw notFound('Payment for this booking');
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

      // 3. Reverse wallet transactions associated with this booking.
      // The cashback writer stores `capture_<booking.id>` as its referenceId —
      // look it up the same way or the reversal never matches any row.
      const walletTransactions = await prisma.walletTransaction.findMany({
        where: { referenceId: `capture_${input.bookingId}` },
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
  getByBooking: protectedProcedure.input(bookingIdSchema).query(async ({ ctx, input }) => {
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
  // statusCallback — MyFatoorah redirect callback verification.
  // Money-integrity: state changes ONLY after GetPaymentStatus confirms
  // the gateway result — the redirect alone proves nothing.
  // -----------------------------------------------------------------------
  statusCallback: publicProcedure.input(statusCallbackSchema).mutation(async ({ input }) => {
    try {
      const status = await getPaymentStatus({ paymentId: input.paymentId });

      const payment = await prisma.payment.findFirst({
        where: { gatewayRef: status.invoiceId },
      });

      if (!payment) {
        // Unknown invoice — tolerate (return, don't 500) but never
        // change any state.
        return {
          received: true,
          processed: false,
          reason: 'Unknown invoice',
        };
      }

      const state = resolvePaymentState(status);

      if (state === 'PENDING') {
        return {
          received: true,
          processed: false,
          reason: 'Gateway status pending',
        };
      }

      if (state === 'FAILED') {
        const failed = await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'FAILED' },
        });
        return {
          received: true,
          processed: true,
          paymentId: failed.id,
          status: failed.status,
        };
      }

      // PAID — verified capture: payment CAPTURED + booking PAID.
      const updated = await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'CAPTURED' },
      });

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
        message: 'Failed to verify payment status',
        cause: err,
      });
    }
  }),

  // -----------------------------------------------------------------------
  // Shipping lookups — MyFatoorah GetCountries / Getcities /
  // CalculateShippingCharge (public: needed to render checkout forms).
  // -----------------------------------------------------------------------
  shippingCountries: publicProcedure.query(async () => {
    try {
      return await getCountries();
    } catch (err) {
      throw gatewayError(err, 'Failed to fetch shipping countries');
    }
  }),

  shippingCities: publicProcedure.input(shippingCitiesSchema).query(async ({ input }) => {
    try {
      return await getCities({
        shippingMethod: input.shippingMethod,
        countryCode: input.countryCode,
        searchValue: input.searchValue,
      });
    } catch (err) {
      throw gatewayError(err, 'Failed to fetch shipping cities');
    }
  }),

  shippingCharge: publicProcedure.input(shippingChargeSchema).query(async ({ input }) => {
    try {
      return await calculateShippingCharge({
        shippingMethod: input.shippingMethod,
        countryCode: input.countryCode,
        cityName: input.cityName,
        postalCode: input.postalCode,
        items: input.items,
      });
    } catch (err) {
      throw gatewayError(err, 'Failed to calculate shipping charge');
    }
  }),

  // -----------------------------------------------------------------------
  // payCart — marketplace checkout: shipping + payment in one step.
  // wallet → atomic debit (checkout PAID); online → MyFatoorah invoice
  // link (checkout PENDING until verifyCartPayment confirms the gateway).
  // -----------------------------------------------------------------------
  payCart: customerProcedure.input(payCartSchema).mutation(async ({ ctx, input }) => {
    try {
      const existing = await prisma.storeCheckout.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
      });
      if (existing) {
        return {
          checkoutId: existing.id,
          method: existing.method,
          status: existing.status,
          invoiceId: existing.invoiceId,
          invoiceURL: null,
          total: Number(existing.total),
        };
      }

      const lines = await readCartForCheckout(ctx.user.id);
      const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);

      let shippingCharge = 0;
      try {
        const charge = await calculateShippingCharge({
          shippingMethod: input.shipping.shippingMethod,
          countryCode: input.shipping.countryCode,
          cityName: input.shipping.cityName,
          postalCode: input.shipping.postalCode,
          items: lines.map((l) => ({
            name: l.name,
            quantity: l.quantity,
            weight: 0.5,
            unitPrice: l.unitPrice,
          })),
        });
        shippingCharge = charge.shippingCharge;
      } catch (err) {
        throw gatewayError(err, 'Failed to calculate shipping charge');
      }
      const total = subtotal + shippingCharge;

      const shipData = {
        shipPersonName: input.shipping.personName,
        shipMobile: input.shipping.mobile,
        shipLineAddress: input.shipping.lineAddress,
        shipCityName: input.shipping.cityName,
        shipPostalCode: input.shipping.postalCode,
        shipCountryCode: input.shipping.countryCode,
        shippingMethod: input.shipping.shippingMethod,
      };

      if (input.method === 'wallet') {
        try {
          const checkout = await prisma.$transaction(async (tx) => {
            const created = await tx.storeCheckout.create({
              data: {
                customerId: ctx.user.id,
                idempotencyKey: input.idempotencyKey,
                method: 'wallet',
                subtotal,
                shippingCharge,
                total,
                status: 'PAID',
                ...shipData,
              },
            });
            await placeStoreOrders(tx, ctx.user.id, lines, created.id);

            const wallet = await tx.wallet.findUnique({ where: { userId: ctx.user.id } });
            if (!wallet || Number(wallet.balance) < total) {
              throw new TRPCError({
                code: 'PRECONDITION_FAILED',
                message: 'Insufficient wallet balance',
              });
            }
            await tx.wallet.update({
              where: { id: wallet.id },
              data: { balance: { decrement: total } },
            });
            await tx.walletTransaction.create({
              data: {
                walletId: wallet.id,
                type: 'DEBIT',
                source: 'STORE_PURCHASE',
                amount: total,
                referenceId: `store_checkout_${created.id}`,
                idempotencyKey: input.idempotencyKey,
                description: `Store checkout #${created.id}`,
                status: 'COMPLETED',
              },
            });
            return created;
          });
          return { checkoutId: checkout.id, method: 'wallet', status: 'PAID', total };
        } catch (err) {
          if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
            // Idempotency race — another call won; return its checkout.
            const raced = await prisma.storeCheckout.findUnique({
              where: { idempotencyKey: input.idempotencyKey },
            });
            if (raced) {
              return {
                checkoutId: raced.id,
                method: raced.method,
                status: raced.status,
                invoiceId: raced.invoiceId,
                invoiceURL: null,
                total: Number(raced.total),
              };
            }
          }
          if (err instanceof TRPCError) throw err;
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to process wallet payment',
            cause: err,
          });
        }
      }

      // Online — MyFatoorah hosted invoice link.
      let checkoutId: number;
      try {
        const checkout = await prisma.$transaction(async (tx) => {
          const created = await tx.storeCheckout.create({
            data: {
              customerId: ctx.user.id,
              idempotencyKey: input.idempotencyKey,
              method: 'online',
              subtotal,
              shippingCharge,
              total,
              status: 'PENDING',
              ...shipData,
            },
          });
          await placeStoreOrders(tx, ctx.user.id, lines, created.id);
          return created;
        });
        checkoutId = checkout.id;
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
          const raced = await prisma.storeCheckout.findUnique({
            where: { idempotencyKey: input.idempotencyKey },
          });
          if (raced) {
            return {
              checkoutId: raced.id,
              method: raced.method,
              status: raced.status,
              invoiceId: raced.invoiceId,
              invoiceURL: null,
              total: Number(raced.total),
            };
          }
        }
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create checkout',
          cause: err,
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: ctx.user.id },
        select: { email: true },
      });
      const appUrl = process.env['NEXT_PUBLIC_APP_URL'] || 'http://localhost:3000';

      let invoice: { invoiceId: string; invoiceURL: string };
      try {
        invoice = await sendPayment({
          customerName: input.shipping.personName,
          customerMobile: input.shipping.mobile,
          customerEmail: user?.email || '',
          invoiceValue: total,
          invoiceItems: lines.map((l) => ({
            name: l.name,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
          })),
          displayCurrencyIso: 'SAR',
          customerReference: `GOB-CHECKOUT-${checkoutId}`,
          callBackUrl: `${appUrl}/checkout/status?paymentId={PaymentId}`,
          errorUrl: `${appUrl}/checkout/status`,
          shippingMethod: input.shipping.shippingMethod,
          shippingConsignee: {
            personName: input.shipping.personName,
            mobile: input.shipping.mobile,
            lineAddress: input.shipping.lineAddress,
            cityName: input.shipping.cityName,
            postalCode: input.shipping.postalCode,
            countryCode: input.shipping.countryCode,
          },
        });
      } catch (err) {
        // Invoice rejected — fail the checkout so vendors never fulfill it.
        await prisma.storeCheckout
          .update({ where: { id: checkoutId }, data: { status: 'FAILED' } })
          .catch(() => {});
        throw gatewayError(err, 'Payment invoice failed');
      }

      await prisma.storeCheckout.update({
        where: { id: checkoutId },
        data: { invoiceId: invoice.invoiceId, gatewayRef: invoice.invoiceId },
      });

      return {
        checkoutId,
        method: 'online',
        status: 'PENDING',
        invoiceId: invoice.invoiceId,
        invoiceURL: invoice.invoiceURL,
        total,
      };
    } catch (err) {
      if (err instanceof TRPCError) throw err;
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to process cart payment',
        cause: err,
      });
    }
  }),

  // -----------------------------------------------------------------------
  // verifyCartPayment — post-redirect status check for store checkouts.
  // State changes ONLY after GetPaymentStatus confirms the gateway result.
  // -----------------------------------------------------------------------
  verifyCartPayment: publicProcedure.input(verifyCartPaymentSchema).mutation(async ({ input }) => {
    try {
      if (!input.invoiceId && !input.paymentId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'invoiceId or paymentId required',
        });
      }
      const status = await getPaymentStatus({
        invoiceId: input.invoiceId,
        paymentId: input.paymentId,
      });

      const checkout = await prisma.storeCheckout.findFirst({
        where: { OR: [{ invoiceId: status.invoiceId }, { gatewayRef: status.invoiceId }] },
      });

      if (!checkout) {
        return { status: 'PENDING' as const, processed: false, reason: 'Unknown invoice' };
      }

      const state = resolvePaymentState(status);
      if (state !== 'PENDING' && checkout.status !== state) {
        await prisma.storeCheckout.update({
          where: { id: checkout.id },
          data: { status: state },
        });
      }
      return { status: state, checkoutId: checkout.id, processed: state !== 'PENDING' };
    } catch (err) {
      if (err instanceof TRPCError) throw err;
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to verify cart payment',
        cause: err,
      });
    }
  }),
});
