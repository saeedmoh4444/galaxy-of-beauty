-- C4 — rich product media + product-level SEO (PROFESSIONALIZATION
-- Wave C): product video, bilingual meta title/description and the
-- optional AR try-on deep link (vendor opt-in).

ALTER TABLE "products" ADD COLUMN "videoUrl" TEXT;
ALTER TABLE "products" ADD COLUMN "metaTitleJson" JSONB;
ALTER TABLE "products" ADD COLUMN "metaDescJson" JSONB;
ALTER TABLE "products" ADD COLUMN "arTryOnUrl" TEXT;
