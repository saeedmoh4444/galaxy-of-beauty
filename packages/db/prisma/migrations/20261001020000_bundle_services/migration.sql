-- CreateTable
CREATE TABLE "bundle_services" (
    "id" SERIAL NOT NULL,
    "bundleId" INTEGER NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "bundle_services_pkey" PRIMARY KEY ("id")
);

-- Backfill from the legacy Int[] column, preserving array order
INSERT INTO "bundle_services" ("bundleId", "serviceId", "sortOrder")
SELECT id, svc, ord - 1
FROM beauty_bundles, unnest("serviceIds") WITH ORDINALITY AS t(svc, ord);

-- CreateIndex
CREATE UNIQUE INDEX "bundle_services_bundleId_serviceId_key" ON "bundle_services"("bundleId", "serviceId");
CREATE INDEX "bundle_services_bundleId_idx" ON "bundle_services"("bundleId");

-- AddForeignKey
ALTER TABLE "bundle_services" ADD CONSTRAINT "bundle_services_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "beauty_bundles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropIndex / legacy column
ALTER TABLE "beauty_bundles" DROP COLUMN "serviceIds";
