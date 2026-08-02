import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { BULK_PAGE_SIZE } from '@galaxy/shared';
import { customerProcedure, router } from '../trpc';

const AUTO_RESPONSES: Record<string, string> = {
  'حجز': 'يمكنكِ الحجز من خلال صفحة الخدمات أو الضغط على "احجزي الآن"',
  'سعر': 'الأسعار تختلف حسب الخدمة والفنية. تصفحي الخدمات لمعرفة الأسعار',
  'إلغاء': 'يمكنكِ إلغاء الحجز من صفحة "حجوزاتي" قبل موعد الخدمة بـ ٢٤ ساعة',
};

export const liveChatRouter = router({
  history: customerProcedure.query(async ({ ctx }) =>
    prisma.liveChatMessage.findMany({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: 'asc' },
      take: BULK_PAGE_SIZE,
    })),

  send: customerProcedure
    .input(z.object({ message: z.string().min(1).max(500) }))
    .mutation(async ({ ctx, input }) => {
      const userMsg = await prisma.liveChatMessage.create({
        data: { userId: ctx.user.id, userName: 'أنتِ', message: input.message, isAgent: false },
      });

      let autoReply = '';
      for (const [keyword, reply] of Object.entries(AUTO_RESPONSES)) {
        if (input.message.includes(keyword)) { autoReply = reply; break; }
      }
      if (!autoReply) autoReply = 'شكراً لتواصلكِ معنا! فريق الدعم سيرد عليكِ قريباً.';

      const agentMsg = await prisma.liveChatMessage.create({
        data: { userId: ctx.user.id, userName: 'دعم جالكسي', message: autoReply, isAgent: true },
      });

      return { userMsg, agentMsg };
    }),
});
