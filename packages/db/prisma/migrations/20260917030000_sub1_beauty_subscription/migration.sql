-- 2.2 Beauty Subscription (ENHANCEMENT_PLAN) — SUB-1: plan perks +
-- auto-renewal support. YEARLY is a plain-string interval value (the
-- interval column is TEXT), so no enum migration is needed.
ALTER TABLE "subscription_plans" ADD COLUMN "priorityBooking" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "subscription_plans" ADD COLUMN "freeHomeService" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "subscription_plans" ADD COLUMN "dedicatedTechnician" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "customer_subscriptions" ADD COLUMN "autoRenew" BOOLEAN NOT NULL DEFAULT true;
CREATE INDEX "customer_subscriptions_status_currentPeriodEnd_idx" ON "customer_subscriptions"("status", "currentPeriodEnd");
