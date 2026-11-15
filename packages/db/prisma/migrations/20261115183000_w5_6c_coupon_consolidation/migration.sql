-- W5-6c — consolidate BeautyCoupon into the promo engine (PromoCode).
-- Legacy coupons become percent-type promo codes owned by the first admin.
INSERT INTO "promo_codes"
  ("code", "discountType", "discountValue", "maxUses", "currentUses",
   "validFrom", "validUntil", "isActive", "createdBy", "createdAt")
SELECT
  b."code",
  'percent',
  b."discountPercent"::decimal,
  b."maxUses",
  b."used",
  NOW(),
  b."expiresAt",
  b."isActive",
  COALESCE((SELECT MIN("id") FROM "users" WHERE "role" = 'ADMIN'), 1),
  b."createdAt"
FROM "beauty_coupons" b
WHERE NOT EXISTS (SELECT 1 FROM "promo_codes" p WHERE p."code" = b."code");
