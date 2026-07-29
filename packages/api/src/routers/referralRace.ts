import { z } from 'zod';
import { customerProcedure, publicProcedure, router } from '../trpc';

const LEADERS = [
  { userId: 1, userName: 'نورة', referralCount: 24, prize: 'جلسة تجميل مجانية', rank: 1 },
  { userId: 2, userName: 'سارة', referralCount: 18, prize: 'خصم ٥٠٪', rank: 2 },
  { userId: 3, userName: 'مريم', referralCount: 15, prize: 'خصم ٣٠٪', rank: 3 },
  { userId: 4, userName: 'هند', referralCount: 12, prize: '', rank: 4 },
  { userId: 5, userName: 'ليلى', referralCount: 10, prize: '', rank: 5 },
];

const END_DATE = new Date(); END_DATE.setDate(END_DATE.getDate() + 14);

export const referralRaceRouter = router({
  leaderboard: publicProcedure.query(() => ({ leaders: LEADERS, endDate: END_DATE.toISOString(), remainingDays: Math.ceil((END_DATE.getTime() - Date.now()) / 86400000), prizes: ['🥇 جلسة مجانية', '🥈 خصم ٥٠٪', '🥉 خصم ٣٠٪'] })),
  myRank: customerProcedure.query(async ({ ctx }) => {
    const me = LEADERS.find((l) => l.userId === ctx.user.id);
    return me ? { rank: me.rank, count: me.referralCount, prize: me.prize } : { rank: null, count: 0, prize: '' };
  }),
  share: customerProcedure
    .input(z.object({ platform: z.enum(['whatsapp', 'twitter', 'copy']) }))
    .mutation(async ({ ctx }) => ({ url: `https://galaxyofbeauty.sa/register?ref=${ctx.user.id}`, message: 'انضمي لجالكسي بيوتي واكسبي جوائز!' })),
});
