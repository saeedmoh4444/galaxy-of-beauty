-- E3 — nail-bar & at-home ops (VENDOR_DASHBOARD_ENHANCEMENT_PLAN Wave 5).
-- Accept/decline queue + completion confirmation on home-service requests
-- (expand-contract; all nullable, no backfill).

-- AlterTable
ALTER TABLE "home_service_requests" ADD COLUMN "declinedAt" TIMESTAMP(3);
ALTER TABLE "home_service_requests" ADD COLUMN "declineReason" TEXT;
ALTER TABLE "home_service_requests" ADD COLUMN "completedAt" TIMESTAMP(3);
