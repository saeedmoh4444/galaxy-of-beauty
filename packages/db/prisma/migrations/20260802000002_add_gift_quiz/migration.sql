-- CreateTable
CREATE TABLE "gift_quiz_questions" (
    "id" SERIAL NOT NULL,
    "questionKey" TEXT NOT NULL,
    "questionJson" JSONB NOT NULL,
    "options" JSONB NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gift_quiz_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gift_quiz_recommendations" (
    "id" SERIAL NOT NULL,
    "nameJson" JSONB NOT NULL,
    "descJson" JSONB,
    "price" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '🎁',
    "tags" JSONB NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gift_quiz_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "gift_quiz_questions_questionKey_key" ON "gift_quiz_questions"("questionKey");

