-- 8.1b — referral UTM attribution.
ALTER TABLE "referrals" ADD COLUMN "utmSource" TEXT;
ALTER TABLE "referrals" ADD COLUMN "utmMedium" TEXT;
ALTER TABLE "referrals" ADD COLUMN "utmCampaign" TEXT;
ALTER TABLE "referrals" ADD COLUMN "utmContent" TEXT;
