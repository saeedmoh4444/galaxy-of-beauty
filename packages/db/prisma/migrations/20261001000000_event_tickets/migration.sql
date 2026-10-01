-- CreateTable
CREATE TABLE "event_tickets" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "attendeeName" TEXT NOT NULL,
    "notes" VARCHAR(500),
    "status" TEXT NOT NULL DEFAULT 'RESERVED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "event_tickets_userId_idx" ON "event_tickets"("userId");

-- CreateIndex
CREATE INDEX "event_tickets_eventId_idx" ON "event_tickets"("eventId");

-- AddForeignKey
ALTER TABLE "event_tickets" ADD CONSTRAINT "event_tickets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_tickets" ADD CONSTRAINT "event_tickets_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "beauty_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
