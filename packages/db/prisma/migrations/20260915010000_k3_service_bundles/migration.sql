-- K3 (kids plan): Mommy & Me bundles — bundle table + booking link
CREATE TABLE "service_bundles" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "nameJson" JSONB NOT NULL,
    "descriptionJson" JSONB NOT NULL,
    "bundlePrice" DECIMAL(10,2) NOT NULL,
    "isMommyAndMe" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "primaryServiceId" INTEGER NOT NULL,
    "childServiceId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_bundles_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "service_bundles_primaryServiceId_fkey" FOREIGN KEY ("primaryServiceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "service_bundles_childServiceId_fkey" FOREIGN KEY ("childServiceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "service_bundles_slug_key" ON "service_bundles"("slug");
CREATE INDEX "service_bundles_isActive_sortOrder_idx" ON "service_bundles"("isActive", "sortOrder");

ALTER TABLE "bookings" ADD COLUMN "bundleId" integer;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_bundleId_fkey"
  FOREIGN KEY ("bundleId") REFERENCES "service_bundles"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "bookings_bundleId_idx" ON "bookings"("bundleId");
