/**
 * C5 — Bulk CSV product import: the worker handler validates every row
 * (nameAr required, price ≥ 1, non-negative integer stock, in-file
 * duplicate names) and creates DRAFT products, returning a per-row
 * report. Handlers are pure — invoked directly, no BullMQ round-trip.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Job } from 'bullmq';
import { prisma } from '@galaxy/db';
import { handleCsvImportJob, parseCsv, type CsvImportJob } from '../workers/handlers';
import { buildUser } from './factories';

const createdUserIds: number[] = [];
let vendorId: number;

const VALID_HEADER = 'nameAr,nameEn,price,stock,emoji';

async function run(csv: string) {
  return handleCsvImportJob({ data: { vendorId, userId: 0, csv } } as Job<CsvImportJob>);
}

beforeAll(async () => {
  const ownerU = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(ownerU.id);
  const vendor = await prisma.vendor.create({
    data: { userId: ownerU.id, storeName: 'C5 Store', storeSlug: `c5-${Date.now()}` },
  });
  vendorId = vendor.id;
}, 15000);

afterAll(async () => {
  await prisma.product.deleteMany({ where: { vendorId } });
  await prisma.vendor.deleteMany({ where: { userId: { in: createdUserIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

describe('C5 — CSV parser', () => {
  it('parses quoted fields and escaped quotes', () => {
    const rows = parseCsv('a,"b, with comma","say ""hi""",d');
    expect(rows).toEqual([['a', 'b, with comma', 'say "hi"', 'd']]);
  });

  it('handles CRLF rows', () => {
    const rows = parseCsv('a,b\r\nc,d');
    expect(rows).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ]);
  });
});

describe('C5 — import job', () => {
  it('imports valid rows as DRAFT products', async () => {
    const report = await run(`${VALID_HEADER}\nسيروم,Serum,50,10,🧴\nكريم,Cream,30,,""`);
    expect(report).toMatchObject({ totalRows: 2, imported: 2, errors: [] });

    const products = await prisma.product.findMany({ where: { vendorId } });
    expect(products).toHaveLength(2);
    const serum = products.find((p) => (p.nameJson as { ar: string }).ar === 'سيروم');
    expect(serum).toBeDefined();
    expect(serum!.isDraft).toBe(true); // imports land as drafts
    expect(Number(serum!.price)).toBe(50);
    expect(serum!.stock).toBe(10);
    // Empty stock defaults to 10.
    const cream = products.find((p) => (p.nameJson as { ar: string }).ar === 'كريم');
    expect(cream!.stock).toBe(10);
  });

  it('reports per-row errors without creating products for bad rows', async () => {
    const report = await run(`${VALID_HEADER}\n,NoName,50\nسيروم,Serum,-5\nغسول,Wash,20,abc`);
    expect(report.imported).toBe(0);
    expect(report.errors.map((e) => e.row).sort()).toEqual([2, 3, 4]);
    expect(report.errors.some((e) => e.message.includes('nameAr is required'))).toBe(true);
    expect(report.errors.some((e) => e.message.includes('price'))).toBe(true);
    expect(report.errors.some((e) => e.message.includes('stock'))).toBe(true);
  });

  it('flags in-file duplicate names', async () => {
    const report = await run(`${VALID_HEADER}\nسيروم,Serum,50,10\nسيروم,Serum2,40,5`);
    expect(report.imported).toBe(1);
    expect(report.errors).toEqual([{ row: 3, message: 'Duplicate nameAr: سيروم' }]);
  });

  it('rejects a missing header', async () => {
    const report = await run('سيروم,Serum,50,10');
    expect(report.imported).toBe(0);
    expect(report.errors[0]?.message).toContain('CSV header');
  });
});
