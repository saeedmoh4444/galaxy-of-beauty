-- E7 — beauty media layer (persisted shorts: reels + before/after)

CREATE TABLE "shorts" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'reel',
    "technicianId" INTEGER,
    "titleJson" JSONB NOT NULL,
    "videoUrl" TEXT,
    "thumbnailUrl" TEXT,
    "beforeImageUrl" TEXT,
    "durationSec" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "category" TEXT NOT NULL DEFAULT 'general',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "faceBlurred" BOOLEAN NOT NULL DEFAULT false,
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "shorts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "shorts_isApproved_isActive_idx" ON "shorts"("isApproved", "isActive");
CREATE INDEX "shorts_technicianId_idx" ON "shorts"("technicianId");
