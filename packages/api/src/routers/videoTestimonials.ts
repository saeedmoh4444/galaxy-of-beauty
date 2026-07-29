import { z } from 'zod';
import { customerProcedure, publicProcedure, router } from '../trpc';

const TESTIMONIALS = [
  { id: 1, userName: 'سارة', videoUrl: '', thumbnailUrl: '', rating: 5, comment: 'أفضل تجربة مكياج! نورة فنانة حقيقية 😍', technicianName: 'نورة العمري', serviceName: 'مكياج سهرة', likes: 120, date: '2026-07-15' },
  { id: 2, userName: 'ريم', videoUrl: '', thumbnailUrl: '', rating: 5, comment: 'بشرتي تحسنت كثييير بعد جلسات التنظيف ✨', technicianName: 'د. ليلى القحطاني', serviceName: 'تنظيف بشرة', likes: 95, date: '2026-07-10' },
  { id: 3, userName: 'مها', videoUrl: '', thumbnailUrl: '', rating: 4, comment: 'تسريحة شعر روعة ليوم زفافي 👰', technicianName: 'سارة الحربي', serviceName: 'تسريحة عرايس', likes: 210, date: '2026-07-08' },
];

export const videoTestimonialsRouter = router({
  feed: publicProcedure
    .input(z.object({ page: z.number().default(1), limit: z.number().default(12) }))
    .query(async ({ input }) => ({ items: TESTIMONIALS, total: TESTIMONIALS.length })),
  submit: customerProcedure
    .input(z.object({ videoUrl: z.string().url(), rating: z.number().min(1).max(5), comment: z.string().max(300), technicianName: z.string(), serviceName: z.string() }))
    .mutation(async ({ ctx, input }) => ({ id: TESTIMONIALS.length + 1, userName: ctx.user.email, thumbnailUrl: '', ...input, likes: 0, date: new Date().toISOString().slice(0, 10) })),
});
