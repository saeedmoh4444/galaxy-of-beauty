import { z } from 'zod';
import { customerProcedure, router } from '../trpc';

const ROUTINE_TEMPLATES: Record<string, Array<{ time: string; stepAr: string; stepEn: string; emoji: string; duration: string }>> = {
  dry: [
    { time: 'morning', stepAr: 'غسول كريمي لطيف', stepEn: 'Gentle Cream Cleanser', emoji: '🧼', duration: '٢ دقيقة' },
    { time: 'morning', stepAr: 'تونر مرطب', stepEn: 'Hydrating Toner', emoji: '💦', duration: '١ دقيقة' },
    { time: 'morning', stepAr: 'سيروم حمض الهيالورونيك', stepEn: 'Hyaluronic Acid Serum', emoji: '✨', duration: '٢ دقيقة' },
    { time: 'morning', stepAr: 'كريم مرطب غني', stepEn: 'Rich Moisturizer', emoji: '🧴', duration: '٢ دقيقة' },
    { time: 'morning', stepAr: 'واقي شمس SPF50', stepEn: 'SPF50 Sunscreen', emoji: '☀️', duration: '١ دقيقة' },
    { time: 'evening', stepAr: 'مزيل مكياج زيتي', stepEn: 'Oil Cleanser', emoji: '🫒', duration: '٢ دقيقة' },
    { time: 'evening', stepAr: 'غسول كريمي', stepEn: 'Cream Cleanser', emoji: '🧼', duration: '٢ دقيقة' },
    { time: 'evening', stepAr: 'تونر مرطب', stepEn: 'Hydrating Toner', emoji: '💦', duration: '١ دقيقة' },
    { time: 'evening', stepAr: 'سيروم الريتينول', stepEn: 'Retinol Serum', emoji: '🌙', duration: '٢ دقيقة' },
    { time: 'evening', stepAr: 'كريم ليلي مغذي', stepEn: 'Nourishing Night Cream', emoji: '😴', duration: '٢ دقيقة' },
  ],
  oily: [
    { time: 'morning', stepAr: 'غسول جل منقي', stepEn: 'Purifying Gel Cleanser', emoji: '🧼', duration: '٢ دقيقة' },
    { time: 'morning', stepAr: 'تونر مقبض للمسام', stepEn: 'Pore-Tightening Toner', emoji: '💧', duration: '١ دقيقة' },
    { time: 'morning', stepAr: 'سيروم النياسيناميد', stepEn: 'Niacinamide Serum', emoji: '✨', duration: '٢ دقيقة' },
    { time: 'morning', stepAr: 'جل مرطب خفيف', stepEn: 'Light Gel Moisturizer', emoji: '🧴', duration: '١ دقيقة' },
    { time: 'morning', stepAr: 'واقي شمس SPF50', stepEn: 'SPF50 Sunscreen', emoji: '☀️', duration: '١ دقيقة' },
    { time: 'evening', stepAr: 'مزيل مكياج مائي', stepEn: 'Micellar Water', emoji: '💧', duration: '٢ دقيقة' },
    { time: 'evening', stepAr: 'غسول جل', stepEn: 'Gel Cleanser', emoji: '🧼', duration: '٢ دقيقة' },
    { time: 'evening', stepAr: 'تونر BHA', stepEn: 'BHA Toner', emoji: '🧪', duration: '١ دقيقة' },
    { time: 'evening', stepAr: 'سيروم خفيف', stepEn: 'Lightweight Serum', emoji: '✨', duration: '٢ دقيقة' },
    { time: 'evening', stepAr: 'جل ليلي مرطب', stepEn: 'Night Gel Moisturizer', emoji: '😴', duration: '١ دقيقة' },
  ],
  combination: [
    { time: 'morning', stepAr: 'غسول لطيف متوازن', stepEn: 'Gentle Balanced Cleanser', emoji: '🧼', duration: '٢ دقيقة' },
    { time: 'morning', stepAr: 'تونر متوازن', stepEn: 'Balancing Toner', emoji: '💦', duration: '١ دقيقة' },
    { time: 'morning', stepAr: 'سيروم فيتامين C', stepEn: 'Vitamin C Serum', emoji: '🍊', duration: '٢ دقيقة' },
    { time: 'morning', stepAr: 'مرطب متوسط', stepEn: 'Medium Moisturizer', emoji: '🧴', duration: '١ دقيقة' },
    { time: 'morning', stepAr: 'واقي شمس SPF50', stepEn: 'SPF50 Sunscreen', emoji: '☀️', duration: '١ دقيقة' },
    { time: 'evening', stepAr: 'مزيل مكياج', stepEn: 'Makeup Remover', emoji: '🧽', duration: '٢ دقيقة' },
    { time: 'evening', stepAr: 'غسول لطيف', stepEn: 'Gentle Cleanser', emoji: '🧼', duration: '٢ دقيقة' },
    { time: 'evening', stepAr: 'تونر مرطب', stepEn: 'Hydrating Toner', emoji: '💦', duration: '١ دقيقة' },
    { time: 'evening', stepAr: 'سيروم مغذي', stepEn: 'Nourishing Serum', emoji: '✨', duration: '٢ دقيقة' },
    { time: 'evening', stepAr: 'كريم ليلي', stepEn: 'Night Cream', emoji: '😴', duration: '٢ دقيقة' },
  ],
};

export const aiRoutineRouter = router({
  generate: customerProcedure
    .input(z.object({ skinType: z.enum(['dry', 'oily', 'combination', 'normal']), goals: z.array(z.string()).optional() }))
    .query(async ({ input }) => {
      const routine = ROUTINE_TEMPLATES[input.skinType] ?? ROUTINE_TEMPLATES['combination']!;
      const morning = routine.filter((s) => s.time === 'morning');
      const evening = routine.filter((s) => s.time === 'evening');
      return {
        skinType: input.skinType,
        totalMinutes: 10,
        morning: { steps: morning, totalTime: '٨ دقائق' },
        evening: { steps: evening, totalTime: '٩ دقائق' },
        tips: ['استمري على الروتين لمدة ٢٨ يوم على الأقل لرؤية النتائج', 'تذكري إزالة المكياج قبل النوم دائماً', 'اشربي ٨ أكواب ماء يومياً لبشرة صحية'],
      };
    }),
});
