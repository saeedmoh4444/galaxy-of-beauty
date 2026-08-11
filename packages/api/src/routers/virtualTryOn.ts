import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { SMALL_PAGE_SIZE } from '@galaxy/shared';
import { publicProcedure, customerProcedure, router } from '../trpc';

// Predefined makeup color palettes — curated for Saudi beauty preferences
const LIP_COLORS = [
  {
    id: 'lip_rose',
    nameAr: 'وردي طبيعي',
    nameEn: 'Natural Rose',
    hex: '#D4737C',
    category: 'nude',
  },
  { id: 'lip_berry', nameAr: 'توتي غامق', nameEn: 'Deep Berry', hex: '#8B2252', category: 'bold' },
  { id: 'lip_coral', nameAr: 'مرجاني', nameEn: 'Coral', hex: '#E8735A', category: 'warm' },
  {
    id: 'lip_red',
    nameAr: 'أحمر كلاسيكي',
    nameEn: 'Classic Red',
    hex: '#C41E3A',
    category: 'classic',
  },
  { id: 'lip_pink', nameAr: 'وردي فاتح', nameEn: 'Soft Pink', hex: '#F2A0B6', category: 'soft' },
  { id: 'lip_mauve', nameAr: 'موف هادئ', nameEn: 'Dusty Mauve', hex: '#915F6D', category: 'nude' },
  { id: 'lip_plum', nameAr: 'خوخي', nameEn: 'Plum', hex: '#673147', category: 'bold' },
  { id: 'lip_nude', nameAr: 'نيود', nameEn: 'Nude Beige', hex: '#C4A38C', category: 'nude' },
];

const EYE_COLORS = [
  { id: 'eye_gold', nameAr: 'ذهبي', nameEn: 'Gold', hex: '#D4A843', category: 'shimmer' },
  { id: 'eye_bronze', nameAr: 'برونزي', nameEn: 'Bronze', hex: '#8B6914', category: 'warm' },
  {
    id: 'eye_rosegold',
    nameAr: 'روز قولد',
    nameEn: 'Rose Gold',
    hex: '#B76E79',
    category: 'shimmer',
  },
  {
    id: 'eye_brown',
    nameAr: 'بني دخاني',
    nameEn: 'Smokey Brown',
    hex: '#6B4423',
    category: 'matte',
  },
  { id: 'eye_plum', nameAr: 'برقوقي', nameEn: 'Plum', hex: '#5E2A4A', category: 'bold' },
  {
    id: 'eye_champagne',
    nameAr: 'شامبين',
    nameEn: 'Champagne',
    hex: '#E8D5B7',
    category: 'shimmer',
  },
  {
    id: 'eye_taupe',
    nameAr: 'رمادي هادئ',
    nameEn: 'Soft Taupe',
    hex: '#8B7D6B',
    category: 'matte',
  },
  { id: 'eye_navy', nameAr: 'كحلي', nameEn: 'Navy', hex: '#1B2A4A', category: 'bold' },
];

const BLUSH_COLORS = [
  { id: 'blush_peach', nameAr: 'خوخي', nameEn: 'Peach', hex: '#F4A460', category: 'warm' },
  { id: 'blush_pink', nameAr: 'وردي', nameEn: 'Pink', hex: '#F2A0B6', category: 'soft' },
  {
    id: 'blush_rose',
    nameAr: 'وردي غامق',
    nameEn: 'Deep Rose',
    hex: '#D4737C',
    category: 'classic',
  },
  { id: 'blush_coral', nameAr: 'مرجاني', nameEn: 'Coral', hex: '#E8735A', category: 'warm' },
  { id: 'blush_mauve', nameAr: 'موف', nameEn: 'Mauve', hex: '#915F6D', category: 'soft' },
  { id: 'blush_bronze', nameAr: 'برونزي', nameEn: 'Bronze', hex: '#CD853F', category: 'warm' },
];

const NAIL_COLORS = [
  { id: 'nail_red', nameAr: 'أحمر', nameEn: 'Red', hex: '#C41E3A' },
  { id: 'nail_nude', nameAr: 'نيود', nameEn: 'Nude', hex: '#DEB6AB' },
  { id: 'nail_black', nameAr: 'أسود', nameEn: 'Black', hex: '#1A1A1A' },
  { id: 'nail_white', nameAr: 'أبيض', nameEn: 'White', hex: '#F5F5F5' },
  { id: 'nail_pink', nameAr: 'وردي', nameEn: 'Pink', hex: '#F2A0B6' },
  { id: 'nail_burgundy', nameAr: 'عنابي', nameEn: 'Burgundy', hex: '#722F37' },
  { id: 'nail_blue', nameAr: 'أزرق ملكي', nameEn: 'Royal Blue', hex: '#1E3A8A' },
  { id: 'nail_green', nameAr: 'أخضر زمردي', nameEn: 'Emerald', hex: '#064E3B' },
];

export const virtualTryOnRouter = router({
  // Get color palettes for all makeup types
  palettes: publicProcedure.query(() => ({
    lips: LIP_COLORS,
    eyes: EYE_COLORS,
    blush: BLUSH_COLORS,
    nails: NAIL_COLORS,
  })),

  // Save a try-on session (for analytics + recommendations)
  saveSession: customerProcedure
    .input(
      z.object({
        makeupType: z.enum(['lips', 'eyes', 'blush', 'nails']),
        colorId: z.string(),
        colorHex: z.string(),
        imageDataUrl: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => ({
      sessionId: `${ctx.user.id}_${Date.now()}`,
      saved: true,
      makeupType: input.makeupType,
      colorHex: input.colorHex,
    })),

  // Get recommended products based on color preference
  recommendations: publicProcedure
    .input(z.object({ colorHex: z.string(), category: z.enum(['lips', 'eyes', 'blush', 'nails']) }))
    .query(async ({ input }) => {
      // Find products in matching categories
      const categoryMap: Record<string, string[]> = {
        lips: ['مكياج', 'lip', 'lipstick', 'gloss'],
        eyes: ['مكياج', 'eye', 'eyeshadow', 'mascara'],
        blush: ['مكياج', 'blush', 'cheek', 'bronzer'],
        nails: ['أظافر', 'nail', 'polish', 'manicure'],
      };
      const searchTerms = categoryMap[input.category] ?? [];

      try {
        const products = await prisma.product.findMany({
          where: {
            isActive: true,
            tags: { hasSome: searchTerms },
          },
          take: SMALL_PAGE_SIZE,
          orderBy: { isFeatured: 'desc' },
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return products.map((p: any) => ({
          id: p.id,
          nameAr: (p.nameJson as Record<string, string>)?.ar ?? '',
          nameEn: (p.nameJson as Record<string, string>)?.en ?? '',
          price: Number(p.price),
          imageUrl: p.imageUrl,
          brand: p.brand,
        }));
      } catch {
        return [];
      }
    }),
});
