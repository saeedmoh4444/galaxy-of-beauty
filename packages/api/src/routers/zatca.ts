import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { adminProcedure, protectedProcedure, router } from '../trpc';
import { prisma } from '@galaxy/db';

export const zatcaRouter = router({
  generateInvoice: adminProcedure
    .input(z.object({ bookingId: z.number() }))
    .mutation(async ({ input }) => {
      const booking = await prisma.booking.findUnique({
        where: { id: input.bookingId },
        include: {
          customer: { select: { name: true, phone: true } },
          payment: true,
        },
      });

      if (!booking) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Booking not found',
        });
      }

      // Check if invoice already exists
      const existing = await prisma.zatcaInvoice.findUnique({
        where: { bookingId: input.bookingId },
      });
      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Invoice already exists for this booking',
        });
      }

      // TODO: Implement actual ZATCA hashing and QR generation
      const invoiceNumber = `GOB-${booking.bookingCode}-${Date.now()}`;
      const stubHash = `stub-hash-${crypto.randomUUID()}`;
      const stubQr = `stub-qr-${crypto.randomUUID()}`;

      const invoice = await prisma.zatcaInvoice.create({
        data: {
          bookingId: input.bookingId,
          invoiceNumber,
          invoiceHash: stubHash,
          qrCode: stubQr,
          status: 'PENDING',
        },
      });

      return {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        status: invoice.status,
        invoiceHash: invoice.invoiceHash,
        qrCode: invoice.qrCode,
        booking: {
          id: booking.id,
          bookingCode: booking.bookingCode,
          totalAmount: booking.totalAmount.toNumber(),
          customerName: booking.customer.name,
        },
      };
    }),

  reportInvoice: adminProcedure
    .input(z.object({ invoiceId: z.number() }))
    .mutation(async ({ input }) => {
      const invoice = await prisma.zatcaInvoice.findUnique({
        where: { id: input.invoiceId },
      });
      if (!invoice) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invoice not found',
        });
      }

      if (invoice.status !== 'PENDING') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Cannot report invoice with status ${invoice.status}. Only PENDING invoices can be reported.`,
        });
      }

      // TODO: Implement actual ZATCA reporting API call
      const updated = await prisma.zatcaInvoice.update({
        where: { id: input.invoiceId },
        data: {
          status: 'REPORTED',
          reportedAt: new Date(),
        },
      });

      return {
        id: updated.id,
        invoiceNumber: updated.invoiceNumber,
        status: updated.status,
        reportedAt: updated.reportedAt,
      };
    }),

  getInvoice: protectedProcedure
    .input(z.object({ bookingId: z.number() }))
    .query(async ({ input, ctx }) => {
      const booking = await prisma.booking.findUnique({
        where: { id: input.bookingId },
        select: { customerId: true, technicianId: true },
      });

      if (!booking) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Booking not found',
        });
      }

      // Only participants can view the invoice
      if (
        ctx.user.role !== 'ADMIN' &&
        booking.customerId !== ctx.user.id &&
        booking.technicianId !== ctx.user.id
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this invoice',
        });
      }

      const invoice = await prisma.zatcaInvoice.findUnique({
        where: { bookingId: input.bookingId },
        include: {
          booking: {
            select: {
              bookingCode: true,
              totalAmount: true,
              createdAt: true,
              customer: { select: { name: true } },
              technician: { select: { name: true } },
            },
          },
        },
      });

      if (!invoice) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No invoice found for this booking',
        });
      }

      return {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        invoiceHash: invoice.invoiceHash,
        cryptographicStamp: invoice.cryptographicStamp,
        qrCode: invoice.qrCode,
        status: invoice.status,
        reportedAt: invoice.reportedAt,
        clearedAt: invoice.clearedAt,
        errorMessage: invoice.errorMessage,
        createdAt: invoice.createdAt,
        booking: invoice.booking,
      };
    }),

  listInvoices: adminProcedure
    .input(
      z
        .object({
          status: z
            .enum(['PENDING', 'REPORTED', 'CLEARED', 'REJECTED'])
            .optional(),
          page: z.number().optional().default(1),
          limit: z.number().optional().default(20),
        })
        .optional()
        .default({}),
    )
    .query(async ({ input }) => {
      const where: any = {};
      if (input.status) where.status = input.status;
      const skip = (input.page - 1) * input.limit;

      const [items, total] = await Promise.all([
        prisma.zatcaInvoice.findMany({
          where,
          skip,
          take: input.limit,
          orderBy: { createdAt: 'desc' },
          include: {
            booking: {
              select: {
                bookingCode: true,
                totalAmount: true,
                customer: { select: { name: true } },
              },
            },
          },
        }),
        prisma.zatcaInvoice.count({ where }),
      ]);

      return {
        items: items.map((inv) => ({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          status: inv.status,
          reportedAt: inv.reportedAt,
          clearedAt: inv.clearedAt,
          errorMessage: inv.errorMessage,
          createdAt: inv.createdAt,
          booking: inv.booking,
        })),
        total,
        page: input.page,
        limit: input.limit,
        totalPages: Math.ceil(total / input.limit),
      };
    }),
});
