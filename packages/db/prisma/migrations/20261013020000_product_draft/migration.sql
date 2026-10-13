-- C1 — product draft state (VENDOR_DASHBOARD_ENHANCEMENT_PLAN).
-- Draft products are editable WIP: visible in the portal, hidden from
-- storefront queries. Existing products default to live (false).

-- AlterTable
ALTER TABLE "products" ADD COLUMN "isDraft" BOOLEAN NOT NULL DEFAULT false;
