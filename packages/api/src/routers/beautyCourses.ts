import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, publicProcedure, router } from '../trpc';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

function formatCourse(c: any) {
  const titleJson = c.titleJson as Record<string, string> | undefined;
  const descJson = c.descJson as Record<string, string> | undefined;
  const enrollmentCount = Array.isArray(c.enrollments)
    ? c.enrollments.length
    : (c._count?.enrollments ?? 0);
  return {
    id: c.id,
    titleAr: titleJson?.ar ?? '',
    titleEn: titleJson?.en ?? '',
    descAr: descJson?.ar ?? '',
    descEn: descJson?.en ?? '',
    instructor: c.instructor,
    lessons: c.lessons,
    duration: c.duration,
    level: c.level,
    category: c.category,
    emoji: c.emoji,
    rating: c.rating,
    enrolledCount: enrollmentCount,
  };
}

export const beautyCoursesRouter = router({
  list: publicProcedure.query(async () => {
    const courses = await db.beautyCourse.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { enrollments: true } } },
    });
    return courses.map(formatCourse);
  }),

  get: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const course = await db.beautyCourse.findUnique({
      where: { id: input.id },
      include: { _count: { select: { enrollments: true } } },
    });
    if (!course) throw new Error('الدورة غير موجودة');
    return formatCourse(course);
  }),

  enroll: customerProcedure
    .input(z.object({ courseId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await db.courseEnrollment.findUnique({
        where: { userId_courseId: { userId: ctx.user.id, courseId: input.courseId } },
      });
      if (existing)
        return {
          enrollmentId: `ENR-${ctx.user.id}-${input.courseId}`,
          courseId: input.courseId,
          status: existing.status,
          progress: existing.progress,
        };
      const enrollment = await db.courseEnrollment.create({
        data: { userId: ctx.user.id, courseId: input.courseId },
      });
      return {
        enrollmentId: `ENR-${ctx.user.id}-${input.courseId}`,
        courseId: input.courseId,
        status: enrollment.status,
        progress: enrollment.progress,
      };
    }),

  myCourses: customerProcedure.query(async ({ ctx }) => {
    const enrollments = await db.courseEnrollment.findMany({
      where: { userId: ctx.user.id },
      include: { course: { include: { _count: { select: { enrollments: true } } } } },
      orderBy: { enrolledAt: 'desc' },
    });
    return enrollments.map((e: any) => ({
      enrollmentId: `ENR-${e.userId}-${e.courseId}`,
      courseId: e.courseId,
      status: e.status,
      progress: e.progress,
      enrolledAt: e.enrolledAt,
      course: formatCourse(e.course),
    }));
  }),
});
