-- B5 — funnel analytics (VENDOR_PROFESSIONALIZATION_PLAN Wave B).
-- Product.viewCount = storefront impressions; store_view_logs = daily
-- view counts on the NOON-UTC day (D1 bucket convention), separate
-- from vendor_daily_stats so the materializer never touches them.

-- AlterTable
ALTER TABLE "products" ADD COLUMN "viewCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "store_view_logs" (
    "id" SERIAL NOT NULL,
    "vendorId" INTEGER NOT NULL,
    "day" TIMESTAMP(3) NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "store_view_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "store_view_logs_vendorId_day_key" ON "store_view_logs"("vendorId", "day");

-- AddForeignKey
ALTER TABLE "store_view_logs" ADD CONSTRAINT "store_view_logs_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
