import { z } from 'zod';
import { customerProcedure, publicProcedure, router } from '../trpc';

const AWARDS = {
  month: 'يوليو ٢٠٢٦',
  categories: [
    { key: 'best_makeup', nameAr: 'أفضل فنية مكياج', emoji: '💄', nominees: [{ id: 1, name: 'نورة العمري', votes: 450 }, { id: 2, name: 'سارة الحربي', votes: 320 }] },
    { key: 'best_skincare', nameAr: 'أفضل فنية عناية', emoji: '✨', nominees: [{ id: 3, name: 'د. ليلى القحطاني', votes: 520 }, { id: 4, name: 'مريم الشمري', votes: 280 }] },
    { key: 'best_transform', nameAr: 'أفضل تحول', emoji: '📸', nominees: [{ id: 5, name: 'ريم', votes: 380, desc: 'تحول مكياج عرايس' }, { id: 6, name: 'مها', votes: 310, desc: 'عناية بالبشرة ٣ أشهر' }] },
    { key: 'best_newcomer', nameAr: 'أفضل فنية جديدة', emoji: '🌱', nominees: [{ id: 7, name: 'هند المطيري', votes: 290 }, { id: 8, name: 'أمل الشهري', votes: 210 }] },
  ],
};

export const beautyAwardsRouter = router({
  current: publicProcedure.query(() => AWARDS),
  vote: customerProcedure
    .input(z.object({ category: z.string(), nomineeId: z.number() }))
    .mutation(async ({ input }) => {
      for (const cat of AWARDS.categories) {
        if (cat.key === input.category) {
          const nominee = cat.nominees.find((n) => n.id === input.nomineeId);
          if (nominee) { nominee.votes += 1; return { voted: true, nomineeName: nominee.name, votes: nominee.votes }; }
        }
      }
      throw new Error('غير موجود');
    }),
});
