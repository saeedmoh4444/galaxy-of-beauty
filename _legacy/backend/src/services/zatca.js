/**
 * ZATCA E-Invoicing Service (Phase 1 — Simplified Invoice Generation)
 *
 * Saudi Arabia's ZATCA (Zakat, Tax and Customs Authority) requires:
 *   1. A compliant invoice number format (UUID-based)
 *   2. Cryptographic hash of invoice fields
 *   3. QR code containing key invoice data (Base64)
 *   4. Cryptographic stamp (signed by ZATCA CSID in Phase 2)
 *   5. Reporting to ZATCA portal (Phase 2)
 *
 * Phase 1 implements: invoice number generation, hash, and QR code.
 * Phase 2 (future): CSID signing + clearance API integration.
 */
import crypto from 'crypto';
import prisma from '../config/database.js';
import { AppError, ErrorCodes } from '../utils/errors.js';
import logger from '../config/logger.js';

/**
 * Generate a ZATCA-compliant invoice number.
 * Format: GOB-{UUID-v4}
 */
function generateInvoiceNumber() {
  const uuid = crypto.randomUUID();
  return `GOB-${uuid}`;
}

/**
 * Compute SHA-256 hash of invoice data fields.
 * Used as the `invoiceHash` on the ZatcaInvoice record.
 *
 * @param {object} data
 * @returns {string} Hex-encoded SHA-256 hash
 */
function computeInvoiceHash(data) {
  const canonical = JSON.stringify(data, Object.keys(data).sort());
  return crypto.createHash('sha256').update(canonical).digest('hex');
}

/**
 * Generate a Base64-encoded QR code payload.
 * ZATCA requires specific TLV (Tag-Length-Value) encoded fields:
 *   Seller name, VAT number, timestamp, invoice total, VAT total.
 * For Phase 1 we encode a JSON payload (TLV encoding to be added in Phase 2).
 *
 * @param {object} invoiceData
 * @returns {string} Base64-encoded payload
 */
function generateQRPayload(invoiceData) {
  const payload = {
    v: '1.0',                              // Version
    seller: invoiceData.sellerName || 'Galaxy of Beauty',
    vat_no: invoiceData.vatNumber || '300000000000003', // Placeholder
    ts: invoiceData.timestamp || new Date().toISOString(),
    total: invoiceData.totalAmount,
    vat_total: invoiceData.vatTotal || Math.round(invoiceData.totalAmount * 0.15 * 100) / 100,
    invoice_no: invoiceData.invoiceNumber,
  };

  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

/**
 * Generate or retrieve a ZATCA invoice for a completed booking.
 *
 * @param {number} bookingId
 * @returns {Promise<object>} ZatcaInvoice record
 */
export async function generateInvoice(bookingId) {
  // Check if an invoice already exists
  const existing = await prisma.zatcaInvoice.findUnique({ where: { bookingId } });
  if (existing) return existing;

  // Fetch booking with related data
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      customer: { select: { name: true, email: true } },
      technician: { select: { name: true } },
      service: { select: { titleJson: true, basePrice: true } },
      payment: { select: { amount: true, status: true } },
    },
  });

  if (!booking) {
    throw new AppError('Booking not found', 404, ErrorCodes.BOOKING_NOT_FOUND);
  }

  if (booking.status !== 'COMPLETED' && booking.status !== 'PAID') {
    throw new AppError(
      'Invoice can only be generated for completed or paid bookings',
      400,
      ErrorCodes.BOOKING_INVALID_STATE,
    );
  }

  const invoiceNumber = generateInvoiceNumber();
  const totalAmount = Number(booking.totalAmount);
  const vatAmount = Math.round(totalAmount * 0.15 * 100) / 100; // 15% VAT

  // Build the invoice data for hashing
  const invoiceData = {
    invoiceNumber,
    bookingId,
    customerName: booking.customer?.name,
    technicianName: booking.technician?.name,
    serviceName: booking.service?.titleJson?.ar || '',
    totalAmount,
    vatAmount,
    timestamp: new Date().toISOString(),
  };

  const invoiceHash = computeInvoiceHash(invoiceData);
  const qrCode = generateQRPayload({
    ...invoiceData,
    sellerName: 'Galaxy of Beauty',
  });

  // Create the invoice record
  const invoice = await prisma.zatcaInvoice.create({
    data: {
      bookingId,
      invoiceNumber,
      invoiceHash,
      qrCode,
      status: 'PENDING', // Will be REPORTED in Phase 2
    },
  });

  logger.info('ZATCA invoice generated', {
    bookingId,
    invoiceNumber,
    totalAmount,
    vatAmount,
  });

  return {
    ...invoice,
    totalAmount,
    vatAmount,
    qrPayload: qrCode,
  };
}

/**
 * Get ZATCA invoice for a booking.
 *
 * @param {number} bookingId
 * @returns {Promise<object|null>}
 */
export async function getInvoice(bookingId) {
  return prisma.zatcaInvoice.findUnique({ where: { bookingId } });
}

/**
 * Report invoice to ZATCA (Phase 2 stub — will integrate with ZATCA API).
 *
 * @param {number} invoiceId
 */
export async function reportToZatca(invoiceId) {
  const invoice = await prisma.zatcaInvoice.findUnique({
    where: { id: invoiceId },
    include: { booking: { select: { id: true, totalAmount: true } } },
  });

  if (!invoice) {
    throw new AppError('Invoice not found', 404, ErrorCodes.NOT_FOUND);
  }

  // Phase 2: Call ZATCA clearance API with CSID signing
  // For now, mark as REPORTED
  const updated = await prisma.zatcaInvoice.update({
    where: { id: invoiceId },
    data: {
      status: 'REPORTED',
      reportedAt: new Date(),
    },
  });

  logger.info('ZATCA invoice reported (Phase 2 stub)', { invoiceId, invoiceNumber: invoice.invoiceNumber });

  return updated;
}

/**
 * List ZATCA invoices with filters (admin).
 *
 * @param {object} filters
 * @returns {Promise<{ invoices: Array, total: number }>}
 */
export async function listInvoices(filters = {}) {
  const { status, page = 1, limit = 20 } = filters;
  const skip = (page - 1) * limit;
  const where = {};
  if (status) where.status = status;

  const [invoices, total] = await Promise.all([
    prisma.zatcaInvoice.findMany({
      where,
      skip,
      take: Math.min(limit, 100),
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

  return { invoices, total, page, limit };
}

export default { generateInvoice, getInvoice, reportToZatca, listInvoices };
