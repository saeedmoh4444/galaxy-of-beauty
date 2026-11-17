-- DropIndex
DROP INDEX "disputes_status_escalatedAt_idx";

-- DropIndex
DROP INDEX "product_reviews_repliedAt_reminderSentAt_idx";

-- DropIndex
DROP INDEX "store_checkouts_customerId_idx";

-- DropIndex
DROP INDEX "store_orders_vendorId_status_slaBreachedAt_idx";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "gender" TEXT NOT NULL DEFAULT 'female';

-- CreateIndex
CREATE INDEX "store_checkouts_customerId_createdAt_idx" ON "store_checkouts"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "vendor_staff_userId_idx" ON "vendor_staff"("userId");
