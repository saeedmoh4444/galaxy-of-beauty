-- F5 — richer technician profile details.
ALTER TABLE "technicians" ADD COLUMN "socialLinksJson" JSONB;
ALTER TABLE "technicians" ADD COLUMN "languages" JSONB;
ALTER TABLE "technicians" ADD COLUMN "certificationsJson" JSONB;
ALTER TABLE "technicians" ADD COLUMN "yearsOfExperience" INTEGER;
