import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, publicProcedure, router } from '../trpc';

const SHORTS = [
  {
    id: 1,
    title: 'طريقة تطبيق الآيلاينر بسهولة',
    technician: 'نورة العمري',
    duration: '٠:٣٢',
    views: 5200,
    likes: 890,
    category: 'makeup',
    emoji: '💄',
  },
  {
    id: 2,
    title: 'روتين عناية في دقيقة',
    technician: 'د. ليلى القحطاني',
    duration: '٠:٤٥',
    views: 3800,
    likes: 650,
    category: 'skincare',
    emoji: '✨',
  },
  {
    id: 3,
    title: 'تسريحة شعر سريعة',
    technician: 'سارة الحربي',
    duration: '٠:٢٨',
    views: 4100,
    likes: 720,
    category: 'hair',
    emoji: '💇‍♀️',
  },
  {
    id: 4,
    title: 'مانيكير في ٣٠ ثانية',
    technician: 'هند المطيري',
    duration: '٠:٣٥',
    views: 2900,
    likes: 480,
    category: 'nails',
    emoji: '💅',
  },
  {
    id: 5,
    title: 'نصيحة سريعة: واقي شمس',
    technician: 'د. ليلى القحطاني',
    duration: '٠:١٥',
    views: 6800,
    likes: 1200,
    category: 'skincare',
    emoji: '☀️',
  },
  {
    id: 6,
    title: 'خلطة طبيعية للشعر',
    technician: 'مريم الشمري',
    duration: '٠:٥٠',
    views: 3500,
    likes: 580,
    category: 'hair',
    emoji: '🌿',
  },
];

export const beautyShortsRouter = router({
  feed: publicProcedure.query(() => SHORTS),

  like: customerProcedure
    .input(z.object({ shortId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await prisma.shortLike.upsert({
        where: { shortId_userId: { shortId: input.shortId, userId: ctx.user.id } },
        update: {},
        create: { shortId: input.shortId, userId: ctx.user.id },
      });
      return { liked: true, shortId: input.shortId };
    }),
});
