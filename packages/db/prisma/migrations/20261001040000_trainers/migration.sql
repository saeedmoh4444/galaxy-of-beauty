-- E3 — TRAINER vertical (stage 12): vendor trainer fields + 1:1 sessions.

-- AlterTable: trainer-specific vendor fields (unified provider model).
ALTER TABLE "vendors" ADD COLUMN "trainerSpecialty" TEXT;
ALTER TABLE "vendors" ADD COLUMN "trainerCity" TEXT;
ALTER TABLE "vendors" ADD COLUMN "trainerAddress" TEXT;
ALTER TABLE "vendors" ADD COLUMN "trainerBio" JSONB;
ALTER TABLE "vendors" ADD COLUMN "trainerSessionPrice" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "trainer_sessions" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "trainerId" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,
    "specialty" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "durationMin" INTEGER NOT NULL DEFAULT 60,
    "isHomeVisit" BOOLEAN NOT NULL DEFAULT false,
    "address" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trainer_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "trainer_sessions_code_key" ON "trainer_sessions"("code");
CREATE INDEX "trainer_sessions_trainerId_status_idx" ON "trainer_sessions"("trainerId", "status");
CREATE INDEX "trainer_sessions_customerId_scheduledAt_idx" ON "trainer_sessions"("customerId", "scheduledAt");

-- AddForeignKey
ALTER TABLE "trainer_sessions" ADD CONSTRAINT "trainer_sessions_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "trainer_sessions" ADD CONSTRAINT "trainer_sessions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
