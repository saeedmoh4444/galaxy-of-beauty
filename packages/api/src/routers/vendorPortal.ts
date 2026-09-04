import { z } from 'zod';
import { customerProcedure, router } from '../trpc';

export interface VendorPortalProduct {
  id: number;
  vendorId: number;
  nameAr: string;
  price: number;
  stock: number;
  sales: number;
  emoji: string;
  active: boolean;
}
type VendorProduct = VendorPortalProduct;
const products: VendorProduct[] = [];
let vpId = 1;

const DASHBOARD = { totalProducts: 0, totalSales: 0, revenue: 0, pendingOrders: 0, rating: 4.8 };

export const vendorPortalRouter = router({
  dashboard: customerProcedure.query(() => ({
    ...DASHBOARD,
    totalProducts: products.length,
    totalSales: products.reduce((s, p) => s + p.sales, 0),
    // Revenue = Σ price × sales — the only derivable metric from the
    // in-memory catalog. Full persistence/orders are tracked in the
    // mobile fix plan (vendorPortal → DB).
    revenue: products.reduce((s, p) => s + p.price * p.sales, 0),
  })),
  myProducts: customerProcedure.query(async ({ ctx }) =>
    products.filter((p) => p.vendorId === ctx.user.id),
  ),
  addProduct: customerProcedure
    .input(
      z.object({
        nameAr: z.string().min(1),
        price: z.number().min(1),
        stock: z.number().min(0).default(10),
        emoji: z.string().default(''),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const p: VendorProduct = {
        id: vpId++,
        vendorId: ctx.user.id,
        nameAr: input.nameAr,
        price: input.price,
        stock: input.stock,
        sales: 0,
        emoji: input.emoji,
        active: true,
      };
      products.push(p);
      return p;
    }),
  deleteProduct: customerProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const idx = products.findIndex((p) => p.id === input.id && p.vendorId === ctx.user.id);
      if (idx >= 0) products.splice(idx, 1);
      return { success: true };
    }),
});
