-- ENHANCEMENT_PLAN quick win #6 — NPS post-booking survey.
CREATE TABLE "nps_responses" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "bookingId" INTEGER,
    "score" INTEGER NOT NULL,
    "comment" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "nps_responses_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "nps_responses_bookingId_key" ON "nps_responses"("bookingId");
CREATE INDEX "nps_responses_userId_createdAt_idx" ON "nps_responses"("userId", "createdAt");
ALTER TABLE "nps_responses" ADD CONSTRAINT "nps_responses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
