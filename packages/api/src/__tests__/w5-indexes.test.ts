/**
 * W5-5/W5-12 — index-hygiene contracts (migration 20261115161500_w5_indexes):
 *  - products(vendorId, sales) serves the portal top-products sort
 *  - store_checkouts(status) serves webhook/pending sweeps
 *  - payouts partial (vendorId WHERE status='PENDING') serves the
 *    settlement sweep
 *  - the legacy store_checkouts(customerId) single index is DROPPED
 *    (strict prefix of (customerId, createdAt) — redundant write cost)
 */
import { describe, expect, it } from 'vitest';
import { prisma } from '@galaxy/db';

async function indexNames(): Promise<string[]> {
  const rows = await prisma.$queryRawUnsafe<Array<{ indexname: string }>>(
    `SELECT indexname FROM pg_indexes WHERE schemaname = 'public'`,
  );
  return rows.map((r) => r.indexname);
}

describe('W5 index contracts', () => {
  it('has the top-products sort index', async () => {
    expect(await indexNames()).toContain('products_vendorId_sales_idx');
  });

  it('has the checkout status index', async () => {
    expect(await indexNames()).toContain('store_checkouts_status_idx');
  });

  it('has the partial payout-settlement index', async () => {
    expect(await indexNames()).toContain('payouts_vendor_settlement_partial_idx');
  });

  it('drops the redundant single-column checkout index (W5-12)', async () => {
    expect(await indexNames()).not.toContain('store_checkouts_customerId_idx');
  });
});
