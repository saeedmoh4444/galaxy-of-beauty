-- R6 — moderation reports (REELS_SHOPPABLE_PLAN). One report per user
-- per short; three distinct reports auto-hide the short pending review.
CREATE TABLE "short_reports" (
    "id" SERIAL NOT NULL,
    "shortId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "short_reports_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "short_reports_shortId_userId_key" ON "short_reports"("shortId", "userId");
CREATE INDEX "short_reports_shortId_idx" ON "short_reports"("shortId");

ALTER TABLE "short_reports" ADD CONSTRAINT "short_reports_shortId_fkey" FOREIGN KEY ("shortId") REFERENCES "shorts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "short_reports" ADD CONSTRAINT "short_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
