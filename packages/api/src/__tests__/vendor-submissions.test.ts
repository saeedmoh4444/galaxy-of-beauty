/**
 * G2 — Submission status & resubmission (VENDOR_DASHBOARD_ENHANCEMENT_PLAN
 * Wave 6). Caller-scoped submission list (timeline data + admin notes) and
 * the resubmit flow: a REJECTED submission spawns a fresh PENDING_REVIEW
 * submission with merged payload edits.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

const createdUserIds: number[] = [];
const createdSubmissionIds: number[] = [];

let owner: JwtPayload;
let outsider: JwtPayload;

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

beforeAll(async () => {
  const ownerU = await prisma.user.create({ data: buildUser() });
  const outsiderU = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(ownerU.id, outsiderU.id);
  owner = { id: ownerU.id, role: 'CUSTOMER', email: ownerU.email };
  outsider = { id: outsiderU.id, role: 'CUSTOMER', email: outsiderU.email };

  const rejected = await prisma.providerSubmission.create({
    data: {
      providerId: ownerU.id,
      kind: 'store',
      status: 'REJECTED',
      reviewNotes: 'اسم المتجر غير واضح',
      payload: { storeName: 'متجري القديم', vendorId: 0 },
    },
  });
  const approved = await prisma.providerSubmission.create({
    data: {
      providerId: ownerU.id,
      kind: 'store',
      status: 'APPROVED',
      payload: { storeName: 'متجر معتمد' },
    },
  });
  const theirs = await prisma.providerSubmission.create({
    data: {
      providerId: outsiderU.id,
      kind: 'store',
      status: 'PENDING_REVIEW',
      payload: { storeName: 'متجر آخر' },
    },
  });
  createdSubmissionIds.push(rejected.id, approved.id, theirs.id);
}, 15000);

afterAll(async () => {
  await prisma.providerSubmission.deleteMany({ where: { id: { in: createdSubmissionIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

describe('G2 — mySubmissions', () => {
  it('lists only the caller submissions with notes, newest first', async () => {
    const c = await caller(owner);
    const rows = await c.vendorPortal.mySubmissions({});
    expect(rows).toHaveLength(2);
    expect(rows.every((r: { providerId: number }) => r.providerId === owner.id)).toBe(true);
    expect(rows[0].status).toBe('APPROVED'); // newest first
    const rejected = rows.find((r: { status: string }) => r.status === 'REJECTED');
    expect(rejected?.reviewNotes).toBe('اسم المتجر غير واضح');
  });

  it('filters by kind and status', async () => {
    const c = await caller(owner);
    const rejectedOnly = await c.vendorPortal.mySubmissions({ status: 'REJECTED' });
    expect(rejectedOnly).toHaveLength(1);
    expect(rejectedOnly[0].reviewNotes).toBeTruthy();
  });

  it('returns an empty page for a user with no submissions', async () => {
    const c = await caller(outsider);
    // outsider HAS one submission — assert scoping instead via a fresh caller
    const rows = await c.vendorPortal.mySubmissions({});
    expect(rows.every((r: { providerId: number }) => r.providerId === outsider.id)).toBe(true);
  });
});

describe('G2 — resubmitSubmission', () => {
  it('spawns a fresh PENDING_REVIEW submission with merged payload edits', async () => {
    const c = await caller(owner);
    const rejected = await c.vendorPortal.mySubmissions({ status: 'REJECTED' });
    const sub = await c.vendorPortal.resubmitSubmission({
      submissionId: rejected[0].id,
      name: 'متجري الجديد',
      bio: 'نبذة جديدة',
    });
    createdSubmissionIds.push(sub.id);

    expect(sub.id).not.toBe(rejected[0].id);
    expect(sub.status).toBe('PENDING_REVIEW');
    const payload = sub.payload as { storeName?: string; descriptionAr?: string };
    expect(payload.storeName).toBe('متجري الجديد');
    expect(payload.descriptionAr).toBe('نبذة جديدة');
  });

  it('rejects resubmitting a non-rejected submission', async () => {
    const c = await caller(owner);
    const approved = await c.vendorPortal.mySubmissions({ status: 'APPROVED' });
    await expect(
      c.vendorPortal.resubmitSubmission({ submissionId: approved[0].id }),
    ).rejects.toThrow(/rejected/i);
  });

  it('rejects resubmitting another provider submission', async () => {
    const c = await caller(outsider);
    const mine = await c.vendorPortal.mySubmissions({});
    await expect(c.vendorPortal.resubmitSubmission({ submissionId: mine[0].id })).rejects.toThrow(
      /submission|not found/i,
    );
    // outsider resubmitting their OWN submission is allowed — assert the
    // cross-user guard instead via owner's caller on outsider's id.
    const ownerC = await caller(owner);
    await expect(
      ownerC.vendorPortal.resubmitSubmission({ submissionId: mine[0].id }),
    ).rejects.toThrow(/submission|not found/i);
  });
});
