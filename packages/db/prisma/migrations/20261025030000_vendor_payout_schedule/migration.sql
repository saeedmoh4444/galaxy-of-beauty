-- A2 — payout automation (VENDOR_PROFESSIONALIZATION_PLAN Wave A).
-- Vendors pick a settlement cadence (MANUAL default); the daily
-- gob-payouts job settles scheduled vendors' elapsed windows into
-- PENDING payout rows and stamps lastPayoutRunAt.

-- AlterTable
ALTER TABLE "vendors" ADD COLUMN "payoutSchedule" TEXT NOT NULL DEFAULT 'MANUAL';
ALTER TABLE "vendors" ADD COLUMN "lastPayoutRunAt" TIMESTAMP(3);
