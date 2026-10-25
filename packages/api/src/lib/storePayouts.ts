import { prisma } from '@galaxy/db';

/**
 * A2 — store settlement math (VENDOR_PROFESSIONALIZATION_PLAN Wave A).
 * Shared by the admin's `payouts.calculateStore` and the automated
 * `gob-payouts` job so the two paths can never drift apart:
 * FULFILLED orders in the period, per-vendor commission, fee = gross ×
 * rate, net = gross − fee. REFUNDED/CANCELLED orders are excluded
 * (resolved disputes already removed them from settlement).
 */
export async function calculateVendorSettlements(periodStart: Date, periodEnd: Date) {
  const orders = await prisma.storeOrder.findMany({
    where: {
      status: 'FULFILLED',
      createdAt: { gte: periodStart, lte: periodEnd },
    },
    select: { id: true, vendorId: true, totalAmount: true },
  });

  const byVendor = new Map<number, { orderCount: number; grossAmount: number }>();
  for (const order of orders) {
    const gross = Number(order.totalAmount);
    const entry = byVendor.get(order.vendorId) ?? { orderCount: 0, grossAmount: 0 };
    entry.orderCount += 1;
    entry.grossAmount += gross;
    byVendor.set(order.vendorId, entry);
  }

  const vendors = await prisma.vendor.findMany({
    where: { id: { in: Array.from(byVendor.keys()) } },
    select: { id: true, commissionRate: true },
  });
  const rateById = new Map(vendors.map((v) => [v.id, Number(v.commissionRate)]));

  const round2 = (n: number) => Math.round(n * 100) / 100;
  return Array.from(byVendor.entries()).map(([vendorId, entry]) => {
    const rate = rateById.get(vendorId) ?? 10;
    const fee = round2((entry.grossAmount * rate) / 100);
    return {
      vendorId,
      orderCount: entry.orderCount,
      grossAmount: round2(entry.grossAmount),
      amount: round2(entry.grossAmount - fee),
      fee,
    };
  });
}
