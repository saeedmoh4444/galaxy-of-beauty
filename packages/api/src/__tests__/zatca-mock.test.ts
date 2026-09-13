/**
 * ZATCA mock tests — deterministic hash/stamp/QR generation and the
 * simulate/isSimulated helpers. (Coverage ratchet target:
 * src/lib/zatcaMock.ts — was 0%)
 */
import { describe, it, expect, afterEach } from 'vitest';
import {
  simulateZatcaReporting,
  simulateZatcaClearance,
  isZatcaSimulated,
  type ZatcaInvoiceRequest,
} from '../lib/zatcaMock';

const invoice: ZatcaInvoiceRequest = {
  invoiceNumber: 'INV-001',
  bookingId: 42,
  totalAmount: 345.5,
  vatAmount: 51.83,
  customerName: 'نورة',
  technicianName: 'سارة',
  serviceName: 'قص شعر',
};

describe('zatcaMock', () => {
  afterEach(() => {
    delete process.env['ZATCA_SIMULATE'];
    delete process.env['NODE_ENV'];
  });

  it('reports an invoice with a deterministic hash and stamp', () => {
    const res = simulateZatcaReporting(invoice);
    expect(res.status).toBe('REPORTED');
    expect(res.invoiceHash).toMatch(/^[0-9a-f]{64}$/);
    expect(res.cryptographicStamp).toMatch(/^[A-Za-z0-9+/=]+$/);
    expect(res.clearanceId).toBeTruthy();
    expect(Date.parse(res.reportedAt)).not.toBeNaN();
  });

  it('produces identical hashes for identical invoices', () => {
    const a = simulateZatcaReporting(invoice);
    const b = simulateZatcaReporting(invoice);
    expect(a.invoiceHash).toBe(b.invoiceHash);
    expect(a.cryptographicStamp).toBe(b.cryptographicStamp);
  });

  it('changes the hash when amounts change', () => {
    const a = simulateZatcaReporting(invoice);
    const b = simulateZatcaReporting({ ...invoice, totalAmount: 999 });
    expect(a.invoiceHash).not.toBe(b.invoiceHash);
  });

  it('embeds invoice fields in the base64 QR payload', () => {
    const res = simulateZatcaReporting(invoice);
    const decoded = Buffer.from(res.qrCode, 'base64').toString('utf8');
    expect(decoded).toContain('INV-001');
    expect(decoded).toContain('42');
    expect(decoded).toContain('345.50');
    expect(decoded).toContain('نورة');
  });

  it('clears a reported invoice with the same clearance id', () => {
    const res = simulateZatcaClearance('CLR-7');
    expect(res).toEqual({
      clearanceId: 'CLR-7',
      status: 'CLEARED',
      clearedAt: expect.any(String),
    });
  });

  it('isZatcaSimulated respects ZATCA_SIMULATE and NODE_ENV', () => {
    expect(isZatcaSimulated()).toBe(false);
    process.env['ZATCA_SIMULATE'] = 'true';
    expect(isZatcaSimulated()).toBe(true);
    process.env['ZATCA_SIMULATE'] = 'false';
    expect(isZatcaSimulated()).toBe(false);
    process.env['NODE_ENV'] = 'development';
    expect(isZatcaSimulated()).toBe(true);
  });
});
