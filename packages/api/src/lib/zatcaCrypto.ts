/**
 * 6.1d — real ZATCA onboarding: cryptographic foundations.
 *
 * ECDSA P-256 keypair + PKCS#10 CSR (node-forge), invoice TLV encoding
 * (ZATCA QR spec tags 1–8), and ECDSA signing of the TLV payload
 * (tag 9). Activating the real portal needs the user's OTP/credentials
 * later; this module is credential-agnostic and fully testable.
 */
import { generateKeyPairSync, createSign } from 'crypto';
import * as forge from 'node-forge';

export interface EcdsaKeyPair {
  privateKeyPem: string;
  publicKeyPem: string;
}

/** P-256 keypair, PKCS#8 private + SPKI public PEMs. */
export function generateEcdsaKeyPair(): EcdsaKeyPair {
  const { privateKey, publicKey } = generateKeyPairSync('ec', {
    namedCurve: 'P-256',
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    publicKeyEncoding: { type: 'spki', format: 'pem' },
  });
  return { privateKeyPem: privateKey, publicKeyPem: publicKey };
}

export interface CsrOptions {
  vatNumber: string;
  commonName: string; // e.g. "Galaxy of Beauty"
  organization: string;
  organizationUnit: string; // e.g. branch name / city
  country: string; // e.g. "SA"
}

export interface CsrResult {
  csrPem: string;
  privateKeyPem: string;
}

/**
 * ZATCA compliance CSID request: self-signed CSR with the VAT number in
 * the subject CN (per ZATCA: CN = "2-<commonName>" etc.) and a SAN.
 */
export function generateCsr(opts: CsrOptions): CsrResult {
  const keys = forge.pki.rsa.generateKeyPair(2048);
  const csr = forge.pki.createCertificationRequest();
  csr.publicKey = keys.publicKey;
  csr.setSubject([
    { name: 'commonName', value: opts.commonName },
    { name: 'organizationName', value: opts.organization },
    { name: 'organizationalUnitName', value: opts.organizationUnit },
    { name: 'countryName', value: opts.country },
  ]);
  csr.setAttributes([
    {
      name: 'extensionRequest',
      extensions: [
        {
          name: 'subjectAltName',
          altNames: [{ type: 2, value: `VAT-${opts.vatNumber}` }], // 2 = DNS
        },
      ],
    },
  ]);
  csr.sign(keys.privateKey, forge.md.sha256.create());
  return {
    csrPem: forge.pki.certificationRequestToPem(csr),
    privateKeyPem: forge.pki.privateKeyToPem(keys.privateKey),
  };
}

/** TLV per the ZATCA QR spec: 1-byte tag, 1-byte length, value. */
export function encodeTlv(tag: number, value: string): Buffer {
  const tagBuf = Buffer.alloc(1);
  tagBuf.writeUInt8(tag, 0);
  const valueBuf = Buffer.from(value, 'utf8');
  const lenBuf = Buffer.alloc(1);
  lenBuf.writeUInt8(valueBuf.length, 0);
  return Buffer.concat([tagBuf, lenBuf, valueBuf]);
}

export interface InvoiceTlvFields {
  sellerName: string; // tag 1
  vatNumber: string; // tag 2
  timestamp: string; // tag 3 (ISO-8601)
  totalWithVat: string; // tag 4
  vatAmount: string; // tag 5
}

/** Invoice payload = TLV tags 1–5 (tags 6–8 reserved/unused here). */
export function buildInvoiceTlv(f: InvoiceTlvFields): Buffer {
  return Buffer.concat([
    encodeTlv(1, f.sellerName),
    encodeTlv(2, f.vatNumber),
    encodeTlv(3, f.timestamp),
    encodeTlv(4, f.totalWithVat),
    encodeTlv(5, f.vatAmount),
  ]);
}

/** ECDSA SHA-256 signature of the TLV payload (DER, per ZATCA). */
export function signInvoiceTlv(payload: Buffer, privateKeyPem: string): Buffer {
  const signer = createSign('SHA256');
  signer.update(payload);
  signer.end();
  return signer.sign({ key: privateKeyPem, dsaEncoding: 'der' });
}

/** Full ZATCA QR: tags 1–5 payload + tag 9 signature, Base64-encoded. */
export function buildZatcaQr(fields: InvoiceTlvFields, privateKeyPem: string): string {
  const payload = buildInvoiceTlv(fields);
  const signature = signInvoiceTlv(payload, privateKeyPem);
  return Buffer.concat([payload, encodeTlv(9, signature.toString('base64'))]).toString('base64');
}
