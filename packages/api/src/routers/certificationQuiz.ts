import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, publicProcedure, router } from '../trpc';

const QUIZZES = [
  {
    id: 'skincare',
    nameAr: 'أساسيات العناية بالبشرة',
    emoji: '',
    questions: [
      {
        q: 'كم مرة يجب تنظيف البشرة يومياً؟',
        opts: ['مرة', 'مرتين', '٣ مرات', '٤ مرات'],
        correct: 1,
      },
      {
        q: 'ما هو أهم منتج للعناية اليومية؟',
        opts: ['تونر', 'سيروم', 'واقي شمس', 'مقشر'],
        correct: 2,
      },
      {
        q: 'متى يفضل وضع المرطب؟',
        opts: ['قبل النوم فقط', 'صباحاً فقط', 'صباحاً ومساءً', 'مرة أسبوعياً'],
        correct: 2,
      },
    ],
  },
  {
    id: 'makeup',
    nameAr: 'فن المكياج',
    emoji: '',
    questions: [
      {
        q: 'ما هي أول خطوة في تطبيق المكياج؟',
        opts: ['كريم أساس', 'برايمر', 'كونسيلر', 'بودرة'],
        correct: 1,
      },
      {
        q: 'كم مدة صلاحية الماسكارا بعد الفتح؟',
        opts: ['شهر', '٣ أشهر', '٦ أشهر', 'سنة'],
        correct: 1,
      },
    ],
  },
];

export const certificationQuizRouter = router({
  quizzes: publicProcedure.query(() =>
    QUIZZES.map((q) => ({
      id: q.id,
      nameAr: q.nameAr,
      emoji: q.emoji,
      questionCount: q.questions.length,
    })),
  ),
  get: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    const quiz = QUIZZES.find((q) => q.id === input.id);
    if (!quiz) throw new Error('غير موجود');
    return quiz;
  }),
  submit: customerProcedure
    .input(z.object({ quizId: z.string(), answers: z.array(z.number()) }))
    .mutation(async ({ ctx, input }) => {
      const quiz = QUIZZES.find((q) => q.id === input.quizId);
      if (!quiz) throw new Error('غير موجود');
      let correct = 0;
      input.answers.forEach((ans, i) => {
        if (quiz.questions[i]?.correct === ans) correct++;
      });
      const score = Math.round((correct / quiz.questions.length) * 100);
      if (score >= 80) {
        const cert = await prisma.quizCertificate.create({
          data: { userId: ctx.user.id, quizId: input.quizId, quizName: quiz.nameAr, score },
        });
        return { passed: true, score, certificate: cert };
      }
      return { passed: false, score, certificate: null };
    }),
  myCertificates: customerProcedure.query(async ({ ctx }) =>
    prisma.quizCertificate.findMany({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: 'desc' },
    }),
  ),
});
