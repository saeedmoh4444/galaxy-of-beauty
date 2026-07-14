import { describe, it, expect } from 'vitest';
import { createHash } from 'crypto';

// ── Replicate ZATCA functions for unit testing ─────────────

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

function computeCryptographicStamp(invoiceHash: string, uuid: string): string {
  return createHash('sha256').update(`${invoiceHash}:${uuid}`, 'utf8').digest('hex');
}

describe('ZATCA Invoice Hashing', () => {
  describe('computeInvoiceHash', () => {
    it('should produce a 64-character hex hash', () => {
      const hash = computeInvoiceHash({
        invoiceNumber: 'GOB-INV-TEST-0001',
        timestamp: '2026-07-14T10:00:00.000Z',
        totalWithVat: 115.00,
        vatAmount: 15.00,
        previousHash: '0'.repeat(64),
      });
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should produce different hashes for different inputs', () => {
      const hash1 = computeInvoiceHash({
        invoiceNumber: 'GOB-INV-A-0001',
        timestamp: '2026-07-14T10:00:00.000Z',
        totalWithVat: 100,
        vatAmount: 15,
        previousHash: '0'.repeat(64),
      });
      const hash2 = computeInvoiceHash({
        invoiceNumber: 'GOB-INV-B-0001',
        timestamp: '2026-07-14T10:00:00.000Z',
        totalWithVat: 100,
        vatAmount: 15,
        previousHash: '0'.repeat(64),
      });
      expect(hash1).not.toBe(hash2);
    });

    it('should chain with previous hash', () => {
      const hash1 = computeInvoiceHash({
        invoiceNumber: 'INV-001',
        timestamp: '2026-07-14T10:00:00.000Z',
        totalWithVat: 100,
        vatAmount: 15,
        previousHash: '0'.repeat(64),
      });
      const hash2 = computeInvoiceHash({
        invoiceNumber: 'INV-002',
        timestamp: '2026-07-14T11:00:00.000Z',
        totalWithVat: 200,
        vatAmount: 30,
        previousHash: hash1,
      });
      expect(hash1).not.toBe(hash2);
      expect(hash2).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should be deterministic', () => {
      const input = {
        invoiceNumber: 'INV-DET-001',
        timestamp: '2026-07-14T10:00:00.000Z',
        totalWithVat: 115.00,
        vatAmount: 15.00,
        previousHash: 'a'.repeat(64),
      };
      expect(computeInvoiceHash(input)).toBe(computeInvoiceHash(input));
    });
  });

  describe('generateZatcaQR', () => {
    it('should produce a base64 string', () => {
      const qr = generateZatcaQR({
        sellerName: 'جالكسي بيوتي',
        vatNumber: '300000000000003',
        timestamp: '2026-07-14T10:00:00.000Z',
        totalWithVat: 115.00,
        vatAmount: 15.00,
        invoiceHash: 'a'.repeat(64),
      });
      expect(qr).toBeTruthy();
      // Should be valid base64
      expect(() => Buffer.from(qr, 'base64')).not.toThrow();
    });

    it('should produce unique QRs for different hashes', () => {
      const qr1 = generateZatcaQR({
        sellerName: 'Test',
        vatNumber: '300000000000003',
        timestamp: '2026-07-14T10:00:00.000Z',
        totalWithVat: 100,
        vatAmount: 15,
        invoiceHash: 'a'.repeat(64),
      });
      const qr2 = generateZatcaQR({
        sellerName: 'Test',
        vatNumber: '300000000000003',
        timestamp: '2026-07-14T10:00:00.000Z',
        totalWithVat: 100,
        vatAmount: 15,
        invoiceHash: 'b'.repeat(64),
      });
      expect(qr1).not.toBe(qr2);
    });

    it('should handle Arabic seller names', () => {
      const qr = generateZatcaQR({
        sellerName: 'جالكسي بيوتي',
        vatNumber: '300000000000003',
        timestamp: '2026-07-14T10:00:00.000Z',
        totalWithVat: 345.67,
        vatAmount: 45.09,
        invoiceHash: 'c'.repeat(64),
      });
      expect(qr).toBeTruthy();
    });
  });

  describe('encodeTLV', () => {
    it('should produce correct TLV buffer', () => {
      const result = encodeTLV(1, 'Hello');
      // Tag = 1 byte = 0x01
      expect(result[0]).toBe(1);
      // Length = 1 byte = 5
      expect(result[1]).toBe(5);
      // Value = 'Hello'
      expect(result.slice(2).toString('utf8')).toBe('Hello');
    });
  });

  describe('computeCryptographicStamp', () => {
    it('should produce a 64-char hex string', () => {
      const stamp = computeCryptographicStamp('a'.repeat(64), crypto.randomUUID());
      expect(stamp).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should be unique per UUID', () => {
      const stamp1 = computeCryptographicStamp('a'.repeat(64), 'uuid-1');
      const stamp2 = computeCryptographicStamp('a'.repeat(64), 'uuid-2');
      expect(stamp1).not.toBe(stamp2);
    });
  });

  describe('VAT Calculation', () => {
    it('should calculate correct 15% VAT', () => {
      const totalWithVat = 115;
      const vatRate = 0.15;
      const vatAmount = totalWithVat * vatRate / (1 + vatRate);
      const subtotal = totalWithVat - vatAmount;

      expect(vatAmount).toBeCloseTo(15, 2);
      expect(subtotal).toBeCloseTo(100, 2);
    });

    it('should handle zero amount', () => {
      const totalWithVat = 0;
      const vatAmount = totalWithVat * 0.15 / 1.15;
      expect(vatAmount).toBe(0);
    });
  });
});
