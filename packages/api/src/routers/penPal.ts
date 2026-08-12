import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

const INTERESTS = [
  'skincare',
  'makeup',
  'hair',
  'nails',
  'wellness',
  'natural',
  'kbeauty',
  'arabic',
];

const INTEREST_LABELS: Record<string, { nameAr: string; emoji: string }> = {
  skincare: { nameAr: 'عناية بالبشرة', emoji: '' },
  makeup: { nameAr: 'مكياج', emoji: '' },
  hair: { nameAr: 'شعر', emoji: '‍️' },
  nails: { nameAr: 'أظافر', emoji: '' },
  wellness: { nameAr: 'عافية', emoji: '' },
  natural: { nameAr: 'طبيعي', emoji: '' },
  kbeauty: { nameAr: 'K-Beauty', emoji: '' },
  arabic: { nameAr: 'عربي', emoji: '' },
};

export const penPalRouter = router({
  register: customerProcedure
    .input(z.object({ interests: z.array(z.string()).min(2), bio: z.string().max(200).optional() }))
    .mutation(async ({ ctx, input }) =>
      prisma.penPalProfile.upsert({
        where: { userId: ctx.user.id },
        create: { userId: ctx.user.id, interests: input.interests, bio: input.bio ?? '' },
        update: { interests: input.interests, bio: input.bio ?? '' },
      }),
    ),

  match: customerProcedure.query(async ({ ctx }) => {
    const me = await prisma.penPalProfile.findUnique({ where: { userId: ctx.user.id } });
    if (!me) return [];
    const all = await prisma.penPalProfile.findMany({
      where: { userId: { not: ctx.user.id } },
      take: 50,
    });
    return all
      .map((p) => ({
        ...p,
        score: p.interests.filter((i: string) => me.interests.includes(i)).length,
        userName: `مستخدمة #${p.userId}`,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }),

  interests: customerProcedure.query(() =>
    INTERESTS.map((k) => ({
      key: k,
      nameAr: INTEREST_LABELS[k]?.nameAr ?? k,
      emoji: INTEREST_LABELS[k]?.emoji ?? '',
    })),
  ),
});
