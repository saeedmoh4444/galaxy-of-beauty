-- CreateTable
CREATE TABLE "corporate_plans" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "nameJson" JSONB NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "employees" INTEGER NOT NULL,
    "services" JSONB NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '🌱',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "corporate_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corporate_enquiries" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "corporate_enquiries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "corporate_plans_key_key" ON "corporate_plans"("key");

