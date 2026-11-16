-- W5-6d — consolidate TechnicianRating into Review (both were
-- bookingId-unique post-booking ratings).

ALTER TABLE "reviews"
  ADD COLUMN "skill" INTEGER,
  ADD COLUMN "punctuality" INTEGER,
  ADD COLUMN "cleanliness" INTEGER,
  ADD COLUMN "communication" INTEGER;

-- Migrate legacy rows (dedupe by bookingId — keep the legacy row when the
-- booking has no review yet).
INSERT INTO "reviews"
  ("bookingId", "customerId", "rating", "skill", "punctuality", "cleanliness",
   "communication", "comment", "isVisible", "createdAt", "updatedAt")
SELECT
  t."bookingId", t."userId", t."overall", t."skill", t."punctuality",
  t."cleanliness", t."communication", t."comment", TRUE, t."createdAt", t."createdAt"
FROM "technician_ratings" t
WHERE NOT EXISTS (SELECT 1 FROM "reviews" r WHERE r."bookingId" = t."bookingId");
