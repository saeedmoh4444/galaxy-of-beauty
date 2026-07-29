import { z } from 'zod';
import { customerProcedure, publicProcedure, router } from '../trpc';

// Curated beauty product database with ingredient safety info
const PRODUCTS = [
  { barcode: '6291101234568', nameAr: 'كريم ترطيب يومي', nameEn: 'Daily Moisturizer', brand: 'Nivea', category: 'skincare', imageUrl: null, safetyScore: 92, concerns: [], ingredients: ['Aqua', 'Glycerin', 'Cetearyl Alcohol', 'Dimethicone', 'Panthenol', 'Tocopherol'], allergens: [] },
  { barcode: '6291102345678', nameAr: 'واقي شمس SPF50', nameEn: 'Sunscreen SPF50', brand: 'La Roche-Posay', category: 'skincare', imageUrl: null, safetyScore: 95, concerns: [], ingredients: ['Aqua', 'Homosalate', 'Octocrylene', 'Ethylhexyl Salicylate', 'Glycerin', 'Titanium Dioxide'], allergens: [] },
  { barcode: '6291103456789', nameAr: 'أحمر شفاه مطفي', nameEn: 'Matte Lipstick', brand: 'MAC', category: 'makeup', imageUrl: null, safetyScore: 85, concerns: ['عطور صناعية'], ingredients: ['Ricinus Communis Oil', 'Caprylic/Capric Triglyceride', 'Candelilla Cera', 'Tocopherol', 'Fragrance'], allergens: ['Fragrance'] },
  { barcode: '6291104567890', nameAr: 'سيروم فيتامين C', nameEn: 'Vitamin C Serum', brand: 'The Ordinary', category: 'skincare', imageUrl: null, safetyScore: 98, concerns: [], ingredients: ['Ascorbic Acid', 'Aqua', 'Glycerin', 'Tocopherol', 'Ferulic Acid'], allergens: [] },
  { barcode: '6291105678901', nameAr: 'ماسكارا مقاومة للماء', nameEn: 'Waterproof Mascara', brand: 'Maybelline', category: 'makeup', imageUrl: null, safetyScore: 78, concerns: ['بارابين', 'عطور'], ingredients: ['Aqua', 'Paraffin', 'Copernicia Cerifera Cera', 'Parabens', 'Fragrance'], allergens: ['Parabens', 'Fragrance'] },
  { barcode: '6291106789012', nameAr: 'زيت شعر طبيعي', nameEn: 'Natural Hair Oil', brand: 'Organic', category: 'hair', imageUrl: null, safetyScore: 99, concerns: [], ingredients: ['Argania Spinosa Oil', 'Cocos Nucifera Oil', 'Simmondsia Chinensis Oil', 'Tocopherol'], allergens: [] },
  { barcode: '6291107890123', nameAr: 'تونر ماء الورد', nameEn: 'Rose Water Toner', brand: 'Herbal', category: 'skincare', imageUrl: null, safetyScore: 97, concerns: [], ingredients: ['Rosa Damascena Flower Water', 'Aqua', 'Glycerin', 'Aloe Barbadensis Extract'], allergens: [] },
  { barcode: '6291108901234', nameAr: 'مقشر الوجه', nameEn: 'Face Scrub', brand: 'St. Ives', category: 'skincare', imageUrl: null, safetyScore: 65, concerns: ['جزيئات خشنة', 'قد تسبب تهيج'], ingredients: ['Aqua', 'Juglans Regia Shell Powder', 'Glycerin', 'Cetearyl Alcohol', 'Fragrance'], allergens: ['Fragrance'] },
];

const ALTERNATIVES = [
  { id: 1, nameAr: 'مرطب عضوي خالي من العطور', nameEn: 'Organic Fragrance-Free Moisturizer', price: 95, brand: 'Organic Beauty', emoji: '🧴' },
  { id: 2, nameAr: 'سيروم حمض الهيالورونيك', nameEn: 'Hyaluronic Acid Serum', price: 145, brand: 'Pure Glow', emoji: '✨' },
  { id: 3, nameAr: 'أحمر شفاه طبيعي', nameEn: 'Natural Lipstick', price: 85, brand: 'Clean Beauty', emoji: '💄' },
  { id: 4, nameAr: 'زيت الأرغان العضوي', nameEn: 'Organic Argan Oil', price: 120, brand: 'Moroccan Pure', emoji: '🫒' },
];

const SAFETY_TIPS: Record<string, string> = {
  Parabens: 'البارابين مواد حافظة قد تسبب تهيج البشرة الحساسة',
  Fragrance: 'العطور قد تسبب حساسية لبعض أنواع البشرة',
  'Sodium Lauryl Sulfate': 'قد يسبب جفاف البشرة والشعر',
  Alcohol: 'الكحول قد يجفف البشرة',
  'Mineral Oil': 'قد يسد المسام لبعض أنواع البشرة',
};

export const productScannerRouter = router({
  // Lookup product by barcode
  lookup: publicProcedure
    .input(z.object({ barcode: z.string().min(8).max(20) }))
    .query(async ({ input }) => {
      const product = PRODUCTS.find((p) => p.barcode === input.barcode);
      if (!product) return { found: false, message: 'المنتج غير موجود في قاعدة البيانات' };

      const safetyDetails = product.concerns.map((c) => ({
        concern: c,
        tip: SAFETY_TIPS[c] ?? 'قد يسبب حساسية لبعض أنواع البشرة',
      }));

      return {
        found: true,
        product: { ...product, safetyDetails },
        alternatives: ALTERNATIVES.slice(0, 3),
      };
    }),

  // Search by name
  search: publicProcedure
    .input(z.object({ query: z.string().min(2) }))
    .query(async ({ input }) => {
      const q = input.query.toLowerCase();
      return PRODUCTS.filter(
        (p) =>
          p.nameAr.includes(q) ||
          p.nameEn.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.ingredients.some((i) => i.toLowerCase().includes(q)),
      );
    }),

  // Ingredient safety info
  checkIngredient: publicProcedure
    .input(z.object({ ingredient: z.string() }))
    .query(async ({ input }) => {
      const name = input.ingredient.trim();
      const tip = SAFETY_TIPS[name] ?? 'لا توجد معلومات كافية عن هذه المادة';
      const isSafe = !Object.keys(SAFETY_TIPS).some((k) => k.toLowerCase() === name.toLowerCase());
      return { ingredient: name, safe: isSafe, tip };
    }),
});
