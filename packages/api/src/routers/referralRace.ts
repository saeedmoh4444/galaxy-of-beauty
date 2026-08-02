import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { DEFAULT_APP_URL } from '@galaxy/shared';
import { customerProcedure, publicProcedure, router } from '../trpc';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

const END_DATE = new Date(); END_DATE.setDate(END_DATE.getDate() + 14);
const PRIZES = ['🥇 جلسة مجانية', '🥈 خصم ٥٠٪', '🥉 خصم ٣٠٪'];

export const referralRaceRouter = router({
  leaderboard: publicProcedure.query(async () => {
    const leaders = await db.referral.groupBy({ by: ['referrerId'], where: { status: 'COMPLETED' }, _count: { id: true }, orderBy: { _count: { id: 'desc' } }, take: 10 });
    const enriched = await Promise.all((leaders as any[]).map(async (l: any, i: number) => {
      const user = await db.user.findUnique({ where: { id: l.referrerId }, select: { name: true } });
      return { userId: l.referrerId, userName: user?.name || 'مستخدمة', referralCount: l._count.id, prize: PRIZES[i] || '', rank: i + 1 };
    }));
    return { leaders: enriched, endDate: END_DATE.toISOString(), remainingDays: Math.ceil((END_DATE.getTime() - Date.now()) / 86400000), prizes: PRIZES };
  }),

  myRank: customerProcedure.query(async ({ ctx }) => {
    const count = await db.referral.count({ where: { referrerId: ctx.user.id, status: 'COMPLETED' } });
    const leaders = await db.referral.groupBy({ by: ['referrerId'], where: { status: 'COMPLETED' }, _count: { id: true }, orderBy: { _count: { id: 'desc' } }, take: 50 });
    const rank = (leaders as any[]).findIndex((l: any) => l.referrerId === ctx.user.id) + 1;
    return { rank: rank || null, count, prize: rank > 0 && rank <= 3 ? PRIZES[rank - 1] : '' };
  }),

  share: customerProcedure
    .input(z.object({ platform: z.enum(['whatsapp', 'twitter', 'copy']) }))
    .mutation(async ({ ctx }) => {
      const code = await db.referral.findFirst({ where: { referrerId: ctx.user.id }, select: { referralCode: true } });
      const appUrl = process.env['NEXT_PUBLIC_APP_URL'] || DEFAULT_APP_URL;
      return { url: `${appUrl}/register?ref=${code?.referralCode || ctx.user.id}`, message: 'انضمي لجالكسي بيوتي واكسبي جوائز!' };
    }),
});
