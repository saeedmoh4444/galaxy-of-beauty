-- A4 — dispute SLA & auto-escalation (VENDOR_PROFESSIONALIZATION_PLAN
-- Wave A). The daily gob-disputes sweep sets escalatedAt once when a
-- store dispute passes the 48h vendor-response deadline with no reply.

-- AlterTable
ALTER TABLE "disputes" ADD COLUMN "escalatedAt" TIMESTAMP(3);
ALTER TABLE "disputes" ADD COLUMN "escalatedReason" TEXT;

-- CreateIndex
CREATE INDEX "disputes_status_escalatedAt_idx" ON "disputes"("status", "escalatedAt");
