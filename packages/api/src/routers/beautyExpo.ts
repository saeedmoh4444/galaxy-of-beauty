import { publicProcedure, router } from '../trpc';

const BOOTHS = [
  { id: 1, brand: 'La Roche-Posay', category: 'skincare', description: 'اكتشفي أحدث منتجات العناية بالبشرة من لاروش بوزيه', products: ['واقي شمس', 'سيروم', 'غسول'], emoji: '🧴', visitors: 1250 },
  { id: 2, brand: 'MAC Cosmetics', category: 'makeup', description: 'تشكيلة ألوان جديدة لصيف ٢٠٢٦', products: ['أحمر شفاه', 'ظلال عيون', 'كريم أساس'], emoji: '💄', visitors: 2300 },
  { id: 3, brand: 'Organic Beauty', category: 'natural', description: 'منتجات طبيعية ١٠٠٪ خالية من المواد الكيميائية', products: ['زيوت طبيعية', 'أقنعة وجه', 'شامبو'], emoji: '🌿', visitors: 890 },
  { id: 4, brand: 'Moroccan Pure', category: 'hair', description: 'زيوت الأرغان المغربية الأصلية ومنتجات العناية بالشعر', products: ['زيت أرغان', 'بلسم', 'ماسك شعر'], emoji: '🫒', visitors: 670 },
  { id: 5, brand: 'Dior Beauty', category: 'luxury', description: 'أحدث إصدارات عطور ومكياج ديور', products: ['عطر', 'أحمر شفاه', 'ماسكارا'], emoji: '🌸', visitors: 1800 },
];

export const beautyExpoRouter = router({
  booths: publicProcedure.query(() => BOOTHS),
  categories: publicProcedure.query(() => ['skincare', 'makeup', 'natural', 'hair', 'luxury']),
});
