-- 8.1a — monthly referral prizes.
CREATE TABLE "referral_prizes" (
    "id" SERIAL NOT NULL,
    "month" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "winnerId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "creditedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "referral_prizes_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "referral_prizes_month_rank_key" ON "referral_prizes"("month", "rank");
CREATE INDEX "referral_prizes_winnerId_idx" ON "referral_prizes"("winnerId");
ALTER TABLE "referral_prizes" ADD CONSTRAINT "referral_prizes_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
