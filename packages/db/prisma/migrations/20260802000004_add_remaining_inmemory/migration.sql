-- CreateTable
CREATE TABLE "community_looks" (
    "id" SERIAL NOT NULL,
    "userName" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL,
    "technicianName" TEXT NOT NULL,
    "votes" INTEGER NOT NULL DEFAULT 0,
    "category" TEXT NOT NULL DEFAULT 'makeup',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_looks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compare_products" (
    "id" SERIAL NOT NULL,
    "nameJson" JSONB NOT NULL,
    "brand" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "category" TEXT NOT NULL DEFAULT 'skincare',
    "emoji" TEXT NOT NULL DEFAULT '🧴',
    "features" JSONB NOT NULL,
    "ingredients" INTEGER NOT NULL DEFAULT 0,
    "crueltyFree" BOOLEAN NOT NULL DEFAULT false,
    "vegan" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compare_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matchmaker_questions" (
    "id" SERIAL NOT NULL,
    "questionKey" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "matchmaker_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matchmaker_services" (
    "id" SERIAL NOT NULL,
    "nameAr" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '💅',
    "price" DOUBLE PRECISION NOT NULL,
    "tags" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "matchmaker_services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "matchmaker_questions_questionKey_key" ON "matchmaker_questions"("questionKey");

