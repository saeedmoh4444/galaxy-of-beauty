-- C3 (Tier 3 #8): attach a persisted BnplPlan to a savings goal
ALTER TABLE "savings_goals" ADD COLUMN "bnplPlanId" integer;
CREATE INDEX "savings_goals_bnplPlanId_idx" ON "savings_goals"("bnplPlanId");
