-- E4a — period tracking upgrade (symptom logging fix + predictions + pregnancy mode)

ALTER TABLE "cycle_entries"
    ADD COLUMN "flowIntensity" TEXT,
    ADD COLUMN "symptoms" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    ADD COLUMN "temperature" DOUBLE PRECISION,
    ADD COLUMN "beautyNotes" TEXT;

ALTER TABLE "cycle_settings"
    ADD COLUMN "avgCycleLength" INTEGER,
    ADD COLUMN "pregnancyMode" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN "dueDate" TIMESTAMP(3);

CREATE TABLE "cycle_periods" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "length" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cycle_periods_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "cycle_periods_userId_startDate_idx" ON "cycle_periods"("userId", "startDate");

ALTER TABLE "cycle_periods" ADD CONSTRAINT "cycle_periods_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
