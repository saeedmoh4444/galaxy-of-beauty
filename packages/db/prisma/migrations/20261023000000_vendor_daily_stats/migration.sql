-- D1 — vendor analytics read-model (VENDOR_DASHBOARD_ENHANCEMENT_PLAN
-- Phase D). Per-store daily stats, materialized nightly by BullMQ from
-- store orders; one row per (vendorId, day). `day` is the NOON-UTC bucket
-- date (12:00 UTC = 15:00 KSA — a KSA business day maps to one date).
-- The materialization job upserts (idempotent re-runs).

-- CreateTable
CREATE TABLE "vendor_daily_stats" (
    "id" SERIAL NOT NULL,
    "vendorId" INTEGER NOT NULL,
    "day" TIMESTAMP(3) NOT NULL,
    "revenue" DECIMAL(12,2) NOT NULL,
    "orders" INTEGER NOT NULL,
    "aov" DECIMAL(10,2) NOT NULL,
    "newCustomers" INTEGER NOT NULL,
    "returningCustomers" INTEGER NOT NULL,
    "productSales" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_daily_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vendor_daily_stats_vendorId_day_key" ON "vendor_daily_stats"("vendorId", "day");
CREATE INDEX "vendor_daily_stats_vendorId_day_idx" ON "vendor_daily_stats"("vendorId", "day");

-- AddForeignKey
ALTER TABLE "vendor_daily_stats" ADD CONSTRAINT "vendor_daily_stats_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
