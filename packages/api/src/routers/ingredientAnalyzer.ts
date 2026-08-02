import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { LARGE_PAGE_SIZE } from '@galaxy/shared';
import { customerProcedure, publicProcedure, router } from '../trpc';

const INGREDIENT_DB: Record<string, { rating: 'safe' | 'caution' | 'avoid'; descAr: string; descEn: string }> = {
  'Aqua': { rating: 'safe', descAr: 'ماء — آمن تماماً', descEn: 'Water — completely safe' },
  'Glycerin': { rating: 'safe', descAr: 'مرطب طبيعي — آمن ومناسب لجميع أنواع البشرة', descEn: 'Natural humectant — safe for all skin types' },
  'Tocopherol': { rating: 'safe', descAr: 'فيتامين E — مضاد أكسدة آمن', descEn: 'Vitamin E — safe antioxidant' },
  'Aloe Barbadensis': { rating: 'safe', descAr: 'ألوفيرا — مهدئ طبيعي', descEn: 'Aloe — natural soothing agent' },
  'Dimethicone': { rating: 'caution', descAr: 'سيليكون — قد يسد المسام لبعض أنواع البشرة', descEn: 'Silicone — may clog pores for some skin types' },
  'Sodium Lauryl Sulfate': { rating: 'avoid', descAr: 'كبريتات — قد تسبب جفاف وتهيج البشرة', descEn: 'Sulfate — may cause dryness and irritation' },
  'Parabens': { rating: 'avoid', descAr: 'مواد حافظة — مرتبطة بتهيج البشرة', descEn: 'Preservatives — linked to skin irritation' },
  'Fragrance': { rating: 'caution', descAr: 'عطور — قد تسبب حساسية', descEn: 'Fragrance — may cause allergies' },
  'Alcohol Denat': { rating: 'avoid', descAr: 'كحول — يجفف البشرة بشدة', descEn: 'Alcohol — severely drying' },
  'Hyaluronic Acid': { rating: 'safe', descAr: 'حمض الهيالورونيك — مرطب عميق آمن', descEn: 'Hyaluronic Acid — safe deep moisturizer' },
  'Niacinamide': { rating: 'safe', descAr: 'نياسيناميد — فيتامين B3 مفيد للبشرة', descEn: 'Niacinamide — Vitamin B3, beneficial' },
  'Retinol': { rating: 'caution', descAr: 'ريتينول — فعال لكنه قد يسبب تهيجاً', descEn: 'Retinol — effective but may irritate' },
  'Salicylic Acid': { rating: 'caution', descAr: 'حمض الساليسيليك — مقشر فعال قد يسبب جفاف', descEn: 'Salicylic Acid — exfoliant, may cause dryness' },
  'Zinc Oxide': { rating: 'safe', descAr: 'أكسيد الزنك — واقي شمس طبيعي آمن', descEn: 'Zinc Oxide — safe natural sunscreen' },
  'Titanium Dioxide': { rating: 'safe', descAr: 'ثاني أكسيد التيتانيوم — واقي شمس معدني آمن', descEn: 'Titanium Dioxide — safe mineral sunscreen' },
  'Mineral Oil': { rating: 'caution', descAr: 'زيت معدني — قد يسد المسام', descEn: 'Mineral Oil — may clog pores' },
  'Lanolin': { rating: 'caution', descAr: 'لانولين — قد يسبب حساسية للبشرة الحساسة', descEn: 'Lanolin — may cause sensitivity' },
  'Cetearyl Alcohol': { rating: 'safe', descAr: 'كحول دهني — آمن ومرطب', descEn: 'Fatty alcohol — safe and moisturizing' },
  'Panthenol': { rating: 'safe', descAr: 'بروفيتامين B5 — مرطب ومهدئ', descEn: 'Pro-vitamin B5 — moisturizing and soothing' },
  'Allantoin': { rating: 'safe', descAr: 'ألانتوين — مهدئ للبشرة', descEn: 'Allantoin — skin soothing' },
};

export const ingredientAnalyzerRouter = router({
  analyze: publicProcedure
    .input(z.object({ ingredients: z.string().min(1).max(5000) }))
    .query(async ({ input }) => {
      const raw = input.ingredients.split(/[,،\n]/).map((s) => s.trim()).filter(Boolean);
      const results = raw.map((ing) => {
        const found = INGREDIENT_DB[ing] ?? INGREDIENT_DB[Object.keys(INGREDIENT_DB).find((k) => k.toLowerCase() === ing.toLowerCase()) ?? ''] ?? { rating: 'safe' as const, descAr: 'لا توجد معلومات كافية', descEn: 'Insufficient data' };
        return { name: ing, ...found };
      });

      const safe = results.filter((r) => r.rating === 'safe').length;
      const caution = results.filter((r) => r.rating === 'caution').length;
      const avoid = results.filter((r) => r.rating === 'avoid').length;
      const score = Math.round(((safe + caution * 0.5) / Math.max(1, results.length)) * 100);

      return { ingredients: results, stats: { total: results.length, safe, caution, avoid, score } };
    }),

  scan: customerProcedure
    .input(z.object({ barcode: z.string(), productName: z.string(), safetyScore: z.number() }))
    .mutation(async ({ ctx, input }) =>
      prisma.ingredientScan.create({ data: { userId: ctx.user.id, ...input } })
    ),

  myScans: customerProcedure.query(({ ctx }) =>
    prisma.ingredientScan.findMany({ where: { userId: ctx.user.id }, orderBy: { createdAt: 'desc' }, take: LARGE_PAGE_SIZE })
  ),
});
