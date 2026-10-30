-- Q3 Phase 3 (REELS_SHOPPABLE_PLAN) — reel → order conversion
-- attribution. The vendor daily read-model gains reel-attributed
-- counters; a per-reel daily table lets the portal rank reels by
-- conversion.
ALTER TABLE "vendor_daily_stats"
ADD COLUMN "reelOrders" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "reelRevenue" DECIMAL(12,2) NOT NULL DEFAULT 0;

CREATE TABLE "reel_daily_stats" (
    "id" SERIAL NOT NULL,
    "shortId" INTEGER NOT NULL,
    "day" TIMESTAMP(3) NOT NULL,
    "orders" INTEGER NOT NULL,
    "revenue" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reel_daily_stats_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "reel_daily_stats_shortId_day_key" ON "reel_daily_stats"("shortId", "day");
CREATE INDEX "reel_daily_stats_shortId_day_idx" ON "reel_daily_stats"("shortId", "day");

ALTER TABLE "reel_daily_stats" ADD CONSTRAINT "reel_daily_stats_shortId_fkey" FOREIGN KEY ("shortId") REFERENCES "shorts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
