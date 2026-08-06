import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

const TIPS: Record<string, { emoji: string; tips: string[] }> = {
  hot: { emoji: '☀️', tips: ['SPF 50+', 'مرطب جل', 'ماء كثير', 'تجنبي المكياج الثقيل'] },
  mild: { emoji: '🌤️', tips: ['SPF 30', 'روتينك المعتاد', 'جربي إطلالة جديدة'] },
  cold: { emoji: '❄️', tips: ['مرطب غني', 'بلسم شفاه', 'قناع ترطيب', 'ماء دافئ للوجه'] },
  humid: { emoji: '💦', tips: ['منتجات خالية من الزيوت', 'مثبت مكياج', 'ورق نشاف'] },
  dusty: { emoji: '🌪️', tips: ['غسول عميق', 'قناع منقي', 'تجنبي التقشير'] },
};

export const weatherBeautyRouter = router({
  getAdvice: publicProcedure
    .input(z.object({ condition: z.enum(['hot', 'mild', 'cold', 'humid', 'dusty']), temp: z.number().optional() }))
    .query(({ input }) => {
      const advice = TIPS[input.condition] ?? TIPS.mild;
      return { condition: input.condition, emoji: advice!.emoji, tips: advice!.tips, temp: input.temp ?? null };
    }),

  conditions: publicProcedure.query(() => {
    return Object.entries(TIPS).map(([key, val]) => ({ condition: key, emoji: val.emoji, tipCount: val.tips.length }));
  }),
});
