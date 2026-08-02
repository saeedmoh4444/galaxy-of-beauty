import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

const PRODUCT_CATALOG = [
  { id: 1, nameAr: 'كريم ترطيب يومي', nameEn: 'Daily Moisturizer', price: 89, category: 'skincare', emoji: '🧴' },
  { id: 2, nameAr: 'سيروم فيتامين C', nameEn: 'Vitamin C Serum', price: 129, category: 'skincare', emoji: '✨' },
  { id: 3, nameAr: 'قناع وجه طبيعي', nameEn: 'Natural Face Mask', price: 59, category: 'skincare', emoji: '🎭' },
  { id: 4, nameAr: 'أحمر شفاه مطفي', nameEn: 'Matte Lipstick', price: 75, category: 'makeup', emoji: '💄' },
  { id: 5, nameAr: 'ماسكارا مقاومة للماء', nameEn: 'Waterproof Mascara', price: 95, category: 'makeup', emoji: '👁️' },
  { id: 6, nameAr: 'زيت شعر طبيعي', nameEn: 'Natural Hair Oil', price: 65, category: 'hair', emoji: '💆‍♀️' },
  { id: 7, nameAr: 'شامبو خالي من الكبريتات', nameEn: 'Sulfate-Free Shampoo', price: 85, category: 'hair', emoji: '🧴' },
  { id: 8, nameAr: 'مجموعة العناية بالأظافر', nameEn: 'Nail Care Set', price: 110, category: 'nails', emoji: '💅' },
];

export const boxBuilderRouter = router({
  catalog: customerProcedure.query(() => PRODUCT_CATALOG),

  build: customerProcedure
    .input(z.object({ name: z.string().min(1), productIds: z.array(z.number()).min(3).max(6), frequency: z.enum(['monthly', 'quarterly']), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const selected = PRODUCT_CATALOG.filter((p) => input.productIds.includes(p.id));
      const subtotal = selected.reduce((s, p) => s + p.price, 0);
      const discount = input.frequency === 'monthly' ? Math.round(subtotal * 0.15) : Math.round(subtotal * 0.1);
      const box = await prisma.beautyBox.create({ data: { userId: ctx.user.id, name: input.name, products: selected, frequency: input.frequency, subtotal, discount, total: subtotal - discount } });
      return { boxId: `BOX-${box.id}`, name: input.name, products: selected, subtotal, discount, total: subtotal - discount, frequency: input.frequency };
    }),

  myBoxes: customerProcedure.query(({ ctx }) =>
    prisma.beautyBox.findMany({ where: { userId: ctx.user.id }, orderBy: { createdAt: 'desc' } })
  ),
});
