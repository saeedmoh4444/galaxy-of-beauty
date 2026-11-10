-- R1 (SELLER_FIRST_CLASS_ROLE_PLAN) — add the SELLER role to UserRole.
--
-- Deliberately its own migration file: PostgreSQL forbids USING a value
-- added by ALTER TYPE in the same transaction as the ALTER. The backfill
-- UPDATE (which casts 'SELLER') lives in the next migration so each file
-- gets its own transaction under `prisma migrate deploy`.
ALTER TYPE "UserRole" ADD VALUE 'SELLER';
