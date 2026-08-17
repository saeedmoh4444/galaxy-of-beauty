-- P1-05: Refresh token family enforcement for pre-Phase-3 rows.
--
-- Legacy rows share the empty-string default familyId. That is a
-- cross-user hazard: the reuse-detection path revokes by familyId, so
-- replaying ONE legacy token would revoke every legacy token of every
-- user. Lineage is unrecoverable for old rows, so give each its own
-- family — the safest possible assignment.
UPDATE refresh_tokens SET "familyId" = gen_random_uuid()::text WHERE "familyId" = '';

-- Prevent new rows from ever landing in the shared bucket again.
ALTER TABLE "refresh_tokens" ALTER COLUMN "familyId" SET DEFAULT gen_random_uuid();
