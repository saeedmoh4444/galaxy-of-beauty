-- R1 — shoppable reels surface links (REELS_SHOPPABLE_PLAN).
-- Shorts attach to a product, a service or a vendor so they surface on
-- store/product/service pages. All three nullable; cascade deletes keep
-- the surface queries clean when catalog rows disappear.
ALTER TABLE "shorts" ADD COLUMN "productId" INTEGER;
ALTER TABLE "shorts" ADD COLUMN "serviceId" INTEGER;
ALTER TABLE "shorts" ADD COLUMN "vendorId" INTEGER;

CREATE INDEX "shorts_productId_idx" ON "shorts"("productId");
CREATE INDEX "shorts_serviceId_idx" ON "shorts"("serviceId");
CREATE INDEX "shorts_vendorId_idx" ON "shorts"("vendorId");

ALTER TABLE "shorts" ADD CONSTRAINT "shorts_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "shorts" ADD CONSTRAINT "shorts_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "shorts" ADD CONSTRAINT "shorts_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
