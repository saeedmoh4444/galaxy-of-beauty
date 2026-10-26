-- C1 — product variants (PROFESSIONALIZATION Wave C): size/shade/pack
-- options with their own SKU, stock and price delta. Variant stock is the
-- checkout stock unit when a variant is selected; the base product keeps
-- its price as the no-variant line.

CREATE TABLE "product_variants" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "sku" TEXT,
    "nameJson" JSONB NOT NULL,
    "priceDelta" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "lowStockThreshold" INTEGER NOT NULL DEFAULT 5,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "product_variants_productId_isActive_idx" ON "product_variants"("productId", "isActive");

-- Cart lines may target a variant; the compound unique lets the base
-- product and its variants coexist as separate lines. Order items keep
-- the variant id plus a bilingual label snapshot for the drawer/detail.
ALTER TABLE "cart_items" ADD COLUMN "variantId" INTEGER;
ALTER TABLE "store_order_items" ADD COLUMN "variantId" INTEGER;
ALTER TABLE "store_order_items" ADD COLUMN "variantNameJson" JSONB;

DROP INDEX "cart_items_userId_productId_key";
CREATE INDEX "cart_items_userId_productId_variantId_idx" ON "cart_items"("userId", "productId", "variantId");

ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "store_order_items" ADD CONSTRAINT "store_order_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
