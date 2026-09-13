-- Store plan Phase 3: payouts gain a store dimension.
-- technicianId becomes nullable (null for store payouts); vendorId added.
ALTER TABLE "payouts" ALTER COLUMN "technicianId" DROP NOT NULL;
ALTER TABLE "payouts" ADD COLUMN "vendorId" INTEGER;
CREATE INDEX "payouts_vendorId_status_idx" ON "payouts"("vendorId", "status");
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
