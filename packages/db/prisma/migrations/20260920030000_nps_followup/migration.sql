-- 4.3 Customer Feedback Loop — detractor follow-up tracking.
ALTER TABLE "nps_responses" ADD COLUMN "followedUpAt" TIMESTAMP(3);
