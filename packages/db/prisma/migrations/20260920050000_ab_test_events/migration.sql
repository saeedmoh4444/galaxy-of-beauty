-- 4.2 A/B testing — event tracking.
CREATE TABLE "ab_test_events" (
    "id" SERIAL NOT NULL,
    "testKey" TEXT NOT NULL,
    "variant" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ab_test_events_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ab_test_events_testKey_variant_eventType_idx" ON "ab_test_events"("testKey", "variant", "eventType");
