-- 8.1c — influencer program.
CREATE TABLE "influencers" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "socialHandle" TEXT,
    "commissionRate" DECIMAL(5,2) NOT NULL DEFAULT 10,
    "userId" INTEGER,
    "totalBookings" INTEGER NOT NULL DEFAULT 0,
    "totalCommission" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "influencers_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "influencers_code_key" ON "influencers"("code");
CREATE INDEX "influencers_userId_idx" ON "influencers"("userId");
ALTER TABLE "influencers" ADD CONSTRAINT "influencers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "bookings" ADD COLUMN "influencerCode" TEXT;
ALTER TYPE "TransactionSource" ADD VALUE 'INFLUENCER_COMMISSION';
