-- K4 (kids plan): hourly babysitting services + family-member safety fields
ALTER TABLE "services" ADD COLUMN "isHourly" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "family_members" ADD COLUMN "emergencyContact" TEXT;
ALTER TABLE "family_members" ADD COLUMN "allergies" TEXT;
