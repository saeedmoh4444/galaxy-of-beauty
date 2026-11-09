-- D2 (PLATFORM_IMPROVEMENT_PLAN) — facade→service mapping for the
-- women's catalog: one row per (category, facade item), pointing at the
-- real seeded Service that carries its bookings.
CREATE TABLE "womens_service_mappings" (
    "categoryKey" TEXT NOT NULL,
    "facadeId" TEXT NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "womens_service_mappings_pkey" PRIMARY KEY ("categoryKey","facadeId")
);

CREATE INDEX "womens_service_mappings_serviceId_idx" ON "womens_service_mappings"("serviceId");

ALTER TABLE "womens_service_mappings" ADD CONSTRAINT "womens_service_mappings_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
