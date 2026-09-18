-- 3.1 Beauty DNA Phase 3 — match attributes.
-- undertone/faceShape feed Skin/Hair Match; product.attributes carries the
-- polymorphic match payload discriminated by `kind`:
--   makeup    { kind, shade, shadeHex, undertone, depth 1..6 }
--   fragrance { kind, fragranceFamily, seasons[] }
--   haircare  { kind, hairTypes[] }
ALTER TABLE "beauty_profiles" ADD COLUMN "undertone" TEXT;
ALTER TABLE "beauty_profiles" ADD COLUMN "faceShape" TEXT;
ALTER TABLE "products" ADD COLUMN "attributes" JSONB;
