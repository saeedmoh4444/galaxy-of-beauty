-- Store plan Phase 4: denormalized store rating (aggregate of product reviews)
ALTER TABLE "vendors" ADD COLUMN "ratingAvg" DECIMAL(3,2) NOT NULL DEFAULT 0;
ALTER TABLE "vendors" ADD COLUMN "totalReviews" INTEGER NOT NULL DEFAULT 0;
