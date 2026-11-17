-- W5-2 — one referral relationship per (referrer, referred) pair.
-- Defensive dedupe (keep the oldest row) for DBs that already hold
-- duplicates from the unguarded applyCode era.
DELETE FROM "referrals" a USING "referrals" b
  WHERE a.id > b.id
    AND a."referrerId" = b."referrerId"
    AND a."referredId" = b."referredId";

CREATE UNIQUE INDEX "referrals_referrerId_referredId_key"
  ON "referrals"("referrerId", "referredId");
