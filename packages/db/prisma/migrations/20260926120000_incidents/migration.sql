-- 7.3 Observability 2.0 — incidents for the public status page.
CREATE TABLE "incidents" (
    "id" SERIAL NOT NULL,
    "titleJson" JSONB NOT NULL,
    "descriptionJson" JSONB,
    "severity" TEXT NOT NULL DEFAULT 'minor',
    "status" TEXT NOT NULL DEFAULT 'open',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "incidents_status_startedAt_idx" ON "incidents"("status", "startedAt");
