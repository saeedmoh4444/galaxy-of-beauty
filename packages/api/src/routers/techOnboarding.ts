import { z } from 'zod';
import { customerProcedure, router } from '../trpc';

const STEPS = [
  {
    key: 'kyc',
    nameAr: 'التحقق من الهوية',
    emoji: '🪪',
    desc: 'ارفعي صورة الهوية أو الإقامة',
    completed: false,
  },
  {
    key: 'certificate',
    nameAr: 'الشهادات',
    emoji: '📜',
    desc: 'ارفعي شهاداتكِ المهنية',
    completed: false,
  },
  {
    key: 'portfolio',
    nameAr: 'معرض الأعمال',
    emoji: '📸',
    desc: 'أضيفي ٥ صور من أعمالكِ',
    completed: false,
  },
  {
    key: 'interview',
    nameAr: 'مقابلة',
    emoji: '🎤',
    desc: 'احجزي موعد مقابلة تعريفية',
    completed: false,
  },
  {
    key: 'training',
    nameAr: 'تدريب',
    emoji: '📚',
    desc: 'أكملي التدريب على المنصة',
    completed: false,
  },
];

export const techOnboardingRouter = router({
  steps: customerProcedure.query(() => ({
    steps: STEPS,
    completed: STEPS.filter((s) => s.completed).length,
    total: STEPS.length,
    readyForReview: false,
  })),
  submitDoc: customerProcedure
    .input(z.object({ stepKey: z.string(), documentUrl: z.string().url() }))
    .mutation(async ({ input }) => {
      const step = STEPS.find((s) => s.key === input.stepKey);
      if (step) step.completed = true;
      return { step: input.stepKey, completed: true, message: 'تم رفع المستند' };
    }),
});
