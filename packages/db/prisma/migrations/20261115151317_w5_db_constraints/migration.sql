-- DropIndex
DROP INDEX "disputes_status_escalatedAt_idx";

-- DropIndex
DROP INDEX "product_reviews_repliedAt_reminderSentAt_idx";

-- DropIndex
DROP INDEX "store_checkouts_customerId_idx";

-- DropIndex
DROP INDEX "store_orders_vendorId_status_slaBreachedAt_idx";

-- CreateIndex
CREATE INDEX "store_checkouts_customerId_createdAt_idx" ON "store_checkouts"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "vendor_staff_userId_idx" ON "vendor_staff"("userId");

-- W5-1 — defensive orphan cleanup (long-lived dev DBs may hold rows whose
-- owner was deleted while the column was unconstrained).
DELETE FROM "gift_cards" WHERE "purchaserId" NOT IN (SELECT "id" FROM "users");
DELETE FROM "flash_deal_claims" WHERE "userId" NOT IN (SELECT "id" FROM "users");

-- AddForeignKey
ALTER TABLE "gift_cards" ADD CONSTRAINT "gift_cards_purchaserId_fkey" FOREIGN KEY ("purchaserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flash_deal_claims" ADD CONSTRAINT "flash_deal_claims_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- W5-4 — Dispute dual-target CHECK: exactly one of bookingId/storeOrderId.
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_exactly_one_target_check"
  CHECK (
    ("bookingId" IS NOT NULL AND "storeOrderId" IS NULL)
    OR
    ("bookingId" IS NULL AND "storeOrderId" IS NOT NULL)
  );

-- W5-4 — PromoUsage: a NULL bookingId must not allow unlimited re-uses.
-- PG15 NULLS NOT DISTINCT (Prisma cannot express it; @@unique stays as the
-- closest schema representation).
DROP INDEX "promo_usages_promoCodeId_userId_bookingId_key";
CREATE UNIQUE INDEX "promo_usages_promoCodeId_userId_bookingId_key"
  ON "promo_usages" ("promoCodeId", "userId", "bookingId") NULLS NOT DISTINCT;

-- W5-4 — WishlistItem: duplicate (service|technician) wishlist rows.
DROP INDEX "wishlist_items_userId_serviceId_key";
DROP INDEX "wishlist_items_userId_technicianId_key";
CREATE UNIQUE INDEX "wishlist_items_userId_serviceId_key"
  ON "wishlist_items" ("userId", "serviceId") NULLS NOT DISTINCT;
CREATE UNIQUE INDEX "wishlist_items_userId_technicianId_key"
  ON "wishlist_items" ("userId", "technicianId") NULLS NOT DISTINCT;