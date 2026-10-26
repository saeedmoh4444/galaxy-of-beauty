-- B6 — vendor social links (VENDOR_PROFESSIONALIZATION_PLAN Wave B).
-- One Json column holding { snapchat, tiktok, x, instagram, facebook }
-- URL strings; empty/missing keys render nothing on the storefronts.

-- AlterTable
ALTER TABLE "vendors" ADD COLUMN "socialLinks" JSONB;
