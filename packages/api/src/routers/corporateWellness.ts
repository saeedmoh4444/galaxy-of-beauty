import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, publicProcedure, router } from '../trpc';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

function formatPlan(p: any) {
  return {
    id: p.key,
    nameAr: (p.nameJson as Record<string, string>)?.ar ?? '',
    nameEn: (p.nameJson as Record<string, string>)?.en ?? '',
    price: p.price,
    employees: p.employees,
    services: p.services as string[],
    emoji: p.emoji,
  };
}

export const corporateWellnessRouter = router({
  plans: publicProcedure.query(async () => {
    const plans = await db.corporatePlan.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
    return plans.map(formatPlan);
  }),

  enquire: publicProcedure
    .input(z.object({ companyName: z.string().min(1), contactName: z.string().min(1), email: z.string().email(), planId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await db.corporateEnquiry.create({
        data: {
          userId: ctx.user?.id ?? null,
          companyName: input.companyName,
          contactName: input.contactName,
          email: input.email,
          planId: input.planId,
        },
      });
      return { success: true, message: 'تم استلام طلبكِ وسنتواصل معكِ خلال ٢٤ ساعة' };
    }),

  myEnquiries: customerProcedure.query(async ({ ctx }) => {
    return db.corporateEnquiry.findMany({ where: { userId: ctx.user.id }, orderBy: { createdAt: 'desc' } });
  }),
});
