import { prisma } from '@galaxy/db';
import type { Prisma } from '@galaxy/db';
import { TRPCError } from '@trpc/server';
import { notifyUser } from './notify';
import { enqueueWebhookEvents } from './webhookDelivery';
import { evaluateVendorRules, toRuleLike } from './vendorPricing';

// Shared cart → StoreOrder placement used by payments.payCart (with a
// StoreCheckout shipping+payment record — marketplace.buyCart, the
// checkout-less path, was removed in audit A5/M3). One StoreOrder per
// vendor; stock decrement + sales increments happen inside the caller's
// transaction so payment stays atomic with order placement.

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
  /** C1 — variant line: the variant id + its bilingual label snapshot. */
  variantId?: number | null;
  variantNameJson?: { ar?: string; en?: string } | null;
}

/** B3b — a product whose stock crossed its threshold during this checkout. */
export interface LowStockAlert {
  vendorId: number;
  productId: number;
  nameJson: { ar?: string; en?: string } | null;
  stock: number;
  /** C1 — variant-level alert: the variant id + its label snapshot. */
  variantId?: number | null;
  variantNameJson?: { ar?: string; en?: string } | null;
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
      variant: {
        select: {
          id: true,
          nameJson: true,
          priceDelta: true,
          stock: true,
          lowStockThreshold: true,
        },
      },
    },
  });

  if (cartItems.length === 0) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cart is empty' });
  }

  const shortage = cartItems.find((i) => (i.variant?.stock ?? i.product.stock) < i.quantity);
  if (shortage) {
    const stock = shortage.variant?.stock ?? shortage.product.stock;
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `Insufficient stock for product #${shortage.productId} (available: ${stock})`,
    });
  }

  // C3c — checkout-time pricing: the vendor's active uplift rules apply
  // to the cart math (delta adds BEFORE the multiplier).
  const vendorIds = [...new Set(cartItems.map((i) => i.product.vendorId))];
  const rulesByVendor = new Map<number, ReturnType<typeof toRuleLike>[]>();
  for (const vendorId of vendorIds) {
    const rows = await prisma.vendorPriceRule.findMany({
      where: { vendorId, isActive: true },
    });
    rulesByVendor.set(vendorId, rows.map(toRuleLike));
  }

  return cartItems.map((i) => {
    const productName = (i.product.nameJson as { en?: string; ar?: string } | null) ?? null;
    const variantName = (i.variant?.nameJson as { en?: string; ar?: string } | null) ?? null;
    const stock = i.variant?.stock ?? i.product.stock;
    const threshold = i.variant?.lowStockThreshold ?? i.product.lowStockThreshold;
    // C1 — a variant line prices at base + delta and consumes variant
    // stock; the display name composes product + variant labels.
    const base = Number(i.product.price) + Number(i.variant?.priceDelta ?? 0);
    const priced = evaluateVendorRules(rulesByVendor.get(i.product.vendorId) ?? [], {
      productId: i.productId,
      date: new Date(),
      stock,
      lowStockThreshold: threshold,
      basePrice: base,
    });
    const unitPrice = priced.price;
    const name = variantName
      ? `${productName?.en ?? `Product #${i.productId}`} — ${variantName.en ?? variantName.ar}`
      : (productName?.en ?? `Product #${i.productId}`);
    return {
      productId: i.productId,
      quantity: i.quantity,
      unitPrice,
      vendorId: i.product.vendorId,
      name,
      nameJson: productName,
      stock,
      lowStockThreshold: threshold,
      variantId: i.variant?.id ?? null,
      variantNameJson: variantName,
    };
  });
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
        variantId: number | null;
        variantNameJson: CartLine['variantNameJson'];
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

    // C1 — a variant line consumes variant stock (the base product stock
    // is the no-variant unit); the product's sales metric still accrues.
    if (line.variantId) {
      await tx.productVariant.update({
        where: { id: line.variantId },
        data: { stock: { decrement: line.quantity } },
      });
      await tx.product.update({
        where: { id: line.productId },
        data: { sales: { increment: line.quantity } },
      });
    } else {
      await tx.product.update({
        where: { id: line.productId },
        data: {
          stock: { decrement: line.quantity },
          sales: { increment: line.quantity },
        },
      });
    }
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
        variantId: line.variantId ?? null,
        variantNameJson: line.variantNameJson ?? null,
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
      variantId: line.variantId ?? null,
      variantNameJson: line.variantNameJson ?? null,
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
          variantId: l.variantId,
          variantNameJson: (l.variantNameJson ?? null) as unknown as Prisma.InputJsonValue,
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
        // E2 — the mobile push tap deep-links to the order detail.
        data: { type: 'store_order_placed', orderId: String(order.id) },
        channels: ['in_app'],
      });
      // D1b — the vendor's webhooks get the same event, signed.
      try {
        await enqueueWebhookEvents('order.placed', {
          vendorId: order.vendorId,
          orderId: order.id,
          total: order.totalAmount,
        });
      } catch {
        // Webhook fan-out never fails the purchase.
      }
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
    const productName = alert.nameJson?.en ?? alert.nameJson?.ar ?? `Product #${alert.productId}`;
    // C1 — variant alerts carry the composed "Product — Variant" name.
    const variantName = alert.variantNameJson?.en ?? alert.variantNameJson?.ar;
    const name = variantName ? `${productName} — ${variantName}` : productName;
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
    // D1b — the same alert over the vendor's webhooks.
    try {
      await enqueueWebhookEvents('stock.low', {
        vendorId: alert.vendorId,
        productId: alert.productId,
        variantId: alert.variantId ?? null,
        productName: name,
        stock: alert.stock,
      });
    } catch {
      // Webhook fan-out never fails the purchase.
    }
  }
}

/**
 * A3 — compensation: cancel a checkout's PENDING_FULFILLMENT orders and
 * restore the stock/sales the placement decremented (variant-aware).
 * Used when an online checkout invoice fails or an abandoned PENDING
 * checkout expires. Returns the number of orders cancelled.
 */
export async function cancelCheckoutOrders(checkoutId: number): Promise<number> {
  return prisma.$transaction(async (tx) => {
    const orders = await tx.storeOrder.findMany({
      where: { checkoutId, status: 'PENDING_FULFILLMENT' },
      include: {
        items: {
          select: { productId: true, quantity: true, variantId: true, priceSnapshot: true },
        },
      },
    });

    let cancelled = 0;
    for (const order of orders) {
      await tx.storeOrder.update({
        where: { id: order.id },
        data: { status: 'CANCELLED' },
      });
      cancelled++;

      for (const item of order.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
        await tx.product.update({
          where: { id: item.productId },
          data: { sales: { decrement: item.quantity } },
        });
      }

      await tx.vendor.update({
        where: { id: order.vendorId },
        data: { totalSales: { decrement: Number(order.totalAmount) } },
      });
    }
    return cancelled;
  });
}
