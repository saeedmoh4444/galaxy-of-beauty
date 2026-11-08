-- A2 (PLATFORM_IMPROVEMENT_PLAN) — unified moderation core: one report
-- per reporter per target across every UGC surface except shorts (which
-- keep their dedicated short_reports flow). status/action/handledBy turn
-- reports into an admin workflow; hidden flags on the flagless surfaces
-- let moderation act without deleting data.
CREATE TABLE "content_reports" (
    "id" SERIAL NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" INTEGER NOT NULL,
    "reporterId" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "note" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "action" TEXT,
    "autoAction" BOOLEAN NOT NULL DEFAULT false,
    "handledById" INTEGER,
    "handledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_reports_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "content_reports_targetType_targetId_reporterId_key" ON "content_reports"("targetType", "targetId", "reporterId");
CREATE INDEX "content_reports_status_createdAt_idx" ON "content_reports"("status", "createdAt");

ALTER TABLE "content_reports" ADD CONSTRAINT "content_reports_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "content_reports" ADD CONSTRAINT "content_reports_handledById_fkey" FOREIGN KEY ("handledById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "community_posts" ADD COLUMN "isHidden" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "community_comments" ADD COLUMN "isHidden" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "beauty_post_comments" ADD COLUMN "isHidden" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "product_reviews" ADD COLUMN "isHidden" BOOLEAN NOT NULL DEFAULT false;

-- B4 — the community feed query filters isHidden and orders by createdAt.
CREATE INDEX "community_posts_isHidden_createdAt_idx" ON "community_posts"("isHidden", "createdAt");
