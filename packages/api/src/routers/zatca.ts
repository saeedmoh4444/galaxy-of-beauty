import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createHash } from 'crypto';
import { adminProcedure, protectedProcedure, router } from '../trpc';
import { prisma } from '@galaxy/db';
import { ZATCA_TEST_VAT, ZATCA_API_URL as SHARED_ZATCA_URL } from '@galaxy/shared';
import { appendAudit, verifyChain as verifyAuditChain } from '../lib/zatcaAudit';

// ── ZATCA Configuration ───────────────────────────────────
const VAT_RATE = 0.15; // 15% VAT in Saudi Arabia
const VAT_NUMBER =
  process.env['ZATCA_VAT_NUMBER'] ||
  (process.env['NODE_ENV'] === 'production' ? '' : ZATCA_TEST_VAT);
const ZATCA_API_BASE = process.env['ZATCA_API_URL'] || SHARED_ZATCA_URL;
const SELLER_NAME_AR = process.env['BUSINESS_NAME_AR'] || 'جالكسي بيوتي';

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
    // Simulate in dev/test only when explicitly opted in
    if (process.env['ZATCA_SIMULATE'] === 'true') {
      return { success: true, clearanceId: `sim_${invoice.invoiceHash.slice(0, 16)}` };
    }
    return { success: false, error: 'ZATCA API credentials not configured' };
  }

  try {
    const response = await fetch(`${ZATCA_API_BASE}/invoices/report`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}`,
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
        vatAmount: ((invoice.totalAmount * VAT_RATE) / (1 + VAT_RATE)).toFixed(2),
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
    return {
      success: true,
      clearanceId: (data['clearanceId'] as string) || (data['uuid'] as string),
    };
  } catch (err) {
    return { success: false, error: `ZATCA API unreachable: ${(err as Error).message}` };
  }
}

type ReportableInvoice = {
  id: number;
  invoiceNumber: string;
  invoiceHash: string | null;
  cryptographicStamp: string | null;
  qrCode: string | null;
  status: string;
  createdAt: Date;
  booking: {
    bookingCode: string;
    totalAmount: { toNumber(): number };
    customer: { name: string };
  };
};

/**
 * 6.1c — shared report flow: call the API, update the invoice and audit
 * the outcome atomically. A failed retry on a REJECTED invoice keeps it
 * REJECTED (validation failures persist until the data is fixed).
 */
async function performReport(
  invoice: ReportableInvoice,
  actorId: number,
): Promise<{
  updated: Awaited<ReturnType<typeof prisma.zatcaInvoice.update>>;
  result: { success: boolean; clearanceId?: string; error?: string };
}> {
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

  const failedStatus = invoice.status === 'REJECTED' ? 'REJECTED' : 'PENDING';
  const updated = await prisma.$transaction(async (tx) => {
    await appendAudit(tx, {
      invoiceId: invoice.id,
      event: 'REPORT_REQUESTED',
      actorId,
    });
    const upd = await tx.zatcaInvoice.update({
      where: { id: invoice.id },
      data: {
        status: result.success ? 'REPORTED' : failedStatus,
        reportedAt: result.success ? new Date() : undefined,
        errorMessage: result.error || undefined,
        ...(result.clearanceId ? { clearanceId: result.clearanceId } : {}),
      },
    });
    await appendAudit(tx, {
      invoiceId: invoice.id,
      event: result.success ? 'REPORTED' : 'REPORT_FAILED',
      actorId,
      detail: result.success
        ? { clearanceId: result.clearanceId ?? null }
        : { error: result.error ?? null },
    });
    return upd;
  });

  return { updated, result };
}

export const zatcaRouter = router({
  generateInvoice: adminProcedure
    .input(z.object({ bookingId: z.number() }))
    .mutation(async ({ input, ctx }) => {
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
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Invoice already exists for this booking',
        });
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
      const vatAmount = (totalAmount * VAT_RATE) / (1 + VAT_RATE);
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

      const invoice = await prisma.$transaction(async (tx) => {
        const created = await tx.zatcaInvoice.create({
          data: {
            bookingId: input.bookingId,
            invoiceNumber,
            invoiceHash,
            cryptographicStamp,
            qrCode,
            status: 'PENDING',
          },
        });
        // 6.1a — audit the generation event (genesis link).
        await appendAudit(tx, {
          invoiceId: created.id,
          event: 'GENERATED',
          actorId: ctx.user.id,
          detail: { invoiceNumber: created.invoiceNumber, bookingId: input.bookingId },
        });
        return created;
      });

      // 6.1c — real-time reporting when explicitly enabled.
      let finalStatus: string = invoice.status;
      let finalClearanceId: string | null = null;
      if (process.env['ZATCA_AUTO_REPORT'] === 'true') {
        const { updated } = await performReport(
          {
            ...invoice,
            status: 'PENDING',
            booking: {
              bookingCode: booking.bookingCode,
              totalAmount: booking.totalAmount,
              customer: { name: booking.customer.name },
            },
          },
          ctx.user.id,
        );
        finalStatus = updated.status;
        finalClearanceId = updated.clearanceId;
      }

      return {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        status: finalStatus,
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
        clearanceId: finalClearanceId,
      };
    }),

  reportInvoice: adminProcedure
    .input(z.object({ invoiceId: z.number() }))
    .mutation(async ({ input, ctx }) => {
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

      // 6.1c — REJECTED invoices can be re-reported after data fixes.
      if (invoice.status !== 'PENDING' && invoice.status !== 'REJECTED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Cannot report invoice with status ${invoice.status}. Only PENDING or REJECTED invoices can be reported.`,
        });
      }

      const { updated, result } = await performReport(invoice, ctx.user.id);

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

  // 6.1c — clearance: REPORTED or (simplified-flow) PENDING -> CLEARED.
  clearInvoice: adminProcedure
    .input(z.object({ invoiceId: z.number(), clearanceId: z.string().max(100).optional() }))
    .mutation(async ({ input, ctx }) => {
      const invoice = await prisma.zatcaInvoice.findUnique({
        where: { id: input.invoiceId },
      });

      if (!invoice) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Invoice not found' });
      }

      if (invoice.status === 'CLEARED' || invoice.status === 'REJECTED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Cannot clear invoice with status ${invoice.status}.`,
        });
      }

      const updated = await prisma.$transaction(async (tx) => {
        const upd = await tx.zatcaInvoice.update({
          where: { id: input.invoiceId },
          data: {
            status: 'CLEARED',
            clearedAt: new Date(),
            ...(input.clearanceId ? { clearanceId: input.clearanceId } : {}),
          },
        });
        await appendAudit(tx, {
          invoiceId: invoice.id,
          event: 'CLEARED',
          actorId: ctx.user.id,
          detail: { clearanceId: input.clearanceId ?? null },
        });
        return upd;
      });

      return {
        id: updated.id,
        invoiceNumber: updated.invoiceNumber,
        status: updated.status,
        clearedAt: updated.clearedAt,
        clearanceId: updated.clearanceId,
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
          status: z.enum(['PENDING', 'REPORTED', 'CLEARED', 'REJECTED']).optional(),
          page: z.number().optional().default(1),
          limit: z.number().optional().default(20),
        })
        .optional()
        .default({} as never),
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

  // ── 6.1b — VAT reports (monthly / quarterly) ────────────────────────
  vatReport: adminProcedure
    .input(
      z
        .object({
          year: z.number().int().min(2020).max(2100),
          period: z.enum(['monthly', 'quarterly']),
          index: z.number().int().min(1).max(12),
        })
        .refine((i) => (i.period === 'quarterly' ? i.index <= 4 : true), {
          message: 'Quarterly index must be 1..4',
        }),
    )
    .query(async ({ input }) => {
      const rows = await collectVatRows(input.year, input.period, input.index);
      return {
        window: vatWindow(input.year, input.period, input.index),
        rows,
        totals: vatTotals(rows),
      };
    }),

  vatReportCsv: adminProcedure
    .input(
      z
        .object({
          year: z.number().int().min(2020).max(2100),
          period: z.enum(['monthly', 'quarterly']),
          index: z.number().int().min(1).max(12),
        })
        .refine((i) => (i.period === 'quarterly' ? i.index <= 4 : true), {
          message: 'Quarterly index must be 1..4',
        }),
    )
    .mutation(async ({ input }) => {
      const rows = await collectVatRows(input.year, input.period, input.index);
      const lines = [
        'InvoiceNumber,Date,Status,Subtotal,VAT,Total',
        ...rows.map((r) =>
          [
            r.invoiceNumber,
            r.createdAt.toISOString(),
            r.status,
            r.subtotal.toFixed(2),
            r.vat.toFixed(2),
            r.total.toFixed(2),
          ].join(','),
        ),
      ];
      return {
        csv: String.fromCharCode(0xfeff) + lines.join('\n'),
        window: vatWindow(input.year, input.period, input.index),
        totals: vatTotals(rows),
      };
    }),
  // ── 6.1a — compliance dashboard ─────────────────────────────────────
  dashboard: adminProcedure.query(async () => {
    const invoices = await prisma.zatcaInvoice.findMany({
      include: { booking: { select: { totalAmount: true } } },
    });

    const statusCounts: Record<'PENDING' | 'REPORTED' | 'CLEARED' | 'REJECTED', number> = {
      PENDING: 0,
      REPORTED: 0,
      CLEARED: 0,
      REJECTED: 0,
    };
    let totalVatCollected = 0;
    for (const inv of invoices) {
      statusCounts[inv.status] += 1;
      if (inv.status === 'REPORTED' || inv.status === 'CLEARED') {
        totalVatCollected += (inv.booking.totalAmount.toNumber() * VAT_RATE) / (1 + VAT_RATE);
      }
    }
    const settled = statusCounts.REPORTED + statusCounts.CLEARED + statusCounts.REJECTED;

    const recent = await prisma.zatcaAuditLog.findMany({
      take: 10,
      orderBy: { id: 'desc' },
      include: { invoice: { select: { invoiceNumber: true } } },
    });

    return {
      totalInvoices: invoices.length,
      statusCounts,
      totalVatCollected: Math.round(totalVatCollected * 100) / 100,
      pendingReportCount: statusCounts.PENDING,
      rejectedCount: statusCounts.REJECTED,
      clearanceRate: settled === 0 ? 0 : Math.round((statusCounts.CLEARED / settled) * 10000) / 100,
      recentActivity: recent.map((a) => ({
        id: a.id,
        invoiceId: a.invoiceId,
        invoiceNumber: a.invoice.invoiceNumber,
        event: a.event,
        actorId: a.actorId,
        createdAt: a.createdAt,
      })),
    };
  }),

  // ── 6.1a — audit trail ──────────────────────────────────────────────
  auditTrail: adminProcedure
    .input(
      z.object({
        invoiceId: z.number().int().positive(),
        page: z.number().optional().default(1),
        limit: z.number().optional().default(50),
      }),
    )
    .query(async ({ input }) => {
      const where = { invoiceId: input.invoiceId };
      const [items, total] = await Promise.all([
        prisma.zatcaAuditLog.findMany({
          where,
          skip: (input.page - 1) * input.limit,
          take: input.limit,
          orderBy: { id: 'asc' },
        }),
        prisma.zatcaAuditLog.count({ where }),
      ]);
      return {
        items,
        total,
        page: input.page,
        limit: input.limit,
        totalPages: Math.ceil(total / input.limit),
      };
    }),

  verifyChain: adminProcedure
    .input(z.object({ invoiceId: z.number().int().positive() }))
    .query(async ({ input }) => {
      const entries = await prisma.zatcaAuditLog.findMany({
        where: { invoiceId: input.invoiceId },
        orderBy: { id: 'asc' },
      });
      return {
        valid: verifyAuditChain(
          entries.map((e) => ({
            previousHash: e.previousHash,
            entryHash: e.entryHash,
            invoiceId: e.invoiceId,
            event: e.event,
            actorId: e.actorId,
            createdAt: e.createdAt,
            detail: e.detail,
          })),
        ),
        entries: entries.length,
      };
    }),
});

