-- Referral codes are DERIVED from the referrer (GOB-<name><userId-base36>),
-- so every referral row created from the same referrer's code shares the
-- same code value. The unique constraint made the second referral 500 with
-- P2002 — drop it; the non-unique index remains for lookups.

DROP INDEX IF EXISTS "referrals_referralCode_key";
