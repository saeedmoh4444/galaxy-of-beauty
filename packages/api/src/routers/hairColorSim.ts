import { z } from 'zod';
import { customerProcedure, publicProcedure, router } from '../trpc';

const HAIR_COLORS = [
  { id: 'black', nameAr: 'أسود', hex: '#1A1A1A', category: 'dark' },
  { id: 'dark_brown', nameAr: 'بني غامق', hex: '#3B2314', category: 'dark' },
  { id: 'chestnut', nameAr: 'كستنائي', hex: '#6B3A2A', category: 'warm' },
  { id: 'auburn', nameAr: 'أوبورن', hex: '#8B3A3A', category: 'warm' },
  { id: 'copper', nameAr: 'نحاسي', hex: '#C47A3A', category: 'warm' },
  { id: 'honey_blonde', nameAr: 'أشقر عسلي', hex: '#C4A45A', category: 'light' },
  { id: 'platinum', nameAr: 'بلاتيني', hex: '#E8E0D0', category: 'light' },
  { id: 'burgundy', nameAr: 'عنابي', hex: '#6B1A2A', category: 'bold' },
  { id: 'ash_grey', nameAr: 'رمادي', hex: '#8A8A8A', category: 'bold' },
  { id: 'chocolate', nameAr: 'شوكولاتة', hex: '#4A2A1A', category: 'dark' },
  { id: 'caramel', nameAr: 'كراميل', hex: '#B8860B', category: 'warm' },
  { id: 'rose_gold', nameAr: 'روز قولد', hex: '#B76E79', category: 'bold' },
];

export const hairColorSimRouter = router({
  colors: publicProcedure.query(() => HAIR_COLORS),
  save: customerProcedure
    .input(z.object({ colorId: z.string(), imageUrl: z.string().optional() }))
    .mutation(async ({ input }) => {
      const color = HAIR_COLORS.find((c) => c.id === input.colorId);
      return { saved: true, color: color?.nameAr, colorHex: color?.hex };
    }),
});
