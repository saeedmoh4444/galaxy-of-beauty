-- F5 — post-fulfillment review requests (VENDOR_DASHBOARD_ENHANCEMENT_PLAN
-- Wave 6). Cooldown marker: one request per customer-product pair ever;
-- the ProductReview itself suppresses the request at emission time.

-- CreateTable
CREATE TABLE "review_requests" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "review_requests_customerId_productId_key" ON "review_requests"("customerId", "productId");
CREATE INDEX "review_requests_productId_idx" ON "review_requests"("productId");

-- AddForeignKey
ALTER TABLE "review_requests" ADD CONSTRAINT "review_requests_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "review_requests" ADD CONSTRAINT "review_requests_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
