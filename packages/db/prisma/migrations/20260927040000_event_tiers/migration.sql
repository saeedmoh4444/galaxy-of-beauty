-- 2.4b — event pricing tiers + online delivery fields.
ALTER TABLE "beauty_events" ADD COLUMN "tier" TEXT NOT NULL DEFAULT 'PAID';
ALTER TABLE "beauty_events" ADD COLUMN "goodieBag" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "beauty_events" ADD COLUMN "meetingProvider" TEXT;
ALTER TABLE "beauty_events" ADD COLUMN "meetingUrl" TEXT;
ALTER TABLE "beauty_events" ADD COLUMN "recordingUrl" TEXT;
