import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

export const favoriteRouter = router({
  // List my favorites
  list: customerProcedure.query(async ({ ctx }) => {
    const favs = await prisma.customerFavorite.findMany({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: 'desc' },
    });
    return favs;
  }),

  // Add a favorite
  add: customerProcedure
    .input(
      z.object({
        serviceId: z.number().int().positive(),
        technicianId: z.number().int().positive().optional(),
        label: z.string().max(100).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const fav = await prisma.customerFavorite.create({
        data: {
          userId: ctx.user.id,
          serviceId: input.serviceId,
          technicianId: input.technicianId,
          label: input.label || 'مفضل',
        },
      });
      return fav;
    }),

  // Remove a favorite
  remove: customerProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      await prisma.customerFavorite.deleteMany({
        where: { id: input.id, userId: ctx.user.id },
      });
      return { success: true };
    }),
});
