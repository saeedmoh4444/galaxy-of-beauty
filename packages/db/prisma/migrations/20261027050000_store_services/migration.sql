-- C5 — hybrid store-services (H2): store-owned bookable services that
-- reuse the booking engine via a hidden pseudo-technician per store.
-- See docs/VENDOR_HYBRID_STORE_SERVICES_PLAN.md.

-- Service: nullable vendor owner + store-service marker (store services
-- live on the storefront Services tab, out of the general browse).
ALTER TABLE "services" ADD COLUMN "vendorId" INTEGER;
ALTER TABLE "services" ADD COLUMN "isStoreService" BOOLEAN NOT NULL DEFAULT false;

-- Booking: denormalized provider link for store-service bookings (vendor
-- bookings surface + payout attribution); null = technician booking.
ALTER TABLE "bookings" ADD COLUMN "vendorId" INTEGER;

-- Technician: one hidden pseudo-technician row per store.
ALTER TABLE "technicians" ADD COLUMN "storeVendorId" INTEGER;

CREATE UNIQUE INDEX "technicians_storeVendorId_key" ON "technicians"("storeVendorId");
CREATE INDEX "services_vendorId_isActive_idx" ON "services"("vendorId", "isActive");
CREATE INDEX "bookings_vendorId_idx" ON "bookings"("vendorId");

ALTER TABLE "services" ADD CONSTRAINT "services_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "technicians" ADD CONSTRAINT "technicians_storeVendorId_fkey" FOREIGN KEY ("storeVendorId") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
