import { z } from 'zod';
import { customerProcedure, publicProcedure, router } from '../trpc';

const COURSES = [
  { id: 1, titleAr: 'أساسيات المكياج الاحترافي', titleEn: 'Professional Makeup Basics', descAr: 'تعلمي أساسيات المكياج من الصفر', descEn: 'Learn makeup fundamentals from scratch', instructor: 'نورة العمري', lessons: 8, duration: '٤ ساعات', level: 'beginner', category: 'makeup', emoji: '💄', enrolledCount: 1250, rating: 4.8 },
  { id: 2, titleAr: 'فن العناية بالبشرة', titleEn: 'Art of Skincare', descAr: 'روتين متكامل للعناية بكل أنواع البشرة', descEn: 'Complete skincare routine for all skin types', instructor: 'د. ليلى القحطاني', lessons: 6, duration: '٣ ساعات', level: 'beginner', category: 'skincare', emoji: '✨', enrolledCount: 980, rating: 4.9 },
  { id: 3, titleAr: 'تسريحات شعر للمناسبات', titleEn: 'Occasion Hairstyling', descAr: 'تعلمي أجمل التسريحات للمناسبات', descEn: 'Learn beautiful hairstyles for occasions', instructor: 'سارة الحربي', lessons: 10, duration: '٥ ساعات', level: 'intermediate', category: 'hair', emoji: '💇‍♀️', enrolledCount: 720, rating: 4.7 },
  { id: 4, titleAr: 'فن الأظافر المتقدم', titleEn: 'Advanced Nail Art', descAr: 'تقنيات متقدمة في تزيين الأظافر', descEn: 'Advanced nail decoration techniques', instructor: 'هند المطيري', lessons: 5, duration: '٢.٥ ساعة', level: 'advanced', category: 'nails', emoji: '💅', enrolledCount: 450, rating: 4.6 },
];

export const beautyCoursesRouter = router({
  list: publicProcedure.query(() => COURSES),
  get: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const course = COURSES.find((c) => c.id === input.id);
    if (!course) throw new Error('الدورة غير موجودة');
    return course;
  }),
  enroll: customerProcedure.input(z.object({ courseId: z.number() })).mutation(async ({ ctx, input }) => ({
    enrollmentId: `ENR-${ctx.user.id}-${input.courseId}`, courseId: input.courseId, status: 'ENROLLED', progress: 0,
  })),
  myCourses: customerProcedure.query(async () => []),
});
