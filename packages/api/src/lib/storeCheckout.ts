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
  /** B0 — bilingual name snapshot for StoreOrderItem.nameSnapshot. */
  nameJson: { ar?: string; en?: string } | null;
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
    nameJson: (i.product.nameJson as { en?: string; ar?: string } | null) ?? null,
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
  const vendorLines = new Map<
    number,
    {
      amount: number;
      items: number;
      lines: Array<{
        productId: number;
        quantity: number;
        unitPrice: number;
        nameJson: CartLine['nameJson'];
      }>;
    }
  >();
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

    const agg = vendorLines.get(line.vendorId) ?? { amount: 0, items: 0, lines: [] };
    agg.amount += amount;
    agg.items += line.quantity;
    agg.lines.push({
      productId: line.productId,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      nameJson: line.nameJson,
    });
    vendorLines.set(line.vendorId, agg);
  }

  for (const [vendorId, agg] of vendorLines) {
    const order = await tx.storeOrder.create({
      data: {
        vendorId,
        customerId: userId,
        checkoutId,
        totalAmount: agg.amount,
        itemCount: agg.items,
        status: 'PENDING_FULFILLMENT',
      },
    });

    // B0 — per-line snapshot (name + price at purchase time) so order
    // detail, cancellation restores and ZATCA line items don't depend on
    // live product rows.
    if (agg.lines.length > 0) {
      await tx.storeOrderItem.createMany({
        data: agg.lines.map((l) => ({
          orderId: order.id,
          productId: l.productId,
          nameSnapshot: (l.nameJson ?? {}) as unknown as Prisma.InputJsonValue,
          priceSnapshot: l.unitPrice,
          quantity: l.quantity,
        })),
      });
    }
  }

  await tx.cartItem.deleteMany({ where: { userId } });

  return { subtotal, itemCount };
}
