import { z } from 'zod';
import { customerProcedure, router } from '../trpc';

const PRESETS = [
  { id: 'morning', nameAr: '☀️ روتين صباحي', steps: [{ time: '7:00', task: 'غسول وجه', emoji: '🧼' }, { time: '7:05', task: 'تونر', emoji: '💦' }, { time: '7:10', task: 'سيروم', emoji: '✨' }, { time: '7:15', task: 'مرطب', emoji: '🧴' }, { time: '7:20', task: 'واقي شمس', emoji: '☀️' }] },
  { id: 'evening', nameAr: '🌙 روتين مسائي', steps: [{ time: '21:00', task: 'مزيل مكياج', emoji: '🧽' }, { time: '21:05', task: 'غسول', emoji: '🧼' }, { time: '21:10', task: 'تونر', emoji: '💦' }, { time: '21:15', task: 'سيروم ليلي', emoji: '🌙' }, { time: '21:20', task: 'كريم ليلي', emoji: '😴' }] },
  { id: 'weekly', nameAr: '📅 روتين أسبوعي', steps: [{ time: 'السبت', task: 'قناع وجه', emoji: '🎭' }, { time: 'الأحد', task: 'تقشير', emoji: '🪨' }, { time: 'الثلاثاء', task: 'قناع ترطيب', emoji: '💧' }, { time: 'الخميس', task: 'مساج وجه', emoji: '💆‍♀️' }] },
];

export const routineSchedulerRouter = router({
  presets: customerProcedure.query(() => PRESETS),
  myRoutines: customerProcedure.query(() => PRESETS),
  toggleStep: customerProcedure
    .input(z.object({ routineId: z.string(), stepIndex: z.number() }))
    .mutation(async ({ input }) => ({ routineId: input.routineId, stepIndex: input.stepIndex, toggled: true })),
});
