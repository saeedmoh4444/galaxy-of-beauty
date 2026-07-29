import { customerProcedure, router } from '../trpc';

const BINGO_CARD = [
  { id: 1, task: 'روتين عناية يومي كامل ✨', completed: false },
  { id: 2, task: 'شرب ٨ أكواب ماء 💧', completed: false },
  { id: 3, task: 'قناع وجه 🎭', completed: false },
  { id: 4, task: 'تطبيق واقي شمس ☀️', completed: true },
  { id: 5, task: 'ماسك شعر 💆‍♀️', completed: false },
  { id: 6, task: 'إزالة مكياج قبل النوم 🧽', completed: true },
  { id: 7, task: 'تمارين وجه ٥ دقائق 🏋️', completed: false },
  { id: 8, task: 'تقشير بشرة 🪨', completed: false },
  { id: 9, task: 'تدليك وجه 💆‍♀️', completed: true },
];

export const beautyBingoRouter = router({
  card: customerProcedure.query(() => ({ tasks: BINGO_CARD, completed: BINGO_CARD.filter((t) => t.completed).length, total: 9, reward: '٣ خطوط = جلسة مجانية! 🎉' })),
  mark: customerProcedure.mutation(async () => ({ success: true })),
});
