import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createHash } from 'crypto';
import { adminProcedure, protectedProcedure, router } from '../trpc';
import { prisma } from '@galaxy/db';

// ── ZATCA Configuration ───────────────────────────────────
const VAT_RATE = 0.15; // 15% VAT in Saudi Arabia
const VAT_NUMBER = process.env['ZATCA_VAT_NUMBER'] || '300000000000003'; // Default test VAT
const ZATCA_API_BASE = process.env['ZATCA_API_URL'] || 'https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal';
const SELLER_NAME_AR = 'جالكسي بيوتي';

// ── SHA-256 Invoice Hashing ───────────────────────────────
function computeInvoiceHash(invoiceData: {
  invoiceNumber: string;
  timestamp: string;
  totalWithVat: number;
  vatAmount: number;
  previousHash: string;
}): string {
  const payload = [
    invoiceData.invoiceNumber,
    invoiceData.timestamp,
    invoiceData.totalWithVat.toFixed(2),
    invoiceData.vatAmount.toFixed(2),
    invoiceData.previousHash,
  ].join('|');
  return createHash('sha256').update(payload, 'utf8').digest('hex');
}

// ── ZATCA QR Code (TLV-encoded Base64) ────────────────────
// Per ZATCA spec: Tag-Length-Value format
// Tag 1: Seller Name | Tag 2: VAT Number | Tag 3: Timestamp
// Tag 4: Invoice Total | Tag 5: VAT Total | Tag 6: Invoice Hash
function encodeTLV(tag: number, value: string): Buffer {
  const tagBuf = Buffer.alloc(1);
  tagBuf.writeUInt8(tag, 0);
  const valueBuf = Buffer.from(value, 'utf8');
  const lenBuf = Buffer.alloc(1);
  lenBuf.writeUInt8(valueBuf.length, 0);
  return Buffer.concat([tagBuf, lenBuf, valueBuf]);
}

function generateZatcaQR(params: {
  sellerName: string;
  vatNumber: string;
  timestamp: string;
  totalWithVat: number;
  vatAmount: number;
  invoiceHash: string;
}): string {
  const tlv = Buffer.concat([
    encodeTLV(1, params.sellerName),
    encodeTLV(2, params.vatNumber),
    encodeTLV(3, params.timestamp),
    encodeTLV(4, params.totalWithVat.toFixed(2)),
    encodeTLV(5, params.vatAmount.toFixed(2)),
    encodeTLV(6, params.invoiceHash),
  ]);
  return tlv.toString('base64');
}

// ── ZATCA Cryptographic Stamp ─────────────────────────────
function computeCryptographicStamp(invoiceHash: string, uuid: string): string {
  return createHash('sha256').update(`${invoiceHash}:${uuid}`, 'utf8').digest('hex');
}

