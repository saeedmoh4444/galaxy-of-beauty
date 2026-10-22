/**
 * B4 — Earnings & settlement center (VENDOR_DASHBOARD_ENHANCEMENT_PLAN).
 * vendorPortal.earnings returns the enriched statement (summary cards +
 * payout rows with gross = net + fee and the visible commissionRate), and
 * vendorPortal.earningsCsv exports the same rows with bilingual headers
 * (AR/EN) for the statement download.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma, Prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

const createdUserIds: number[] = [];
let owner: JwtPayload;
let vendorId: number;
let payoutIds: number[] = [];

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

beforeAll(async () => {
  const ownerUser = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(ownerUser.id);
  owner = { id: ownerUser.id, role: 'CUSTOMER', email: ownerUser.email };

  const vendor = await prisma.vendor.create({
    data: {
      userId: ownerUser.id,
      storeName: 'Earnings Store',
      storeSlug: `earn-${Date.now()}`,
      commissionRate: 12,
    },
  });
  vendorId = vendor.id;

  // Two completed payouts (net 100/250, fee 25/50) + one pending.
  const p1 = await prisma.payout.create({
    data: {
      vendorId,
      periodStart: new Date('2026-09-01'),
      periodEnd: new Date('2026-09-15'),
      amount: new Prisma.Decimal(100),
      fee: new Prisma.Decimal(25),
      status: 'COMPLETED',
      processedAt: new Date('2026-09-16'),
    },
  });
  const p2 = await prisma.payout.create({
    data: {
      vendorId,
      periodStart: new Date('2026-09-16'),
      periodEnd: new Date('2026-09-30'),
      amount: new Prisma.Decimal(250),
      fee: new Prisma.Decimal(50),
      status: 'COMPLETED',
      processedAt: new Date('2026-10-01'),
    },
  });
  const p3 = await prisma.payout.create({
    data: {
      vendorId,
      periodStart: new Date('2026-10-01'),
      periodEnd: new Date('2026-10-15'),
      amount: new Prisma.Decimal(80),
      fee: new Prisma.Decimal(10),
      status: 'PENDING',
    },
  });
  payoutIds = [p1.id, p2.id, p3.id];
}, 15000);

afterAll(async () => {
  await prisma.payout.deleteMany({ where: { vendorId } });
  await prisma.vendor.deleteMany({ where: { id: vendorId } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

describe('vendorPortal.earnings — enriched statement (B4)', () => {
  it('aggregates pending/processed net + fees and exposes gross = net + fee', async () => {
    const c = await caller(owner);
    const stmt = await c.vendorPortal.earnings();

    expect(stmt.commissionRate).toBe(12);
    expect(stmt.summary.pendingNet).toBe(80);
    expect(stmt.summary.processedNet).toBe(350);
    expect(stmt.summary.totalFee).toBe(85);

    expect(stmt.rows).toHaveLength(3);
    const completed = stmt.rows.find((r) => r.id === payoutIds[0]!);
    expect(completed).toMatchObject({ net: 100, fee: 25, gross: 125, status: 'COMPLETED' });
  });

  it('returns zeros and no rows for a vendor-less user', async () => {
    const anonOwner = await prisma.user.create({ data: buildUser() });
    createdUserIds.push(anonOwner.id);
    const c = await caller({ id: anonOwner.id, role: 'CUSTOMER', email: anonOwner.email });
    const stmt = await c.vendorPortal.earnings();
    expect(stmt.summary).toMatchObject({
      pendingNet: 0,
      processedNet: 0,
      totalFee: 0,
    });
    expect(stmt.rows).toEqual([]);
  });
});

describe('vendorPortal.earningsCsv — bilingual export (B4)', () => {
  it('emits Arabic headers for ar and English headers for en, with row data', async () => {
    const c = await caller(owner);

    const ar = await c.vendorPortal.earningsCsv({ locale: 'ar' });
    const arLines = ar.csv.trim().split('\r\n');
    expect(arLines[0]).toContain('بداية الفترة');
    expect(arLines[0]).toContain('الصافي');
    expect(arLines).toHaveLength(4); // header + 3 rows
    // Rows are createdAt-desc; assert on the whole body, not position.
    expect(arLines.slice(1).join('\n')).toContain('100.00');

    const en = await c.vendorPortal.earningsCsv({ locale: 'en' });
    const enLines = en.csv.trim().split('\r\n');
    expect(enLines[0]).toContain('Period start');
    expect(enLines[0]).toContain('Net');
    expect(enLines).toHaveLength(4);
  });

  it('quotes values containing commas', async () => {
    await prisma.payout.update({
      where: { id: payoutIds[0]! },
      data: { reference: 'Bank, Riyadh' },
    });
    const c = await caller(owner);
    const en = await c.vendorPortal.earningsCsv({ locale: 'en' });
    const row = en.csv
      .trim()
      .split('\r\n')
      .find((l) => l.includes('Bank'));
    expect(row).toContain('"Bank, Riyadh"');
  });
});
