-- CreateTable
CREATE TABLE "group_buy_deals" (
    "id" SERIAL NOT NULL,
    "service" TEXT NOT NULL,
    "originalPrice" DOUBLE PRECISION NOT NULL,
    "groupPrice" DOUBLE PRECISION NOT NULL,
    "minBuyers" INTEGER NOT NULL DEFAULT 3,
    "currentBuyers" INTEGER NOT NULL DEFAULT 0,
    "endsIn" TEXT NOT NULL DEFAULT '٣ أيام',
    "emoji" TEXT NOT NULL DEFAULT '💄',
    "savings" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "group_buy_deals_pkey" PRIMARY KEY ("id")
);

