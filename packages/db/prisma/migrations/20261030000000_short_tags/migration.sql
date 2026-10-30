-- Q1 Phase 3 (REELS_SHOPPABLE_PLAN) — shoppable commerce tags. Reels
-- carry product/service tag overlays; taps land in the click ledger
-- that powers the Q3 order-attribution read-model.
CREATE TABLE "short_tags" (
    "id" SERIAL NOT NULL,
    "shortId" INTEGER NOT NULL,
    "productId" INTEGER,
    "serviceId" INTEGER,
    "positionSec" INTEGER,
    "labelJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "short_tags_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "short_tag_clicks" (
    "id" SERIAL NOT NULL,
    "tagId" INTEGER NOT NULL,
    "shortId" INTEGER NOT NULL,
    "productId" INTEGER,
    "userId" INTEGER,
    "clickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "short_tag_clicks_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "short_tags_shortId_idx" ON "short_tags"("shortId");
CREATE INDEX "short_tags_productId_idx" ON "short_tags"("productId");
CREATE INDEX "short_tags_serviceId_idx" ON "short_tags"("serviceId");
CREATE INDEX "short_tag_clicks_productId_clickedAt_idx" ON "short_tag_clicks"("productId", "clickedAt");
CREATE INDEX "short_tag_clicks_userId_clickedAt_idx" ON "short_tag_clicks"("userId", "clickedAt");

ALTER TABLE "short_tags" ADD CONSTRAINT "short_tags_shortId_fkey" FOREIGN KEY ("shortId") REFERENCES "shorts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "short_tags" ADD CONSTRAINT "short_tags_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "short_tags" ADD CONSTRAINT "short_tags_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "short_tag_clicks" ADD CONSTRAINT "short_tag_clicks_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "short_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "short_tag_clicks" ADD CONSTRAINT "short_tag_clicks_shortId_fkey" FOREIGN KEY ("shortId") REFERENCES "shorts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "short_tag_clicks" ADD CONSTRAINT "short_tag_clicks_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "short_tag_clicks" ADD CONSTRAINT "short_tag_clicks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
