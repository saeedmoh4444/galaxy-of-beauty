-- 3.1 Beauty DNA Phase 2 — ongoing learning storage.
-- preferences: service categories from completed bookings (most recent
-- last); colorPalette: filled later by the AI color-match phase.
ALTER TABLE "beauty_profiles" ADD COLUMN "preferences" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "beauty_profiles" ADD COLUMN "colorPalette" TEXT[] NOT NULL DEFAULT '{}';
