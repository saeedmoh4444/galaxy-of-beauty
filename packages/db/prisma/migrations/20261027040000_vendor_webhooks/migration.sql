-- D1b — vendor webhooks (PROFESSIONALIZATION Wave D): HMAC-signed POSTs
-- for order.placed / order.fulfilled / stock.low.

CREATE TABLE "vendor_webhooks" (
    "id" SERIAL NOT NULL,
    "vendorId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "events" TEXT[] NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_webhooks_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "vendor_webhooks_vendorId_isActive_idx" ON "vendor_webhooks"("vendorId", "isActive");

ALTER TABLE "vendor_webhooks" ADD CONSTRAINT "vendor_webhooks_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
