-- E6c — menopause/perimenopause mode (settings flags + symptom log)

ALTER TABLE "cycle_settings"
    ADD COLUMN "menopauseMode" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN "lastPeriodAt" TIMESTAMP(3);

CREATE TABLE "menopause_logs" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "symptom" TEXT NOT NULL,
    "severity" INTEGER NOT NULL DEFAULT 2,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "menopause_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "menopause_logs_userId_createdAt_idx" ON "menopause_logs"("userId", "createdAt");
