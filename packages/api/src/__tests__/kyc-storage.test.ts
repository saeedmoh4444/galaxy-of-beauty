/**
 * B1 — KYC private-storage contract. With AWS configured, KYC uploads
 * land in the private bucket and their stored urls are object KEYS —
 * never permanent public S3 URLs. Reads sign short-lived URLs. Locally
 * (no AWS) the contract degrades to the local uploads route.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';
import type { JwtPayload } from '../lib/jwt';
import { buildUser, buildTechnician } from './factories';
import { uploadFile, getSignedFileUrl } from '../lib/storage';

const CSRF = 'a'.repeat(64);
const DOC_BASE64 = Buffer.from('%PDF-1.4 fake pdf content').toString('base64');

async function caller(user: JwtPayload | null) {
  const ctx = await createTRPCContext({ user, csrfCookie: CSRF, csrfHeader: CSRF });
  return (appRouter as any).createCaller(ctx);
}

let techUser: JwtPayload;
let techUserId: number;
let techRecordId: number;

beforeAll(async () => {
  const u = await prisma.user.create({ data: buildUser({ role: 'TECHNICIAN' }) });
  techUserId = u.id;
  techUser = { id: u.id, role: 'TECHNICIAN', email: u.email };
  const t = await prisma.technician.create({ data: buildTechnician({ userId: u.id }) });
  techRecordId = t.id;
}, 15000);

afterAll(async () => {
  await prisma.technician.deleteMany({ where: { id: techRecordId } });
  await prisma.user.deleteMany({ where: { id: techUserId } });
});

describe('storage — private upload contract', () => {
  it('getSignedFileUrl passes legacy full URLs through untouched', async () => {
    const url = 'https://bucket.s3.me-south-1.amazonaws.com/kyc/1/id.pdf';
    expect(await getSignedFileUrl(url)).toBe(url);
  });

  it('getSignedFileUrl resolves a key against local uploads when AWS is absent', async () => {
    const resolved = await getSignedFileUrl('kyc/7/id_front.pdf');
    expect(resolved).toContain('/uploads/kyc/7/id_front.pdf');
  });

  it('uploadFile with private:true never exposes a public S3 object URL', async () => {
    const result = await uploadFile(
      Buffer.from('pdf'),
      'id.pdf',
      `kyc/${techUserId}/id_front`,
      'application/pdf',
      { private: true },
    );
    expect(result.key.startsWith(`kyc/${techUserId}/`)).toBe(true);
    // In AWS mode the url IS the key; locally it degrades to the local
    // route — either way it must never be a public amazonaws object URL.
    expect(result.url).not.toContain('amazonaws.com');
  });
});

describe('uploads.uploadKycDocument', () => {
  it('stores the document on the technician record without a public S3 URL', async () => {
    const c = await caller(techUser);
    const res = await c.uploads.uploadKycDocument({
      file: { name: 'id.pdf', type: 'application/pdf', size: 100, base64: DOC_BASE64 },
      documentType: 'id_front',
    });
    expect(res.key).toBeTruthy();
    expect(res.url).not.toContain('amazonaws.com');

    const tech = await prisma.technician.findUniqueOrThrow({ where: { id: techRecordId } });
    const docs = (tech.kycDocuments ?? []) as Array<{ type: string; url: string }>;
    expect(docs.some((d) => d.type === 'id_front')).toBe(true);
    expect(tech.kycStatus).toBe('SUBMITTED');
  });

  it('serves KYC documents through resolvable URLs in getMyKycStatus', async () => {
    const c = await caller(techUser);
    const status = await c.technicians.getMyKycStatus();
    const docs = (status.kycDocuments ?? []) as Array<{ type: string; url: string }>;
    expect(docs.length).toBeGreaterThanOrEqual(1);
    for (const d of docs) {
      // Signed (AWS) or local-route — always resolvable, never a raw key.
      expect(d.url.startsWith('http')).toBe(true);
    }
  });
});

describe('admin.listTechnicians', () => {
  it('returns KYC documents with resolvable urls (never raw keys)', async () => {
    const adminDb = await prisma.user.findFirstOrThrow({ where: { role: 'ADMIN' } });
    const admin = { id: adminDb.id, role: 'ADMIN', email: adminDb.email };
    const c = await caller(admin);
    const res = await c.admin.listTechnicians({ kycStatus: 'SUBMITTED', limit: 50 });
    const mine = res.items.find((t: { id: number }) => t.id === techRecordId);
    expect(mine).toBeTruthy();
    const docs = (mine.kycDocuments ?? []) as Array<{ type: string; url: string }>;
    expect(docs.length).toBeGreaterThanOrEqual(1);
    for (const d of docs) expect(d.url.startsWith('http')).toBe(true);
  });
});
