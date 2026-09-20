-- 6.2 PDPL — consent management records.
CREATE TABLE "consent_records" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "consent_records_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "consent_records_userId_type_key" ON "consent_records"("userId", "type");
CREATE INDEX "consent_records_userId_idx" ON "consent_records"("userId");
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
