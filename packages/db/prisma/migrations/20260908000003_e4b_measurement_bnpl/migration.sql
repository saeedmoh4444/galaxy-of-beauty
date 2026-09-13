-- E4b — measurement history + persisted BNPL installment plans

CREATE TABLE "measurement_logs" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "weightKg" DOUBLE PRECISION,
    "waistCm" DOUBLE PRECISION,
    "hipCm" DOUBLE PRECISION,
    "bustCm" DOUBLE PRECISION,
    "thighCm" DOUBLE PRECISION,
    "bodyFatPct" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "measurement_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "measurement_logs_userId_createdAt_idx" ON "measurement_logs"("userId", "createdAt");

CREATE TABLE "bnpl_plans" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "provider" TEXT NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "installments" INTEGER NOT NULL,
    "monthlyPayment" DECIMAL(10,2) NOT NULL,
    "paidCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "schedule" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "bnpl_plans_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "bnpl_plans_userId_status_idx" ON "bnpl_plans"("userId", "status");
