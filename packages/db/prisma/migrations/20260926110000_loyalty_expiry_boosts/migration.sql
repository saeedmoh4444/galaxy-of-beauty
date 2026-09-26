-- 8.2 Loyalty 2.0 — points expiry + boost events.
ALTER TABLE "loyalty_transactions" ADD COLUMN "expiresAt" TIMESTAMP(3);
CREATE TABLE "loyalty_boosts" (
    "id" SERIAL NOT NULL,
    "nameJson" JSONB NOT NULL,
    "multiplier" DECIMAL(4,2) NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "loyalty_boosts_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "loyalty_boosts_isActive_startsAt_endsAt_idx" ON "loyalty_boosts"("isActive", "startsAt", "endsAt");
