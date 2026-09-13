-- E6b — postpartum care (baby-friendly at-home salons)

ALTER TABLE "vendors"
    ADD COLUMN "babyFriendly" BOOLEAN NOT NULL DEFAULT false;
