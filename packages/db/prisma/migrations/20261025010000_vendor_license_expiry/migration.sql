-- G3 — KYC document expiry reminders (VENDOR_DASHBOARD_ENHANCEMENT_PLAN
-- Wave 6). Vendor self-service license expiry + the reminder dedupe
-- stamp (expand-contract; both nullable, no backfill).

-- AlterTable
ALTER TABLE "vendors" ADD COLUMN "licenseExpiryDate" TIMESTAMP(3);
ALTER TABLE "vendors" ADD COLUMN "licenseRemindedAt" TIMESTAMP(3);
