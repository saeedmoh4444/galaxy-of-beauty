-- 1.2 Service Bundles — booking link + execution snapshot.
ALTER TABLE "bookings" ADD COLUMN "beautyBundleId" INTEGER;
ALTER TABLE "bookings" ADD COLUMN "beautyBundleJson" JSONB;
CREATE INDEX "bookings_beautyBundleId_idx" ON "bookings"("beautyBundleId");
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_beautyBundleId_fkey" FOREIGN KEY ("beautyBundleId") REFERENCES "beauty_bundles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
