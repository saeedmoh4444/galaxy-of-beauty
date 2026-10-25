-- A3 — fulfillment SLA tracking (VENDOR_PROFESSIONALIZATION_PLAN Wave A).
-- Orders stamp fulfilledAt on fulfillment; the daily gob-sla sweep sets
-- slaBreachedAt once when an order outlives its vendor's promised window
-- (Vendor.fulfillmentSlaHours, default 48).

-- AlterTable
ALTER TABLE "vendors" ADD COLUMN "fulfillmentSlaHours" INTEGER NOT NULL DEFAULT 48;
ALTER TABLE "store_orders" ADD COLUMN "fulfilledAt" TIMESTAMP(3);
ALTER TABLE "store_orders" ADD COLUMN "slaBreachedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "store_orders_vendorId_status_slaBreachedAt_idx" ON "store_orders"("vendorId", "status", "slaBreachedAt");
