-- B.6 provider-proposed beauty packages: approval status on packages
ALTER TABLE "beauty_packages" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'APPROVED';
ALTER TABLE "beauty_packages" ADD COLUMN "createdByUserId" INTEGER;
ALTER TABLE "beauty_packages" ADD COLUMN "reviewNotes" TEXT;
ALTER TABLE "beauty_packages" ADD COLUMN "reviewedBy" INTEGER;
ALTER TABLE "beauty_packages" ADD COLUMN "reviewedAt" TIMESTAMP(3);
CREATE INDEX "beauty_packages_status_isActive_idx" ON "beauty_packages"("status", "isActive");

-- Generic provider submission review queue (B.6 packages, B.7 promotions, vendor products)
CREATE TABLE "provider_submissions" (
    "id" SERIAL NOT NULL,
    "providerId" INTEGER NOT NULL,
    "kind" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
    "payload" JSONB NOT NULL,
    "reviewNotes" TEXT,
    "reviewedBy" INTEGER,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_submissions_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "provider_submissions_kind_status_idx" ON "provider_submissions"("kind", "status");
CREATE INDEX "provider_submissions_providerId_createdAt_idx" ON "provider_submissions"("providerId", "createdAt");
