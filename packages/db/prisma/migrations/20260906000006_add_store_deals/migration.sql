-- Store plan Phase 4b: store-proposed product deals
CREATE TABLE "store_deals" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "vendorId" INTEGER NOT NULL,
    "originalPrice" DECIMAL(10,2) NOT NULL,
    "dealPrice" DECIMAL(10,2) NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "store_deals_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "store_deals_productId_isActive_startsAt_endsAt_idx" ON "store_deals"("productId", "isActive", "startsAt", "endsAt");
CREATE INDEX "store_deals_vendorId_isActive_idx" ON "store_deals"("vendorId", "isActive");
ALTER TABLE "store_deals" ADD CONSTRAINT "store_deals_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "store_deals" ADD CONSTRAINT "store_deals_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
