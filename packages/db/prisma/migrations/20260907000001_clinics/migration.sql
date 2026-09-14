-- E2 — medical beauty clinics (first vertical pilot)

-- Vendor gains clinic-specific fields (unified provider model).
ALTER TABLE "vendors"
    ADD COLUMN "clinicType" TEXT,
    ADD COLUMN "licenseAgency" TEXT,
    ADD COLUMN "licenseVerifiedAt" TIMESTAMP(3),
    ADD COLUMN "consultationPrice" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- Clinic-managed consultation slots.
CREATE TABLE "clinic_slots" (
    "id" SERIAL NOT NULL,
    "clinicId" INTEGER NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "isBooked" BOOLEAN NOT NULL DEFAULT false,
    "consultationId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "clinic_slots_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "clinic_slots_clinicId_startAt_idx" ON "clinic_slots"("clinicId", "startAt");

-- Clinic consultations (light parallel booking flow).
CREATE TABLE "clinic_consultations" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "clinicId" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,
    "slotId" INTEGER NOT NULL,
    "treatmentType" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "notes" TEXT,
    "consentAcceptedAt" TIMESTAMP(3),
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "clinic_consultations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "clinic_consultations_code_key" ON "clinic_consultations"("code");
CREATE UNIQUE INDEX "clinic_consultations_slotId_key" ON "clinic_consultations"("slotId");
CREATE INDEX "clinic_consultations_clinicId_status_idx" ON "clinic_consultations"("clinicId", "status");
CREATE INDEX "clinic_consultations_customerId_scheduledAt_idx" ON "clinic_consultations"("customerId", "scheduledAt");

-- 1:1 slot ↔ consultation (slot side FK added after both tables exist).
ALTER TABLE "clinic_slots" ADD CONSTRAINT "clinic_slots_consultationId_fkey"
    FOREIGN KEY ("consultationId") REFERENCES "clinic_consultations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE UNIQUE INDEX "clinic_slots_consultationId_key" ON "clinic_slots"("consultationId");

ALTER TABLE "clinic_consultations" ADD CONSTRAINT "clinic_consultations_clinicId_fkey"
    FOREIGN KEY ("clinicId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "clinic_consultations" ADD CONSTRAINT "clinic_consultations_customerId_fkey"
    FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "clinic_consultations" ADD CONSTRAINT "clinic_consultations_slotId_fkey"
    FOREIGN KEY ("slotId") REFERENCES "clinic_slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "clinic_slots" ADD CONSTRAINT "clinic_slots_clinicId_fkey"
    FOREIGN KEY ("clinicId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Clinic-proposed treatment packages.
ALTER TABLE "beauty_packages" ADD COLUMN "clinicId" INTEGER;
ALTER TABLE "beauty_packages" ADD CONSTRAINT "beauty_packages_clinicId_fkey"
    FOREIGN KEY ("clinicId") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "vendors_type_isVerified_isActive_idx" ON "vendors"("type", "isVerified", "isActive");
