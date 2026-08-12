import { z } from 'zod';
import { customerProcedure, router } from '../trpc';

const PRODUCTS = [
  { id: 1, nameAr: 'واقي شمس SPF50', emoji: '️', price: 120, deliveryTime: 'خلال ساعتين' },
  { id: 2, nameAr: 'سيروم فيتامين C', emoji: '', price: 145, deliveryTime: 'خلال ساعة' },
  { id: 3, nameAr: 'مرطب يومي', emoji: '', price: 89, deliveryTime: 'خلال ساعتين' },
  { id: 4, nameAr: 'زيت شعر طبيعي', emoji: '🫒', price: 95, deliveryTime: 'خلال ساعة' },
];

export const lastMileDeliveryRouter = router({
  products: customerProcedure.query(() => PRODUCTS),
  estimate: customerProcedure
    .input(z.object({ productId: z.number(), address: z.string() }))
    .query(async ({ input }) => {
      const product = PRODUCTS.find((p) => p.id === input.productId);
      return {
        product: product?.nameAr,
        price: product?.price,
        deliveryFee: 15,
        total: (product?.price ?? 0) + 15,
        estimatedDelivery: product?.deliveryTime ?? 'خلال ساعتين',
        address: input.address,
      };
    }),
  order: customerProcedure
    .input(
      z.object({
        productId: z.number(),
        address: z.string(),
        paymentMethod: z.enum(['wallet', 'cod']),
      }),
    )
    .mutation(async ({ input }) => {
      const product = PRODUCTS.find((p) => p.id === input.productId);
      return {
        orderId: `LMD-${Date.now()}`,
        product: product?.nameAr,
        status: 'CONFIRMED',
        estimatedDelivery: product?.deliveryTime,
        trackingUrl: 'https://delivery-track.example.com/order/123',
        total: (product?.price ?? 0) + 15,
      };
    }),
});
