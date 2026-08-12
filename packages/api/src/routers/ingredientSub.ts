import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

const SUBSTITUTIONS: Record<
  string,
  Array<{ nameAr: string; nameEn: string; emoji: string; descAr: string }>
> = {
  Parabens: [
    {
      nameAr: 'فينوكسي إيثانول',
      nameEn: 'Phenoxyethanol',
      emoji: '',
      descAr: 'مادة حافظة آمنة معتمدة من الاتحاد الأوروبي',
    },
    {
      nameAr: 'سوربات البوتاسيوم',
      nameEn: 'Potassium Sorbate',
      emoji: '',
      descAr: 'حافظ طبيعي من أصل نباتي',
    },
  ],
  'Sodium Lauryl Sulfate': [
    {
      nameAr: 'كوكو غلوكوسايد',
      nameEn: 'Coco Glucoside',
      emoji: '',
      descAr: 'منظف لطيف من زيت جوز الهند',
    },
    {
      nameAr: 'صوديوم كوكويل إيسيثيونات',
      nameEn: 'Sodium Cocoyl Isethionate',
      emoji: '',
      descAr: 'منظف معتدل لا يسبب جفاف',
    },
  ],
  'Mineral Oil': [
    {
      nameAr: 'زيت الجوجوبا',
      nameEn: 'Jojoba Oil',
      emoji: '🫒',
      descAr: 'زيت طبيعي مشابه لزيوت البشرة',
    },
    {
      nameAr: 'سكوالين نباتي',
      nameEn: 'Plant Squalane',
      emoji: '',
      descAr: 'مرطب طبيعي خفيف لا يسد المسام',
    },
  ],
  'Alcohol Denat': [
    {
      nameAr: 'كحول سيتريل',
      nameEn: 'Cetearyl Alcohol',
      emoji: '',
      descAr: 'كحول دهني مرطب وآمن للبشرة',
    },
    { nameAr: 'جل الألوفيرا', nameEn: 'Aloe Vera Gel', emoji: '', descAr: 'مرطب طبيعي مهدئ' },
  ],
  Fragrance: [
    {
      nameAr: 'زيوت عطرية طبيعية',
      nameEn: 'Essential Oils',
      emoji: '',
      descAr: 'عطور من مصادر نباتية طبيعية',
    },
    {
      nameAr: 'منتجات خالية من العطور',
      nameEn: 'Fragrance-Free',
      emoji: '',
      descAr: 'مناسبة للبشرة الحساسة',
    },
  ],
};

export const ingredientSubRouter = router({
  list: publicProcedure.query(() =>
    Object.entries(SUBSTITUTIONS).map(([ingredient, subs]) => ({ ingredient, subs })),
  ),
  find: publicProcedure.input(z.object({ ingredient: z.string() })).query(async ({ input }) => {
    const key = Object.keys(SUBSTITUTIONS).find((k) =>
      k.toLowerCase().includes(input.ingredient.toLowerCase()),
    );
    return key
      ? { ingredient: key, subs: SUBSTITUTIONS[key] }
      : { ingredient: input.ingredient, subs: [] };
  }),
});
