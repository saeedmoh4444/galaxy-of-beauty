-- C2 — product listing approval (VENDOR_DASHBOARD_ENHANCEMENT_PLAN).
-- Relaxed default: products are LIVE immediately. With the strict feature
-- flag on, new products start PENDING and surface only after admin
-- approval (ProviderSubmission kind 'product' materializes the decision).

-- AlterTable
ALTER TABLE "products" ADD COLUMN "approvalStatus" TEXT NOT NULL DEFAULT 'LIVE';
ALTER TABLE "products" ADD COLUMN "reviewNotes" TEXT;
