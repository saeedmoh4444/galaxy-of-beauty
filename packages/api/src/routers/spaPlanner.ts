import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

const SPA_SERVICES = [
  { id: 1, nameAr: 'مساج استرخائي', durationMin: 60, price: 250, emoji: '💆‍♀️', category: 'massage' },
  { id: 2, nameAr: 'تنظيف بشرة', durationMin: 45, price: 200, emoji: '✨', category: 'skincare' },
  { id: 3, nameAr: 'مانيكير', durationMin: 30, price: 100, emoji: '💅', category: 'nails' },
  { id: 4, nameAr: 'باديكير', durationMin: 40, price: 120, emoji: '🦶', category: 'nails' },
  { id: 5, nameAr: 'مكياج', durationMin: 60, price: 300, emoji: '💄', category: 'makeup' },
  { id: 6, nameAr: 'تسريحة شعر', durationMin: 45, price: 200, emoji: '💇‍♀️', category: 'hair' },
  { id: 7, nameAr: 'حمام مغربي', durationMin: 60, price: 350, emoji: '🧖‍♀️', category: 'body' },
  { id: 8, nameAr: 'قناع وجه', durationMin: 20, price: 80, emoji: '🎭', category: 'skincare' },
];

const BREAKS = [
  { id: 'tea', nameAr: 'استراحة شاي', durationMin: 15, emoji: '🍵' },
  { id: 'lunch', nameAr: 'غداء', durationMin: 30, emoji: '🥗' },
  { id: 'snack', nameAr: 'وجبة خفيفة', durationMin: 10, emoji: '🥐' },
];

export const spaPlannerRouter = router({
  services: customerProcedure.query(() => SPA_SERVICES),
  breaks: customerProcedure.query(() => BREAKS),

  myPlans: customerProcedure.query(({ ctx }) =>
    prisma.spaPlan.findMany({ where: { userId: ctx.user.id }, orderBy: { createdAt: 'desc' } })
  ),

  create: customerProcedure
    .input(z.object({ name: z.string().min(1), serviceIds: z.array(z.number()).min(1), breakIds: z.array(z.string()).default([]) }))
    .mutation(async ({ ctx, input }) => {
      const items: Array<Record<string,unknown>> = [];
      input.serviceIds.forEach((sid) => {
        const svc = SPA_SERVICES.find((s) => s.id === sid);
        if (svc) items.push({ type: 'service', id: svc.id, nameAr: svc.nameAr, durationMin: svc.durationMin, emoji: svc.emoji, price: svc.price });
      });
      input.breakIds.forEach((bid) => {
        const brk = BREAKS.find((b) => b.id === bid);
        if (brk) items.push({ type: 'break', id: brk.id, nameAr: brk.nameAr, durationMin: brk.durationMin, emoji: brk.emoji });
      });
      return prisma.spaPlan.create({ data: { userId: ctx.user.id, name: input.name, items } });
    }),
});
