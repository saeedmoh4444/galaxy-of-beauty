-- B5 — vendor-side dispute response (VENDOR_DASHBOARD_ENHANCEMENT_PLAN).
-- The vendor answers a customer-raised store dispute before admin resolution;
-- OPEN flips to UNDER_REVIEW on first response.

-- AlterTable
ALTER TABLE "disputes" ADD COLUMN "vendorResponse" TEXT;
ALTER TABLE "disputes" ADD COLUMN "vendorRespondedAt" TIMESTAMP(3);