// ── Report to ZATCA API ───────────────────────────────────
async function reportToZatcaApi(invoice: {
  invoiceNumber: string;
  invoiceHash: string;
  cryptographicStamp: string;
  qrCode: string;
  totalAmount: number;
  bookingCode: string;
  customerName: string;
  createdAt: Date;
}): Promise<{ success: boolean; clearanceId?: string; error?: string }> {
  const apiKey = process.env['ZATCA_API_KEY'];
  const apiSecret = process.env['ZATCA_API_SECRET'];

  if (!apiKey || !apiSecret) {
    // In development/testing: simulate successful reporting
    if (process.env['NODE_ENV'] === 'production') {
      return { success: false, error: 'ZATCA API credentials not configured' };
    }
    return { success: true, clearanceId: `sim_${invoice.invoiceHash.slice(0, 16)}` };
  }

  try {
    const response = await fetch(`${ZATCA_API_BASE}/invoices/report`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}`,
        'Content-Type': 'application/json',
        'Accept-Language': 'ar',
      },
      body: JSON.stringify({
        invoiceNumber: invoice.invoiceNumber,
        invoiceHash: invoice.invoiceHash,
        cryptographicStamp: invoice.cryptographicStamp,
        qrCode: invoice.qrCode,
        issueDate: invoice.createdAt.toISOString(),
        invoiceTotal: invoice.totalAmount.toFixed(2),
        vatAmount: (invoice.totalAmount * VAT_RATE / (1 + VAT_RATE)).toFixed(2),
        vatNumber: VAT_NUMBER,
        sellerName: SELLER_NAME_AR,
        bookingReference: invoice.bookingCode,
        customerName: invoice.customerName,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return { success: false, error: `ZATCA API error ${response.status}: ${err.slice(0, 200)}` };
    }

    const data = (await response.json()) as Record<string, unknown>;
    return { success: true, clearanceId: data['clearanceId'] as string || data['uuid'] as string };
  } catch (err) {
    return { success: false, error: `ZATCA API unreachable: ${(err as Error).message}` };
  }
}

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
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Booking not found' });
      }

      // Check if invoice already exists
      const existing = await prisma.zatcaInvoice.findUnique({
        where: { bookingId: input.bookingId },
      });
      if (existing) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Invoice already exists for this booking' });
      }

      // Get previous invoice hash for chain linking
      const previous = await prisma.zatcaInvoice.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { invoiceHash: true },
      });
      const previousHash = previous?.invoiceHash || '0'.repeat(64);

      // Generate invoice number: GOB-INV-<bookingCode>-<sequence>
      const todayCount = await prisma.zatcaInvoice.count({
        where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      });
      const invoiceNumber = `GOB-INV-${booking.bookingCode}-${(todayCount + 1).toString().padStart(4, '0')}`;

      // Calculate VAT
      const totalAmount = booking.totalAmount.toNumber();
      const vatAmount = totalAmount * VAT_RATE / (1 + VAT_RATE);
      const totalWithVat = totalAmount;
      const timestamp = new Date().toISOString();

      // Compute hash, stamp, and QR
      const invoiceHash = computeInvoiceHash({
        invoiceNumber,
        timestamp,
        totalWithVat,
        vatAmount,
        previousHash,
      });

      const stampUuid = crypto.randomUUID();
      const cryptographicStamp = computeCryptographicStamp(invoiceHash, stampUuid);

      const qrCode = generateZatcaQR({
        sellerName: SELLER_NAME_AR,
        vatNumber: VAT_NUMBER,
        timestamp,
        totalWithVat,
        vatAmount,
        invoiceHash,
      });

      const invoice = await prisma.zatcaInvoice.create({
        data: {
          bookingId: input.bookingId,
          invoiceNumber,
          invoiceHash,
          cryptographicStamp,
          qrCode,
          status: 'PENDING',
        },
      });

      return {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        status: invoice.status,
        invoiceHash: invoice.invoiceHash,
        cryptographicStamp: invoice.cryptographicStamp,
        qrCode: invoice.qrCode,
        previousInvoiceHash: previousHash,
        vatBreakdown: {
          subtotal: (totalWithVat - vatAmount).toFixed(2),
          vatAmount: vatAmount.toFixed(2),
          vatRate: `${(VAT_RATE * 100).toFixed(0)}%`,
          total: totalWithVat.toFixed(2),
        },
        booking: {
          id: booking.id,
          bookingCode: booking.bookingCode,
          totalAmount: totalWithVat,
          customerName: booking.customer.name,
        },
      };
    }),

  reportInvoice: adminProcedure
    .input(z.object({ invoiceId: z.number() }))
    .mutation(async ({ input }) => {
      const invoice = await prisma.zatcaInvoice.findUnique({
        where: { id: input.invoiceId },
        include: {
          booking: {
            select: {
              bookingCode: true,
              totalAmount: true,
              customer: { select: { name: true } },
            },
          },
        },
      });

      if (!invoice) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Invoice not found' });
      }

      if (invoice.status !== 'PENDING') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Cannot report invoice with status ${invoice.status}. Only PENDING invoices can be reported.`,
        });
      }

      // Call ZATCA API
      const result = await reportToZatcaApi({
        invoiceNumber: invoice.invoiceNumber,
        invoiceHash: invoice.invoiceHash || '',
        cryptographicStamp: invoice.cryptographicStamp || '',
        qrCode: invoice.qrCode || '',
        totalAmount: invoice.booking.totalAmount.toNumber(),
        bookingCode: invoice.booking.bookingCode,
        customerName: invoice.booking.customer.name,
        createdAt: invoice.createdAt,
      });

      const updated = await prisma.zatcaInvoice.update({
        where: { id: input.invoiceId },
        data: {
          status: result.success ? 'REPORTED' : 'PENDING',
          reportedAt: result.success ? new Date() : undefined,
          errorMessage: result.error || undefined,
          ...(result.clearanceId ? { clearanceId: result.clearanceId } : {}),
        },
      });

      return {
        id: updated.id,
        invoiceNumber: updated.invoiceNumber,
        status: updated.status,
        reportedAt: updated.reportedAt,
        clearanceId: result.clearanceId || null,
        error: result.error || null,
        success: result.success,
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
