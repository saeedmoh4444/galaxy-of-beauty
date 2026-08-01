-- CreateTable
CREATE TABLE "beauty_reminders" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'other',
    "intervalDays" INTEGER NOT NULL DEFAULT 30,
    "nextDate" TIMESTAMP(3) NOT NULL,
    "lastCompletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beauty_reminders_pkey" PRIMARY KEY ("id")
);

