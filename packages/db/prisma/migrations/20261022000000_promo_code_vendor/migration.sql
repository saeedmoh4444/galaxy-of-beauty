-- C4 — per-store coupon codes (VENDOR_DASHBOARD_ENHANCEMENT_PLAN wave 3).
-- Nullable vendorId scopes a promo code to one store: NULL = platform-wide
-- (existing admin codes), set = store coupon that only validates against
-- that store's checkout (cross-store rejection in promo.validate).

-- AlterTable
ALTER TABLE "promo_codes" ADD COLUMN "vendorId" INTEGER;

-- CreateIndex
CREATE INDEX "promo_codes_vendorId_idx" ON "promo_codes"("vendorId");

-- AddForeignKey
ALTER TABLE "promo_codes" ADD CONSTRAINT "promo_codes_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
