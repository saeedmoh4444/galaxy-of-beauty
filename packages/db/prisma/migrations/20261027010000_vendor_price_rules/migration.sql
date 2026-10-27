-- C3 — vendor pricing rules (PROFESSIONALIZATION Wave C): uplift-only
-- weekend/low-stock rules on the vendor's own products; the admin
-- override replaces a rule's multiplier (precedence: admin > vendor).

CREATE TABLE "vendor_price_rules" (
    "id" SERIAL NOT NULL,
    "vendorId" INTEGER NOT NULL,
    "productId" INTEGER,
    "ruleType" TEXT NOT NULL,
    "dayOfWeek" INTEGER,
    "multiplier" DECIMAL(4,2) NOT NULL DEFAULT 1.1,
    "adminOverrideMultiplier" DECIMAL(4,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_price_rules_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "vendor_price_rules_vendorId_isActive_idx" ON "vendor_price_rules"("vendorId", "isActive");

CREATE TABLE "product_price_logs" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "ruleId" INTEGER,
    "oldPrice" DECIMAL(10,2) NOT NULL,
    "newPrice" DECIMAL(10,2) NOT NULL,
    "changedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_price_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "product_price_logs_productId_createdAt_idx" ON "product_price_logs"("productId", "createdAt");

ALTER TABLE "vendor_price_rules" ADD CONSTRAINT "vendor_price_rules_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vendor_price_rules" ADD CONSTRAINT "vendor_price_rules_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_price_logs" ADD CONSTRAINT "product_price_logs_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
