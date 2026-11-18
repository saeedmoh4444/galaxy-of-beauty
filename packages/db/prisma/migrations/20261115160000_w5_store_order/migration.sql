-- W5-7 — StoreOrder: customer-facing order codes + status enum (kills the
-- String-vs-enum drift). Defensive: unknown status values fall back to
-- PENDING_FULFILLMENT; existing rows get deterministic SO- codes.

CREATE TYPE "StoreOrderStatus" AS ENUM ('PENDING_FULFILLMENT', 'FULFILLED', 'CANCELLED', 'REFUNDED');

-- The text column carries a DEFAULT that cannot auto-cast to the enum —
-- drop it first, re-add after the cast.
ALTER TABLE "store_orders" ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "store_orders"
  ALTER COLUMN "status" TYPE "StoreOrderStatus"
  USING (CASE "status"
    WHEN 'FULFILLED' THEN 'FULFILLED'::"StoreOrderStatus"
    WHEN 'CANCELLED' THEN 'CANCELLED'::"StoreOrderStatus"
    ELSE 'PENDING_FULFILLMENT'::"StoreOrderStatus"
  END);

ALTER TABLE "store_orders"
  ALTER COLUMN "status" SET DEFAULT 'PENDING_FULFILLMENT';

ALTER TABLE "store_orders" ADD COLUMN "orderCode" TEXT;

UPDATE "store_orders" SET "orderCode" = 'SO-LEGACY-' || "id" WHERE "orderCode" IS NULL;

CREATE UNIQUE INDEX "store_orders_orderCode_key" ON "store_orders"("orderCode");
