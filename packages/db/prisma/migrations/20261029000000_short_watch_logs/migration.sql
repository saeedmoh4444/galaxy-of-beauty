-- P2 — watch analytics (REELS_SHOPPABLE_PLAN Phase 2). One row per
-- watch event; seconds are clamped to the reel duration at write time.
CREATE TABLE "short_watch_logs" (
    "id" SERIAL NOT NULL,
    "shortId" INTEGER NOT NULL,
    "userId" INTEGER,
    "seconds" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "short_watch_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "short_watch_logs_shortId_createdAt_idx" ON "short_watch_logs"("shortId", "createdAt");

ALTER TABLE "short_watch_logs" ADD CONSTRAINT "short_watch_logs_shortId_fkey" FOREIGN KEY ("shortId") REFERENCES "shorts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "short_watch_logs" ADD CONSTRAINT "short_watch_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
