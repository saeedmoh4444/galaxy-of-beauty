-- B3b — low-stock threshold per product (VENDOR_DASHBOARD_ENHANCEMENT_PLAN).
-- stock ≤ threshold → Overview alert + low_stock notification event. Default 5
-- applies to existing products; vendors set their own at creation (editor in C1).

-- AlterTable
ALTER TABLE "products" ADD COLUMN "lowStockThreshold" INTEGER NOT NULL DEFAULT 5;
