-- R1 (SELLER_FIRST_CLASS_ROLE_PLAN) — backfill: every existing store
-- owner (a user with a Vendor row) becomes a SELLER-role account.
-- Legacy CUSTOMER+hasVendor routing stays honored in the app during the
-- transition; this makes seller-ness a first-class claim going forward.
UPDATE "users"
SET role = 'SELLER'
WHERE id IN (SELECT "userId" FROM "vendors");
