import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

const DNA_TRAITS: Record<string, { recommendations: string[]; avoidProducts: string[]; bestRoutine: string }> = {
  'collagen_low': { recommendations: ['سيروم فيتامين C', 'كريم كولاجين', 'مكملات كولاجين'], avoidProducts: ['مقشرات قوية', 'ريتينول عالي'], bestRoutine: 'صباحاً: فيتامين C + مرطب. مساءً: كولاجين + كريم ليلي' },
  'melanin_high': { recommendations: ['واقي شمس SPF50+', 'سيروم نياسيناميد', 'كريم تفتيح'], avoidProducts: ['أحماض قوية', 'هيدروكينون'], bestRoutine: 'صباحاً: نياسيناميد + واقي شمس. مساءً: سيروم تفتيح + مرطب' },
  'sensitive_yes': { recommendations: ['غسول لطيف', 'مرطب خالي من العطور', 'سيروم سيراميد'], avoidProducts: ['عطور', 'كحول', 'أحماض'], bestRoutine: 'صباحاً: غسول لطيف + مرطب. مساءً: سيراميد + كريم مهدئ' },
  'oxidation_high': { recommendations: ['سيروم فيتامين E', 'مضادات أكسدة', 'أوميغا 3'], avoidProducts: ['زيوت معدنية', 'منتجات مؤكسدة'], bestRoutine: 'صباحاً: مضاد أكسدة + واقي شمس. مساءً: فيتامين E + مرطب ليلي' },
  'elasticity_low': { recommendations: ['حمض الهيالورونيك', 'ببتيدات', 'مساج وجه'], avoidProducts: ['منتجات تجفيف', 'صابون قاسي'], bestRoutine: 'صباحاً: هيالورونيك + ببتيدات. مساءً: مساج + كريم مرطب' },
};

const TRAIT_QUESTIONS = [
  { id: 't1', q: 'هل تعانين من جفاف البشرة بسرعة؟', trait: 'collagen_low' },
  { id: 't2', q: 'هل تظهر عليكِ تصبغات بسهولة؟', trait: 'melanin_high' },
  { id: 't3', q: 'هل بشرتكِ حساسة وتحمر بسهولة؟', trait: 'sensitive_yes' },
  { id: 't4', q: 'هل تلاحظين علامات شيخوخة مبكرة؟', trait: 'oxidation_high' },
  { id: 't5', q: 'هل بشرتكِ تفقد مرونتها؟', trait: 'elasticity_low' },
];

export const dnaBeautyRouter = router({
  questions: customerProcedure.query(() => TRAIT_QUESTIONS),
  analyze: customerProcedure
    .input(z.object({ answers: z.record(z.string(), z.boolean()) }))
    .query(async ({ input }) => {
      const traits: string[] = [];
      for (const [qId, isYes] of Object.entries(input.answers)) {
        const q = TRAIT_QUESTIONS.find((t) => t.id === qId);
        if (q && isYes) traits.push(q.trait);
      }
      if (traits.length === 0) traits.push('collagen_low');

      const allRecs = new Set<string>();
      const allAvoids = new Set<string>();
      const routines: string[] = [];
      traits.forEach((t) => {
        const info = DNA_TRAITS[t];
        if (info) {
          info.recommendations.forEach((r) => allRecs.add(r));
          info.avoidProducts.forEach((a) => allAvoids.add(a));
          routines.push(info.bestRoutine);
        }
      });

      return {
        traits: traits.map((t) => ({ key: t, label: { collagen_low: 'كولاجين منخفض', melanin_high: 'ميلانين مرتفع', sensitive_yes: 'بشرة حساسة', oxidation_high: 'أكسدة مرتفعة', elasticity_low: 'مرونة منخفضة' }[t] ?? t })),
        recommendations: Array.from(allRecs),
        avoid: Array.from(allAvoids),
        routine: routines.join('\n'),
        score: Math.min(100, Math.round(traits.length * 20 + 50)),
      };
    }),

  myAnalyses: customerProcedure.query(({ ctx }) =>
    prisma.dnaAnalysis.findMany({ where: { userId: ctx.user.id }, orderBy: { createdAt: 'desc' }, take: 5 })
  ),
});
