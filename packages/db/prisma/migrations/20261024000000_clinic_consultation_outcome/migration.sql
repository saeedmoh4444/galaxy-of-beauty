-- E2 — clinic console deepening (VENDOR_DASHBOARD_ENHANCEMENT_PLAN Wave 5).
-- No-show flag + cancellation/outcome reason on clinic consultations
-- (expand-contract; both nullable, no backfill).

-- AlterTable
ALTER TABLE "clinic_consultations" ADD COLUMN "cancelReason" TEXT;
ALTER TABLE "clinic_consultations" ADD COLUMN "noShow" BOOLEAN NOT NULL DEFAULT false;
