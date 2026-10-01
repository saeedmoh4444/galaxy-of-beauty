CREATE TABLE "flash_deal_claims" (
    "id" SERIAL NOT NULL,
    "dealId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flash_deal_claims_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "flash_deal_claims_dealId_userId_key" UNIQUE ("dealId", "userId")
);

CREATE INDEX "flash_deal_claims_userId_idx" ON "flash_deal_claims"("userId");

ALTER TABLE "flash_deal_claims" ADD CONSTRAINT "flash_deal_claims_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "flash_deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
