import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import { technicianProcedure, publicProcedure, adminProcedure, router } from '../trpc';

export const galleryRouter = router({
  // Public: view a technician's gallery
  byTechnician: publicProcedure
    .input(z.object({ technicianId: z.number().int().positive(), page: z.number().default(1), limit: z.number().default(20) }))
    .query(async ({ input }) => {
      const skip = (input.page - 1) * input.limit;
      const [items, total] = await Promise.all([
        prisma.galleryImage.findMany({
          where: { technicianId: input.technicianId, isPublished: true },
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
          skip, take: input.limit,
        }),
        prisma.galleryImage.count({ where: { technicianId: input.technicianId, isPublished: true } }),
      ]);
      return { items, total, page: input.page };
    }),

  // Technician: upload a gallery image
  upload: technicianProcedure
    .input(z.object({
      imageUrl: z.string().url(),
      captionAr: z.string().optional(),
      captionEn: z.string().optional(),
      category: z.enum(['hair', 'nails', 'makeup', 'skin', 'massage', 'henna', 'other']).optional(),
      isBefore: z.boolean().default(false),
      pairId: z.number().int().positive().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return prisma.galleryImage.create({
        data: {
          technicianId: ctx.user.id,
          imageUrl: input.imageUrl,
          captionJson: { ar: input.captionAr || '', en: input.captionEn || '' },
          category: input.category,
          isBefore: input.isBefore,
          pairId: input.pairId,
        },
      });
    }),

  // Technician: delete own image
  delete: technicianProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const img = await prisma.galleryImage.findFirst({
        where: { id: input.id, technicianId: ctx.user.id },
      });
      if (!img) throw new TRPCError({ code: 'NOT_FOUND' });
      await prisma.galleryImage.delete({ where: { id: input.id } });
      return { success: true };
    }),

  // Admin: toggle publish
  togglePublish: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const img = await prisma.galleryImage.findUnique({ where: { id: input.id } });
      if (!img) throw new TRPCError({ code: 'NOT_FOUND' });
      return prisma.galleryImage.update({ where: { id: input.id }, data: { isPublished: !img.isPublished } });
    }),
});
