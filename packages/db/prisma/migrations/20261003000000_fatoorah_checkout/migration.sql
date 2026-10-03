-- MyFatoorah replacement (PayFort → MyFatoorah): store checkout with
-- shipping + payment for marketplace orders.

-- CreateEnum
CREATE TYPE "StoreCheckoutStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');

-- CreateTable
CREATE TABLE "store_checkouts" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "shippingCharge" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL,
    "invoiceId" TEXT,
    "gatewayRef" TEXT,
    "status" "StoreCheckoutStatus" NOT NULL DEFAULT 'PENDING',
    "shipPersonName" TEXT NOT NULL,
    "shipMobile" TEXT NOT NULL,
    "shipLineAddress" TEXT NOT NULL,
    "shipCityName" TEXT NOT NULL,
    "shipPostalCode" TEXT NOT NULL,
    "shipCountryCode" TEXT NOT NULL,
    "shippingMethod" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_checkouts_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "store_orders" ADD COLUMN "checkoutId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "store_checkouts_idempotencyKey_key" ON "store_checkouts"("idempotencyKey");
CREATE INDEX "store_checkouts_customerId_idx" ON "store_checkouts"("customerId");
CREATE INDEX "store_orders_checkoutId_idx" ON "store_orders"("checkoutId");

-- AddForeignKey
ALTER TABLE "store_orders" ADD CONSTRAINT "store_orders_checkoutId_fkey" FOREIGN KEY ("checkoutId") REFERENCES "store_checkouts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "store_checkouts" ADD CONSTRAINT "store_checkouts_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterEnum
ALTER TYPE "TransactionSource" ADD VALUE 'STORE_PURCHASE';
