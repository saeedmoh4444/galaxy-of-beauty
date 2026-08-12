import { z } from 'zod';
import { customerProcedure, publicProcedure, router } from '../trpc';

const LOOKS = [
  {
    id: 1,
    titleAr: 'إطلالة سهرة ناعمة',
    titleEn: 'Soft Evening Look',
    category: 'evening',
    style: 'ناعم',
    dominantColors: ['#D4737C', '#C4A38C', '#E8D5B7'],
    products: ['أحمر شفاه وردي', 'ظلال شامبين'],
    tutorialId: 1,
    imageUrl: null,
    rating: 4.8,
  },
  {
    id: 2,
    titleAr: 'مكياج عيون سموكي',
    titleEn: 'Smokey Eye Glam',
    category: 'party',
    style: 'جريء',
    dominantColors: ['#6B4423', '#1B2A4A', '#C41E3A'],
    products: ['ظلال بني', 'كحل أسود'],
    tutorialId: 7,
    imageUrl: null,
    rating: 4.9,
  },
  {
    id: 3,
    titleAr: 'إطلالة طبيعية يومية',
    titleEn: 'Natural Daily Look',
    category: 'daily',
    style: 'طبيعي',
    dominantColors: ['#DEB6AB', '#F2A0B6', '#CD853F'],
    products: ['كريم BB', 'أحمر خدود وردي'],
    tutorialId: null,
    imageUrl: null,
    rating: 4.7,
  },
  {
    id: 4,
    titleAr: 'مكياج عروس راقي',
    titleEn: 'Elegant Bridal Makeup',
    category: 'bridal',
    style: 'راقي',
    dominantColors: ['#D4A843', '#B76E79', '#F2A0B6'],
    products: ['هايلايتر ذهبي', 'أحمر شفاه نود'],
    tutorialId: 2,
    imageUrl: null,
    rating: 5.0,
  },
  {
    id: 5,
    titleAr: 'إطلالة صيفية منعشة',
    titleEn: 'Fresh Summer Look',
    category: 'summer',
    style: 'منعش',
    dominantColors: ['#E8735A', '#F4A460', '#E8D5B7'],
    products: ['أحمر شفاه مرجاني', 'برونزر'],
    tutorialId: null,
    imageUrl: null,
    rating: 4.6,
  },
  {
    id: 6,
    titleAr: 'مكياج خليجي تقليدي',
    titleEn: 'Traditional Khaleeji',
    category: 'traditional',
    style: 'خليجي',
    dominantColors: ['#673147', '#D4A843', '#C41E3A'],
    products: ['كحل عربي', 'أحمر شفاه غامق'],
    tutorialId: null,
    imageUrl: null,
    rating: 4.9,
  },
  {
    id: 7,
    titleAr: 'إطلالة شتوية دافئة',
    titleEn: 'Warm Winter Look',
    category: 'winter',
    style: 'دافئ',
    dominantColors: ['#722F37', '#8B6914', '#6B4423'],
    products: ['أحمر شفاه عنابي', 'ظلال برونزي'],
    tutorialId: null,
    imageUrl: null,
    rating: 4.5,
  },
  {
    id: 8,
    titleAr: 'مكياج مائي خفيف',
    titleEn: 'Light Dewy Makeup',
    category: 'daily',
    style: 'خفيف',
    dominantColors: ['#F2A0B6', '#C4A38C', '#DEB6AB'],
    products: ['جل مرطب', 'تينت شفاه'],
    tutorialId: null,
    imageUrl: null,
    rating: 4.8,
  },
];

const CATEGORIES = [
  { key: 'daily', nameAr: 'يومي', emoji: '️' },
  { key: 'evening', nameAr: 'سهرة', emoji: '' },
  { key: 'party', nameAr: 'حفلات', emoji: '' },
  { key: 'bridal', nameAr: 'عرايس', emoji: '' },
  { key: 'summer', nameAr: 'صيفي', emoji: '' },
  { key: 'winter', nameAr: 'شتوي', emoji: '️' },
  { key: 'traditional', nameAr: 'تقليدي', emoji: '' },
];

// Simple color matching: Euclidean distance in RGB space
function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function colorDistance(a: string, b: string): number {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

export const styleMatchRouter = router({
  looks: publicProcedure.query(() => ({ looks: LOOKS, categories: CATEGORIES })),

  match: customerProcedure
    .input(z.object({ colors: z.array(z.string()).min(1).max(5), category: z.string().optional() }))
    .mutation(async ({ input }) => {
      let pool = LOOKS;
      if (input.category) pool = pool.filter((l) => l.category === input.category);

      const scored = pool.map((look) => {
        let score = 0;
        for (const userColor of input.colors) {
          let minDist = Infinity;
          for (const lookColor of look.dominantColors) {
            const dist = colorDistance(userColor, lookColor);
            if (dist < minDist) minDist = dist;
          }
          score += Math.max(0, 100 - minDist);
        }
        const matchPct = Math.min(100, Math.round(score / input.colors.length));
        return { ...look, matchPct };
      });

      return scored.sort((a, b) => b.matchPct - a.matchPct).slice(0, 6);
    }),

  byId: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const look = LOOKS.find((l) => l.id === input.id);
    if (!look) throw new Error('الإطلالة غير موجودة');
    return look;
  }),
});
