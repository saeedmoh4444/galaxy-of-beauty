import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, customerProcedure, router } from '../trpc';

const DEFAULT_TERMS = [
  { ar: 'مكياج', en: 'Makeup', emoji: '💄' },
  { ar: 'عناية بالبشرة', en: 'Skincare', emoji: '🧴' },
  { ar: 'حناء', en: 'Henna', emoji: '🤚' },
  { ar: 'عطر', en: 'Perfume', emoji: '🌸' },
  { ar: 'زيت', en: 'Oil', emoji: '🫒' },
  { ar: 'جمال', en: 'Beauty', emoji: '✨' },
];

export const languageExchangeRouter = router({
  getTerms: publicProcedure
    .input(z.object({ fromLang: z.enum(['ar', 'en']).default('ar'), toLang: z.enum(['ar', 'en']).default('en') }))
    .query(async ({ input }) => {
      const custom = await prisma.beautyTerm.findMany({ take: 50 });
      const terms = custom.length > 0 ? custom : DEFAULT_TERMS.map((t) => ({ ar: t.ar, en: t.en, emoji: t.emoji }));
      return { terms, fromLang: input.fromLang, toLang: input.toLang };
    }),

  suggest: customerProcedure
    .input(z.object({ ar: z.string().min(1).max(100), en: z.string().min(1).max(100), emoji: z.string().default('📝') }))
    .mutation(async ({ input }) => {
      return prisma.beautyTerm.create({ data: { ar: input.ar, en: input.en, emoji: input.emoji } });
    }),

  search: publicProcedure
    .input(z.object({ query: z.string().min(1).max(100), lang: z.enum(['ar', 'en']).default('ar') }))
    .query(async ({ input }) => {
      const where = input.lang === 'ar' ? { ar: { contains: input.query } } : { en: { contains: input.query } };
      return prisma.beautyTerm.findMany({ where, take: 10 });
    }),
});
