import { prisma } from '@galaxy/db';
import type { Prisma } from '@galaxy/db';
import { TRPCError } from '@trpc/server';

// Shared cart → StoreOrder placement used by marketplace.buyCart (no
// checkout) and payments.payCart (with a StoreCheckout shipping+payment
// record). One StoreOrder per vendor; stock decrement + sales increments
// happen inside the caller's transaction so payment stays atomic with
// order placement.

export interface CartLine {
  productId: number;
  quantity: number;
  unitPrice: number;
  vendorId: number;
  name: string;
  stock: number;
}

/**
 * Validate the caller's cart: empty cart and insufficient stock reject
 * the whole purchase and the cart is kept for correction.
 */
export async function readCartForCheckout(userId: number): Promise<CartLine[]> {
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: { select: { id: true, price: true, stock: true, vendorId: true, nameJson: true } },
    },
  });

  if (cartItems.length === 0) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cart is empty' });
  }

  const shortage = cartItems.find((i) => i.product.stock < i.quantity);
  if (shortage) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `Insufficient stock for product #${shortage.productId} (available: ${shortage.product.stock})`,
    });
  }

  return cartItems.map((i) => ({
    productId: i.productId,
    quantity: i.quantity,
    unitPrice: Number(i.product.price),
    vendorId: i.product.vendorId,
    name:
      (i.product.nameJson as { en?: string; ar?: string } | null)?.en ?? `Product #${i.productId}`,
    stock: i.product.stock,
  }));
}

/**
 * Place StoreOrders (one per vendor) + stock/sales updates + cart clear.
 * Must run inside a `prisma.$transaction` supplied by the caller.
 */
export async function placeStoreOrders(
  tx: Prisma.TransactionClient,
  userId: number,
  lines: CartLine[],
  checkoutId?: number,
): Promise<{ subtotal: number; itemCount: number }> {
  const byVendor = new Map<number, { amount: number; items: number }>();
  let subtotal = 0;
  let itemCount = 0;

  for (const line of lines) {
    const amount = line.unitPrice * line.quantity;
    subtotal += amount;
    itemCount += line.quantity;

    await tx.product.update({
      where: { id: line.productId },
      data: {
        stock: { decrement: line.quantity },
        sales: { increment: line.quantity },
      },
    });
    await tx.vendor.update({
      where: { id: line.vendorId },
      data: { totalSales: { increment: amount } },
    });

    const agg = byVendor.get(line.vendorId) ?? { amount: 0, items: 0 };
    agg.amount += amount;
    agg.items += line.quantity;
    byVendor.set(line.vendorId, agg);
  }

  for (const [vendorId, agg] of byVendor) {
    await tx.storeOrder.create({
      data: {
        vendorId,
        customerId: userId,
        checkoutId,
        totalAmount: agg.amount,
        itemCount: agg.items,
        status: 'PENDING_FULFILLMENT',
      },
    });
  }

  await tx.cartItem.deleteMany({ where: { userId } });

  return { subtotal, itemCount };
}
