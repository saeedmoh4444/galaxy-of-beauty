-- E6d — trust badges (Tier 2): women-only staff + private suites

ALTER TABLE "services"
    ADD COLUMN "isWomenOnlyStaff" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN "isPrivateSuite" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "vendors"
    ADD COLUMN "womenOnlyStaff" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN "privateSuite" BOOLEAN NOT NULL DEFAULT false;
