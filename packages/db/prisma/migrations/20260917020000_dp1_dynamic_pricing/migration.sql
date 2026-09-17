-- 1.1 Dynamic pricing (ENHANCEMENT_PLAN): opt-in per-service dynamic
-- pricing — technician tier + peak/off-peak rules + surge.
CREATE TABLE "service_pricing_rules" (
    "id" SERIAL NOT NULL,
    "serviceId" INTEGER,
    "categoryId" INTEGER,
    "technicianTier" TEXT,
    "dayOfWeek" INTEGER,
    "hourStart" INTEGER,
    "hourEnd" INTEGER,
    "priceMultiplier" DECIMAL(4,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_pricing_rules_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "service_pricing_rules_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "service_pricing_rules_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "service_pricing_rules_serviceId_isActive_idx" ON "service_pricing_rules"("serviceId", "isActive");
CREATE INDEX "service_pricing_rules_isActive_idx" ON "service_pricing_rules"("isActive");

ALTER TABLE "services" ADD COLUMN "dynamicPricingEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "technicians" ADD COLUMN "tier" TEXT NOT NULL DEFAULT 'NEW';
ALTER TABLE "bookings" ADD COLUMN "pricingBreakdown" JSONB;
