import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

const QUESTIONS = [
  {
    id: 'skin_type',
    question: 'ما نوع بشرتكِ؟',
    options: ['دهنية', 'جافة', 'مختلطة', 'حساسة', 'طبيعية', 'لا أعرف'],
  },
  {
    id: 'beauty_goal',
    question: 'ما هدفكِ الجمالي؟',
    options: ['عناية بالبشرة', 'تعلم المكياج', 'الاسترخاء', 'تغيير الإطلالة', 'تحضير لمناسبة'],
  },
  {
    id: 'budget',
    question: 'ميزانيتكِ الشهرية للجمال؟',
    options: ['أقل من 200', '200-500', '500-1000', 'أكثر من 1000'],
  },
  {
    id: 'frequency',
    question: 'كم مرة تزورين صالون تجميل؟',
    options: ['أسبوعياً', 'شهرياً', 'كل شهرين', 'في المناسبات فقط'],
  },
];

export const beautyOnboardingRouter = router({
  questions: customerProcedure.query(() => QUESTIONS),

  submit: customerProcedure
    .input(z.object({ answers: z.record(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.onboardingResponse.findUnique({
        where: { userId: ctx.user.id },
      });
      if (existing) {
        await prisma.onboardingResponse.update({
          where: { userId: ctx.user.id },
          data: { answers: input.answers, completed: true },
        });
      } else {
        await prisma.onboardingResponse.create({
          data: { userId: ctx.user.id, answers: input.answers, completed: true },
        });
      }
      return { completed: true };
    }),

  status: customerProcedure.query(async ({ ctx }) => {
    const response = await prisma.onboardingResponse.findUnique({ where: { userId: ctx.user.id } });
    return {
      completed: !!response?.completed,
      answeredQuestions: response
        ? Object.keys(response.answers as Record<string, unknown>).length
        : 0,
      totalQuestions: QUESTIONS.length,
    };
  }),
});
