import { z } from 'zod';
import { customerProcedure, router } from '../trpc';

export interface LiveChatMessage { id: number; userId: number; userName: string; message: string; isAgent: boolean; createdAt: string; }
type ChatMessage = LiveChatMessage;
const messages: ChatMessage[] = []; let msgId = 1;

// Simulated auto-responses
const AUTO_RESPONSES: Record<string, string> = {
  'حجز': 'يمكنكِ الحجز من خلال صفحة الخدمات أو الضغط على "احجزي الآن"',
  'سعر': 'الأسعار تختلف حسب الخدمة والفنية. تصفحي الخدمات لمعرفة الأسعار',
  'إلغاء': 'يمكنكِ إلغاء الحجز من صفحة "حجوزاتي" قبل موعد الخدمة بـ ٢٤ ساعة',
  'موعد': 'يمكنكِ اختيار الموعد المناسب عند الحجز من الصفحة',
};

export const liveChatRouter = router({
  history: customerProcedure.query(async ({ ctx }) => messages.filter((m) => m.userId === ctx.user.id).slice(-50)),
  send: customerProcedure
    .input(z.object({ message: z.string().min(1).max(500) }))
    .mutation(async ({ ctx, input }) => {
      const userMsg: ChatMessage = { id: msgId++, userId: ctx.user.id, userName: 'أنتِ', message: input.message, isAgent: false, createdAt: new Date().toISOString() };
      messages.push(userMsg);

      // Auto-response for common keywords
      let autoReply = '';
      for (const [keyword, reply] of Object.entries(AUTO_RESPONSES)) {
        if (input.message.includes(keyword)) { autoReply = reply; break; }
      }
      if (!autoReply) autoReply = 'شكراً لتواصلكِ معنا! فريق الدعم سيرد عليكِ قريباً. يمكنكِ أيضاً تصفح الأسئلة الشائعة من هنا: /beauty-faq';

      const agentMsg: ChatMessage = { id: msgId++, userId: ctx.user.id, userName: 'دعم جالكسي', message: autoReply, isAgent: true, createdAt: new Date().toISOString() };
      messages.push(agentMsg);
      return { userMsg, agentMsg };
    }),
});
