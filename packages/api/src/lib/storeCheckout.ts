import { prisma } from '@galaxy/db';
import type { Prisma } from '@galaxy/db';
import { TRPCError } from '@trpc/server';
import { notifyUser } from './notify';

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
  /** B3b — low-stock threshold for the crossing check below. */
  lowStockThreshold: number;
}

/** B3b — a product whose stock crossed its threshold during this checkout. */
export interface LowStockAlert {
  vendorId: number;
  productId: number;
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
      product: {
        select: {
          id: true,
          price: true,
          stock: true,
          vendorId: true,
          nameJson: true,
          lowStockThreshold: true,
        },
      },
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
    lowStockThreshold: i.product.lowStockThreshold,
  }));
}

/**
 * Place StoreOrders (one per vendor) + stock/sales updates + cart clear.
 * Must run inside a `prisma.$transaction` supplied by the caller.
 * Returns lowStockAlerts for products whose stock crossed their threshold
 * in this checkout (old > threshold, new ≤ threshold) — callers notify the
 * vendor after the transaction commits via {@link notifyLowStockAlerts}.
 */
export async function placeStoreOrders(
  tx: Prisma.TransactionClient,
  userId: number,
  lines: CartLine[],
  checkoutId?: number,
): Promise<{
  subtotal: number;
  itemCount: number;
  lowStockAlerts: LowStockAlert[];
  /** F1 — the created StoreOrder rows, for the post-commit inbox notify. */
  orders: Array<{ id: number; vendorId: number; totalAmount: number }>;
}> {
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
  const lowStockAlerts: LowStockAlert[] = [];

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

    // B3b — crossing-only: alert once when a sale takes stock over the
    // threshold edge. Sales while already below don't re-notify, and a
    // restock (C1 editor) resets the condition naturally.
    const newStock = line.stock - line.quantity;
    if (line.stock > line.lowStockThreshold && newStock <= line.lowStockThreshold) {
      lowStockAlerts.push({
        vendorId: line.vendorId,
        productId: line.productId,
        nameJson: line.nameJson,
        stock: newStock,
      });
    }

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

  const created: Array<{ id: number; vendorId: number; totalAmount: number }> = [];
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
    created.push({ id: order.id, vendorId, totalAmount: Number(order.totalAmount) });

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

  return { subtotal, itemCount, lowStockAlerts, orders: created };
}

/**
 * F1 — emit `store_order_placed` to each owning vendor after the checkout
 * transaction commits (one notification per order). Same after-commit +
 * swallow pattern as {@link notifyLowStockAlerts}.
 */
export async function notifyOrderPlaced(
  orders: Array<{ id: number; vendorId: number; totalAmount: number }>,
): Promise<void> {
  if (orders.length === 0) return;

  const vendors = await prisma.vendor.findMany({
    where: { id: { in: [...new Set(orders.map((o) => o.vendorId))] } },
    select: { id: true, userId: true },
  });
  const userIdByVendor = new Map(vendors.map((v) => [v.id, v.userId]));

  for (const order of orders) {
    const userId = userIdByVendor.get(order.vendorId);
    if (!userId) continue;
    try {
      await notifyUser({
        userId,
        templateKey: 'store_order_placed',
        vars: { orderId: order.id, total: order.totalAmount },
        link: '/store?tab=orders',
        channels: ['in_app'],
      });
    } catch {
      // Notification failure must never fail the purchase.
    }
  }
}

/**
 * B3b — emit `store_low_stock` notifications to the owning vendors after the
 * checkout transaction commits. Notification failure must never fail the
 * purchase, so every notify is swallowed (the established pattern).
 */
export async function notifyLowStockAlerts(alerts: LowStockAlert[]): Promise<void> {
  if (alerts.length === 0) return;

  const vendors = await prisma.vendor.findMany({
    where: { id: { in: [...new Set(alerts.map((a) => a.vendorId))] } },
    select: { id: true, userId: true },
  });
  const userIdByVendor = new Map(vendors.map((v) => [v.id, v.userId]));

  for (const alert of alerts) {
    const userId = userIdByVendor.get(alert.vendorId);
    if (!userId) continue;
    const name = alert.nameJson?.en ?? alert.nameJson?.ar ?? `Product #${alert.productId}`;
    try {
      await notifyUser({
        userId,
        templateKey: 'store_low_stock',
        vars: { productName: name, stock: alert.stock },
        link: '/store?tab=products',
        // B3b — in-app only until the vendor inbox (F1) ships push wiring.
        channels: ['in_app'],
      });
    } catch {
      // Notification failure must never fail the purchase.
    }
  }
}
