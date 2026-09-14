-- E5 — nail bars (station-capacity slots) + at-home salon assignment

ALTER TABLE "vendors"
    ADD COLUMN "nailBarType" TEXT,
    ADD COLUMN "nailBarCity" TEXT,
    ADD COLUMN "nailBarAddress" TEXT,
    ADD COLUMN "homeCity" TEXT,
    ADD COLUMN "homeAddress" TEXT;

ALTER TABLE "home_service_requests"
    ADD COLUMN "vendorId" INTEGER,
    ADD COLUMN "assignedAt" TIMESTAMP(3);

CREATE INDEX "home_service_requests_vendorId_status_idx" ON "home_service_requests"("vendorId", "status");

CREATE TABLE "nail_bar_slots" (
    "id" SERIAL NOT NULL,
    "nailBarId" INTEGER NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "bookedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "nail_bar_slots_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "nail_bar_slots_nailBarId_startAt_idx" ON "nail_bar_slots"("nailBarId", "startAt");

CREATE TABLE "nail_bar_bookings" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "slotId" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "nail_bar_bookings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "nail_bar_bookings_code_key" ON "nail_bar_bookings"("code");
CREATE UNIQUE INDEX "nail_bar_bookings_slotId_customerId_key" ON "nail_bar_bookings"("slotId", "customerId");
CREATE INDEX "nail_bar_bookings_customerId_idx" ON "nail_bar_bookings"("customerId");

ALTER TABLE "nail_bar_slots" ADD CONSTRAINT "nail_bar_slots_nailBarId_fkey"
    FOREIGN KEY ("nailBarId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "nail_bar_bookings" ADD CONSTRAINT "nail_bar_bookings_slotId_fkey"
    FOREIGN KEY ("slotId") REFERENCES "nail_bar_slots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
