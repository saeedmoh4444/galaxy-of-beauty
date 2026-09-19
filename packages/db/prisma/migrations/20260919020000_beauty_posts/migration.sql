-- 2.5 Social Commerce — shoppable beauty posts (BeautyPost + likes +
-- comments + engagement events). Instant publish (isApproved default true);
-- featured = admin-curated homepage row; likes denormalized (Community
-- pattern); engagement rows feed the analytics story.
CREATE TABLE "beauty_posts" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT,
    "tagsJson" JSONB,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "isApproved" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "beauty_posts_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "beauty_posts_isApproved_createdAt_idx" ON "beauty_posts"("isApproved", "createdAt");
CREATE INDEX "beauty_posts_featured_createdAt_idx" ON "beauty_posts"("featured", "createdAt");
ALTER TABLE "beauty_posts" ADD CONSTRAINT "beauty_posts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "beauty_post_likes" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "beauty_post_likes_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "beauty_post_likes_postId_userId_key" ON "beauty_post_likes"("postId", "userId");
ALTER TABLE "beauty_post_likes" ADD CONSTRAINT "beauty_post_likes_postId_fkey" FOREIGN KEY ("postId") REFERENCES "beauty_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "beauty_post_likes" ADD CONSTRAINT "beauty_post_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "beauty_post_comments" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "content" VARCHAR(500) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "beauty_post_comments_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "beauty_post_comments_postId_createdAt_idx" ON "beauty_post_comments"("postId", "createdAt");
ALTER TABLE "beauty_post_comments" ADD CONSTRAINT "beauty_post_comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "beauty_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "beauty_post_comments" ADD CONSTRAINT "beauty_post_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "beauty_post_engagements" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "userId" INTEGER,
    "kind" TEXT NOT NULL,
    "targetId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "beauty_post_engagements_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "beauty_post_engagements_postId_kind_idx" ON "beauty_post_engagements"("postId", "kind");
CREATE INDEX "beauty_post_engagements_kind_createdAt_idx" ON "beauty_post_engagements"("kind", "createdAt");
ALTER TABLE "beauty_post_engagements" ADD CONSTRAINT "beauty_post_engagements_postId_fkey" FOREIGN KEY ("postId") REFERENCES "beauty_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "beauty_post_engagements" ADD CONSTRAINT "beauty_post_engagements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
