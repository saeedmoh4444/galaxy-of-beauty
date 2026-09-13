import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

const db = prisma;

export const birthdayRewardRouter = router({
  myReward: customerProcedure.query(async ({ ctx }) => {
    const year = new Date().getFullYear();
    const reward = await db.birthdayReward.findUnique({
      where: { userId_year: { userId: ctx.user.id, year } },
    });
    return reward;
  }),
  claim: customerProcedure.mutation(async ({ ctx }) => {
    const year = new Date().getFullYear();
    const existing = await db.birthdayReward.findUnique({
      where: { userId_year: { userId: ctx.user.id, year } },
    });
    if (existing?.claimed) throw new Error('تم استلام المكافأة مسبقاً');
    if (!existing) throw new Error('لا توجد مكافأة عيد ميلاد متاحة');

    const code = `BDAY${ctx.user.id}${year}`;
    await db.birthdayReward.update({
      where: { id: existing.id },
      data: { claimed: true, claimedAt: new Date(), promoCode: code },
    });
    return { ...existing, promoCode: code, claimed: true };
  }),
});
