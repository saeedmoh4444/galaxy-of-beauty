-- Store plan Phase 1: merchant registration fields on vendors
ALTER TABLE "vendors" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'STORE';
ALTER TABLE "vendors" ADD COLUMN "licenseNumber" TEXT;
ALTER TABLE "vendors" ADD COLUMN "bankIban" TEXT;
ALTER TABLE "vendors" ADD COLUMN "bankName" TEXT;

-- Per-store order records (store-managed fulfillment)
CREATE TABLE "store_orders" (
    "id" SERIAL NOT NULL,
    "vendorId" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "itemCount" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'PENDING_FULFILLMENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_orders_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "store_orders_vendorId_status_createdAt_idx" ON "store_orders"("vendorId", "status", "createdAt");
CREATE INDEX "store_orders_customerId_createdAt_idx" ON "store_orders"("customerId", "createdAt");
ALTER TABLE "store_orders" ADD CONSTRAINT "store_orders_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "store_orders" ADD CONSTRAINT "store_orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
