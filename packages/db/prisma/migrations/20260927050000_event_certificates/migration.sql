-- 2.4c — certificates of completion for professional events.
CREATE TABLE "event_certificates" (
    "id" SERIAL NOT NULL,
    "registrationId" INTEGER NOT NULL,
    "certificateNumber" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "event_certificates_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "event_certificates_registrationId_key" ON "event_certificates"("registrationId");
CREATE UNIQUE INDEX "event_certificates_certificateNumber_key" ON "event_certificates"("certificateNumber");
ALTER TABLE "event_certificates" ADD CONSTRAINT "event_certificates_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "event_registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
