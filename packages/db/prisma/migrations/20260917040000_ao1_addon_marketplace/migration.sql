-- 1.3 Service Add-Ons Marketplace (ENHANCEMENT_PLAN) — AO-1: popularity,
-- curated suggestion and bundle discount on the addon link table.
ALTER TABLE "service_addons" ADD COLUMN "popularityScore" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "service_addons" ADD COLUMN "isSuggested" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "service_addons" ADD COLUMN "bundleDiscountPercent" INTEGER NOT NULL DEFAULT 0;
