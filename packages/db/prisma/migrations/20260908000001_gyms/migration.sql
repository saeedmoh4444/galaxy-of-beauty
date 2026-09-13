-- E3 — fitness vertical (gyms + trainers)

-- Vendor gains gym-specific fields (unified provider model).
ALTER TABLE "vendors"
    ADD COLUMN "gymType" TEXT,
    ADD COLUMN "gymCity" TEXT,
    ADD COLUMN "gymAddress" TEXT;

-- Gym classes (capacity-based bookings).
CREATE TABLE "gym_classes" (
    "id" SERIAL NOT NULL,
    "gymId" INTEGER NOT NULL,
    "nameJson" JSONB NOT NULL,
    "descriptionJson" JSONB,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "capacity" INTEGER NOT NULL,
    "enrolledCount" INTEGER NOT NULL DEFAULT 0,
    "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "gym_classes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "gym_classes_gymId_startsAt_idx" ON "gym_classes"("gymId", "startsAt");

-- Per-member class bookings (one per customer per class).
CREATE TABLE "gym_class_bookings" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "classId" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'BOOKED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelledAt" TIMESTAMP(3),
    CONSTRAINT "gym_class_bookings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "gym_class_bookings_code_key" ON "gym_class_bookings"("code");
CREATE UNIQUE INDEX "gym_class_bookings_classId_customerId_key" ON "gym_class_bookings"("classId", "customerId");
CREATE INDEX "gym_class_bookings_classId_status_idx" ON "gym_class_bookings"("classId", "status");
CREATE INDEX "gym_class_bookings_customerId_idx" ON "gym_class_bookings"("customerId");

ALTER TABLE "gym_classes" ADD CONSTRAINT "gym_classes_gymId_fkey"
    FOREIGN KEY ("gymId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "gym_class_bookings" ADD CONSTRAINT "gym_class_bookings_classId_fkey"
    FOREIGN KEY ("classId") REFERENCES "gym_classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "gym_class_bookings" ADD CONSTRAINT "gym_class_bookings_customerId_fkey"
    FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Gym-scoped membership plans + day passes.
ALTER TABLE "subscription_plans" ADD COLUMN "gymId" INTEGER;
ALTER TABLE "subscription_plans" ADD CONSTRAINT "subscription_plans_gymId_fkey"
    FOREIGN KEY ("gymId") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "class_passes" ADD COLUMN "gymId" INTEGER;
ALTER TABLE "class_passes" ADD CONSTRAINT "class_passes_gymId_fkey"
    FOREIGN KEY ("gymId") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Fitness data on the beauty profile (trainer recommendations input).
ALTER TABLE "beauty_profiles" ADD COLUMN "measurements" JSONB,
    ADD COLUMN "fitnessGoals" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