/** Inclusive [start, end) UTC window for a report period. */
function vatWindow(
  year: number,
  period: 'monthly' | 'quarterly',
  index: number,
): { start: string; end: string } {
  const startMonth = period === 'monthly' ? index - 1 : (index - 1) * 3;
  const endMonth = period === 'monthly' ? index : index * 3;
  return {
    start: new Date(Date.UTC(year, startMonth, 1)).toISOString(),
    end: new Date(Date.UTC(year, endMonth, 1)).toISOString(),
  };
}

type VatRow = {
  invoiceId: number;
  invoiceNumber: string;
  bookingCode: string;
  customerName: string;
  createdAt: Date;
  status: string;
  subtotal: number;
  vat: number;
  total: number;
};

async function collectVatRows(
  year: number,
  period: 'monthly' | 'quarterly',
  index: number,
): Promise<VatRow[]> {
  const { start, end } = vatWindow(year, period, index);
  const invoices = await prisma.zatcaInvoice.findMany({
    where: { createdAt: { gte: new Date(start), lt: new Date(end) } },
    orderBy: { createdAt: 'asc' },
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
  return invoices.map((inv) => {
    const total = inv.booking.totalAmount.toNumber();
    const vat = (total * VAT_RATE) / (1 + VAT_RATE);
    const subtotal = total - vat;
    const r2 = (n: number) => Math.round(n * 100) / 100;
    return {
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      bookingCode: inv.booking.bookingCode,
      customerName: inv.booking.customer.name,
      createdAt: inv.createdAt,
      status: inv.status,
      subtotal: r2(subtotal),
      vat: r2(vat),
      total: r2(total),
    };
  });
}

function vatTotals(rows: VatRow[]): {
  count: number;
  subtotal: number;
  vat: number;
  total: number;
} {
  const r2 = (n: number) => Math.round(n * 100) / 100;
  return {
    count: rows.length,
    subtotal: r2(rows.reduce((s, r) => s + r.subtotal, 0)),
    vat: r2(rows.reduce((s, r) => s + r.vat, 0)),
    total: r2(rows.reduce((s, r) => s + r.total, 0)),
  };
}
