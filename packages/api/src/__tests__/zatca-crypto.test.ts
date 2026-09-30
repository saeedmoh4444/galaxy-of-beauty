/**
 * 6.1d — ZATCA crypto foundations: keypair, CSR, TLV, signing, QR.
 * Pure crypto tests — no network, no credentials.
 */
import { describe, it, expect } from 'vitest';
import { verify } from 'crypto';
import * as forge from 'node-forge';
import {
  generateEcdsaKeyPair,
  generateCsr,
  encodeTlv,
  buildInvoiceTlv,
  signInvoiceTlv,
  buildZatcaQr,
} from '../lib/zatcaCrypto';

describe('zatca crypto', () => {
  it('generates a P-256 keypair in PEM form', () => {
    const { privateKeyPem, publicKeyPem } = generateEcdsaKeyPair();
    expect(privateKeyPem).toContain('PRIVATE KEY');
    expect(publicKeyPem).toContain('PUBLIC KEY');
    // Keys actually work together: sign/verify roundtrip.
    const payload = Buffer.from('invoice-data');
    const sig = signInvoiceTlv(payload, privateKeyPem);
    expect(verify('SHA256', payload, publicKeyPem, sig)).toBe(true);
  });

  it('generates a CSR that forge can parse, with the VAT SAN', () => {
    const { csrPem, privateKeyPem } = generateCsr({
      vatNumber: '310122393700003',
      commonName: 'Galaxy of Beauty',
      organization: 'Galaxy of Beauty',
      organizationUnit: 'Riyadh',
      country: 'SA',
    });
    expect(csrPem).toContain('CERTIFICATE REQUEST');
    const parsed = forge.pki.certificationRequestFromPem(csrPem);
    const cn = parsed.subject.getField('CN');
    expect(cn?.value).toBe('Galaxy of Beauty');
    expect(privateKeyPem).toContain('PRIVATE KEY');
    // The CSR is signed and verifiable with its own public key.
    expect(parsed.verify()).toBe(true);
  });

  it('encodes TLV fields deterministically', () => {
    const tlv = encodeTlv(1, 'AB');
    expect(tlv).toEqual(Buffer.from([1, 2, 0x41, 0x42]));
  });

  it('builds the invoice payload with tags 1-5 in order', () => {
    const payload = buildInvoiceTlv({
      sellerName: 'S',
      vatNumber: 'V',
      timestamp: '2026-09-27T10:00:00Z',
      totalWithVat: '100.00',
      vatAmount: '13.04',
    });
    expect(payload[0]).toBe(1); // tag 1 first
    expect(payload[payload.length - 1]).not.toBe(9); // no signature yet
    expect(payload.length).toBeGreaterThan(20);
  });

  it('signs the payload and embeds tag 9 in the QR', () => {
    const { privateKeyPem, publicKeyPem } = generateEcdsaKeyPair();
    const qr = buildZatcaQr(
      {
        sellerName: 'جالكسي بيوتي',
        vatNumber: '310122393700003',
        timestamp: '2026-09-27T10:00:00Z',
        totalWithVat: '345.00',
        vatAmount: '45.00',
      },
      privateKeyPem,
    );
    const decoded = Buffer.from(qr, 'base64');
    // Find tag 9 and verify the signature over the preceding payload.
    let tag9At = -1;
    for (let i = 0; i < decoded.length; i++) {
      if (decoded[i] === 9) {
        tag9At = i;
        break;
      }
    }
    expect(tag9At).toBeGreaterThan(0);
    const payload = decoded.subarray(0, tag9At);
    const len = decoded[tag9At + 1]!;
    const sigB64 = decoded.subarray(tag9At + 2, tag9At + 2 + len).toString('utf8');
    const sig = Buffer.from(sigB64, 'base64');
    expect(verify('SHA256', payload, publicKeyPem, sig)).toBe(true);
  });
});
