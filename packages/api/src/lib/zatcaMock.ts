/**
 * ZATCA E-Invoicing Mock — Development Sandbox
 *
 * In production, ZATCA API calls are made to the real Fatoora portal.
 * In development, this mock returns realistic responses so you can test
 * the full e-invoicing flow without hitting ZATCA's sandbox.
 *
 * Set ZATCA_SIMULATE=true in .env to use this mock.
 */

import crypto from 'crypto';

export interface ZatcaInvoiceRequest {
  invoiceNumber: string;
  bookingId: number;
  totalAmount: number;
  vatAmount: number;
  customerName: string;
  technicianName: string;
  serviceName: string;
}

export interface ZatcaInvoiceResponse {
  clearanceId: string;
  invoiceHash: string;
  cryptographicStamp: string;
  qrCode: string;
  status: 'REPORTED' | 'CLEARED';
  reportedAt: string;
}

function generateHash(invoice: ZatcaInvoiceRequest): string {
  const data = `${invoice.invoiceNumber}|${invoice.bookingId}|${invoice.totalAmount}|${invoice.vatAmount}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

function generateStamp(hash: string): string {
  return crypto.createHash('sha256').update(`${hash}|ZATCA_MOCK_SIGNING_KEY`).digest('base64');
}

function generateQR(invoice: ZatcaInvoiceRequest): string {
  // Simplified ZATCA QR format (real one is more complex)
  const fields = [
    invoice.invoiceNumber,
    invoice.bookingId.toString(),
    invoice.totalAmount.toFixed(2),
    invoice.vatAmount.toFixed(2),
    invoice.customerName,
    invoice.serviceName,
  ];
  return Buffer.from(fields.join('|')).toString('base64');
}

export function simulateZatcaReporting(invoice: ZatcaInvoiceRequest): ZatcaInvoiceResponse {
  // Simulate 100-500ms processing time
  const hash = generateHash(invoice);
  const stamp = generateStamp(hash);
  const qr = generateQR(invoice);

  return {
    clearanceId: crypto.randomUUID(),
    invoiceHash: hash,
    cryptographicStamp: stamp,
    qrCode: qr,
    status: 'REPORTED',
    reportedAt: new Date().toISOString(),
  };
}

export function simulateZatcaClearance(
  clearanceId: string,
): { clearanceId: string; status: 'CLEARED'; clearedAt: string } {
  return {
    clearanceId,
    status: 'CLEARED',
    clearedAt: new Date().toISOString(),
  };
}

/**
 * Check if ZATCA simulation mode is enabled.
 */
export function isZatcaSimulated(): boolean {
  return process.env.ZATCA_SIMULATE === 'true' || process.env.NODE_ENV === 'development';
}
