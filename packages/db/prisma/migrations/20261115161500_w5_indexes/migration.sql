-- W5-5/W5-12 — index hygiene on the money-adjacent + store surfaces.

-- Top-products sort (vendorId + sales DESC) in the vendor portal.
CREATE INDEX "products_vendorId_sales_idx" ON "products"("vendorId", "sales");

-- Webhook/pending sweeps poll checkouts by status.
CREATE INDEX "store_checkouts_status_idx" ON "store_checkouts"("status");

-- W5-12 — the legacy single-column index is a strict prefix of
-- (customerId, createdAt): redundant write amplification. Drop it.
DROP INDEX IF EXISTS "store_checkouts_customerId_idx";

-- Payout settlement sweep: the daily job aggregates PENDING rows per
-- vendor. Partial index (Prisma can't express it — hand-written).
CREATE INDEX "payouts_vendor_settlement_partial_idx"
  ON "payouts"("vendorId") WHERE "status" = 'PENDING';
