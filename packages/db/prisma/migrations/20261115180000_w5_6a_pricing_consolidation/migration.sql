-- W5-6a — consolidate the duplicate pricing family: canonical is
-- ServicePricing (service_pricing_rules — the bookings surge/peak path);
-- the legacy pricing_rules table carried an extra label column.

ALTER TABLE "service_pricing_rules" ADD COLUMN "labelJson" JSONB;

-- Migrate legacy rows (admin-created rules must keep applying to bookings).
INSERT INTO "service_pricing_rules"
  ("serviceId", "categoryId", "dayOfWeek", "hourStart", "hourEnd",
   "priceMultiplier", "technicianTier", "labelJson", "isActive", "createdAt", "updatedAt")
SELECT "serviceId", "categoryId", "dayOfWeek", "hourStart", "hourEnd",
       "priceMultiplier", "technicianTier", "labelJson", "isActive", "createdAt", "updatedAt"
FROM "pricing_rules";

-- The legacy table stays for historical reads (deprecated in the schema).
