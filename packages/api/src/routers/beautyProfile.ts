import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

export const beautyProfileRouter = router({
  // Get my beauty profile
  get: customerProcedure.query(async ({ ctx }) => {
    const profile = await prisma.beautyProfile.findUnique({ where: { userId: ctx.user.id } });
    return profile;
  }),

  // Create or update beauty profile
  upsert: customerProcedure
    .input(z.object({
      skinType: z.enum(['oily', 'dry', 'combination', 'sensitive', 'normal']).optional(),
      hairType: z.enum(['straight', 'wavy', 'curly', 'coily']).optional(),
      hairLength: z.enum(['short', 'medium', 'long']).optional(),
      skinTone: z.enum(['fair', 'medium', 'olive', 'tan', 'deep']).optional(),
      allergies: z.array(z.string()).optional(),
      preferredScents: z.array(z.string()).optional(),
      makeupStyle: z.enum(['natural', 'glam', 'soft', 'bold']).optional(),
      concerns: z.array(z.string()).optional(),
      notes: z.string().max(1000).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const profile = await prisma.beautyProfile.upsert({
        where: { userId: ctx.user.id },
        create: { userId: ctx.user.id, ...input },
        update: input,
      });
      return profile;
    }),
});
