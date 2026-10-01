-- AlterTable: disputes now cover store orders too (stage 12 — store settlement)
ALTER TABLE "disputes" ALTER COLUMN "bookingId" DROP NOT NULL;

ALTER TABLE "disputes" ADD COLUMN "storeOrderId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "disputes_storeOrderId_key" ON "disputes"("storeOrderId");

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_storeOrderId_fkey" FOREIGN KEY ("storeOrderId") REFERENCES "store_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
