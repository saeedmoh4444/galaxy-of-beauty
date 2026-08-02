import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, publicProcedure, router } from '../trpc';

export const videoTestimonialsRouter = router({
  feed: publicProcedure
    .input(z.object({ page: z.number().default(1), limit: z.number().default(12) }))
    .query(async ({ input }) => {
      const skip = (input.page - 1) * input.limit;
      const [items, total] = await Promise.all([
        prisma.videoTestimonial.findMany({ orderBy: { createdAt: 'desc' }, skip, take: input.limit }),
        prisma.videoTestimonial.count(),
      ]);
      return { items, total };
    }),

  submit: customerProcedure
    .input(z.object({ videoUrl: z.string(), rating: z.number().min(1).max(5), comment: z.string().max(300), technicianName: z.string(), serviceName: z.string() }))
    .mutation(async ({ ctx, input }) =>
      prisma.videoTestimonial.create({ data: { userId: ctx.user.id, userName: ctx.user.email || 'مستخدمة', ...input } })
    ),
});
