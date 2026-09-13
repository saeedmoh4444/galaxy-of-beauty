-- CreateTable
CREATE TABLE "beauty_courses" (
    "id" SERIAL NOT NULL,
    "titleJson" JSONB NOT NULL,
    "descJson" JSONB,
    "instructor" TEXT NOT NULL,
    "lessons" INTEGER NOT NULL DEFAULT 1,
    "duration" TEXT NOT NULL DEFAULT '1 ساعة',
    "level" TEXT NOT NULL DEFAULT 'beginner',
    "category" TEXT NOT NULL DEFAULT 'skincare',
    "emoji" TEXT NOT NULL DEFAULT '📚',
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beauty_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_enrollments" (
    "id" SERIAL NOT NULL,
    "courseId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ENROLLED',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "course_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "course_enrollments_userId_courseId_key" ON "course_enrollments"("userId", "courseId");

-- AddForeignKey
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "beauty_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

