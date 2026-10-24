-- E4 — reputation hub (VENDOR_DASHBOARD_ENHANCEMENT_PLAN Wave 5).
-- Merchant reply on product reviews: bilingual reply Json + reply
-- timestamp (expand-contract; both nullable, no backfill).

-- AlterTable
ALTER TABLE "product_reviews" ADD COLUMN "replyJson" JSONB;
ALTER TABLE "product_reviews" ADD COLUMN "repliedAt" TIMESTAMP(3);
