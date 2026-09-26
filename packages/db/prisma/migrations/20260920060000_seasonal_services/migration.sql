-- 1.4 Seasonal & Event Services.
CREATE TABLE "seasonal_services" (
    "id" SERIAL NOT NULL,
    "nameJson" JSONB NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "season" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "pricePremium" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "seasonal_services_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "seasonal_services_season_startDate_endDate_idx" ON "seasonal_services"("season", "startDate", "endDate");
ALTER TABLE "seasonal_services" ADD CONSTRAINT "seasonal_services_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
