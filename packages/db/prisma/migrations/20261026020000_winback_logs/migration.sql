-- B4 — win-back toolkit (VENDOR_PROFESSIONALIZATION_PLAN Wave B).
-- The per-(vendor, customer) send ledger enforcing the 14-day
-- rate limit on vendor win-back notifications.

-- CreateTable
CREATE TABLE "winback_logs" (
    "id" SERIAL NOT NULL,
    "vendorId" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,
    "template" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "winback_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "winback_logs_vendorId_customerId_createdAt_idx" ON "winback_logs"("vendorId", "customerId", "createdAt");
CREATE INDEX "winback_logs_customerId_createdAt_idx" ON "winback_logs"("customerId", "createdAt");

-- AddForeignKey
ALTER TABLE "winback_logs" ADD CONSTRAINT "winback_logs_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "winback_logs" ADD CONSTRAINT "winback_logs_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
