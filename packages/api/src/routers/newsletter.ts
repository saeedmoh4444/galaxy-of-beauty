import { z } from 'zod';
import { adminProcedure, publicProcedure, router } from '../trpc';

const ISSUES = [
  { id: 1, titleAr: 'العناية بالبشرة في الصيف', subject: '🌞 دليلكِ للعناية بالبشرة صيفاً', sentAt: '2026-07-25', openRate: 68, emoji: '✨' },
  { id: 2, titleAr: 'أحدث صيحات المكياج', subject: '💄 اكتشفي أحدث صيحات مكياج ٢٠٢٦', sentAt: '2026-07-18', openRate: 72, emoji: '💄' },
  { id: 3, titleAr: 'عروض العيد', subject: '🎉 عروض خاصة بمناسبة العيد', sentAt: '2026-07-01', openRate: 85, emoji: '🎉' },
];

const SUBSCRIBERS = { total: 12500, active: 10200, unsubscribed: 2300 };

export const newsletterRouter = router({
  issues: publicProcedure.query(() => ISSUES),
  subscribers: adminProcedure.query(() => SUBSCRIBERS),
  subscribe: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => ({ subscribed: true, email: input.email, message: 'تم الاشتراك بنجاح! 🎉' })),
  compose: adminProcedure
    .input(z.object({ titleAr: z.string().min(1), subject: z.string().min(1), content: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const issue = { id: ISSUES.length + 1, titleAr: input.titleAr, subject: input.subject, sentAt: new Date().toISOString().slice(0, 10), openRate: 0, emoji: '📰' };
      ISSUES.unshift(issue);
      return issue;
    }),
});
