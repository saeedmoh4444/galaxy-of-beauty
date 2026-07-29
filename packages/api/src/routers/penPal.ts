import { z } from 'zod';
import { customerProcedure, router } from '../trpc';

const INTERESTS = ['skincare', 'makeup', 'hair', 'nails', 'wellness', 'natural', 'kbeauty', 'arabic'];
const penPals: Array<{ id: number; userId: number; userName: string; interests: string[]; bio: string; }> = [];
let palId = 1;

export const penPalRouter = router({
  register: customerProcedure
    .input(z.object({ interests: z.array(z.string()).min(2), bio: z.string().max(200).optional() }))
    .mutation(async ({ ctx, input }) => {
      const existing = penPals.findIndex((p) => p.userId === ctx.user.id);
      const pal = { id: existing >= 0 ? penPals[existing]!.id : palId++, userId: ctx.user.id, userName: ctx.user.email, interests: input.interests, bio: input.bio ?? '' };
      if (existing >= 0) penPals[existing] = pal; else penPals.push(pal);
      return pal;
    }),
  match: customerProcedure.query(async ({ ctx }) => {
    const me = penPals.find((p) => p.userId === ctx.user.id);
    if (!me) return [];
    return penPals
      .filter((p) => p.userId !== ctx.user.id)
      .map((p) => ({ ...p, score: p.interests.filter((i) => me.interests.includes(i)).length }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }),
  interests: customerProcedure.query(() => INTERESTS.map((k) => ({ key: k, nameAr: { skincare: 'عناية بالبشرة', makeup: 'مكياج', hair: 'شعر', nails: 'أظافر', wellness: 'عافية', natural: 'طبيعي', kbeauty: 'K-Beauty', arabic: 'عربي' }[k] ?? k, emoji: { skincare: '✨', makeup: '💄', hair: '💇‍♀️', nails: '💅', wellness: '🧘', natural: '🌿', kbeauty: '🇰🇷', arabic: '🧕' }[k] ?? '💬' }))),
});
