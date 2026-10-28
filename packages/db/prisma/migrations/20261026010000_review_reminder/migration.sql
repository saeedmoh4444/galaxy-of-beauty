-- B3 — review showcase (VENDOR_PROFESSIONALIZATION_PLAN Wave B).
-- The daily gob-reviews sweep stamps reminderSentAt once when an
-- unanswered review passes 48h (per-review nudge dedupe).

-- AlterTable
ALTER TABLE "product_reviews" ADD COLUMN "reminderSentAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "product_reviews_repliedAt_reminderSentAt_idx" ON "product_reviews"("repliedAt", "reminderSentAt");
