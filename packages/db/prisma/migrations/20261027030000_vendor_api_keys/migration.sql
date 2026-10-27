-- D1 — vendor API keys (PROFESSIONALIZATION Wave D): the enterprise
-- integration surface. Only the sha256 hash is stored.

CREATE TABLE "vendor_api_keys" (
    "id" SERIAL NOT NULL,
    "vendorId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_api_keys_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "vendor_api_keys_keyHash_key" ON "vendor_api_keys"("keyHash");
CREATE INDEX "vendor_api_keys_vendorId_revokedAt_idx" ON "vendor_api_keys"("vendorId", "revokedAt");

ALTER TABLE "vendor_api_keys" ADD CONSTRAINT "vendor_api_keys_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
