-- D2 (SELLER_FIRST_CLASS_ROLE_PLAN) — seller-initiated payout requests:
-- lifecycle rows separate from the accrued payout rows (money stays in
-- `payouts`; this table records the request + approval/rejection).
CREATE TYPE "PayoutRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE "payout_requests" (
    "id" SERIAL NOT NULL,
    "vendorId" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "PayoutRequestStatus" NOT NULL DEFAULT 'PENDING',
    "idempotencyKey" TEXT NOT NULL,
    "adminNote" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payout_requests_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "payout_requests_idempotencyKey_key" ON "payout_requests"("idempotencyKey");
CREATE INDEX "payout_requests_vendorId_status_idx" ON "payout_requests"("vendorId", "status");

ALTER TABLE "payout_requests" ADD CONSTRAINT "payout_requests_vendorId_fkey"
  FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
