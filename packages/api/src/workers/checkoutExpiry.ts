/**
 * A3 — abandoned online checkout expiry sweep.
 *
 * Online checkouts decrement stock before payment (the Fatoorah hosted
 * invoice window). A PENDING checkout older than CHECKOUT_EXPIRY_MINUTES
 * is failed and its orders cancelled with stock restored, so abandoned
 * invoices stop holding inventory and never become fulfillable.
 */
import { prisma } from '@galaxy/db';
import { cancelCheckoutOrders } from '../lib/storeCheckout';

const SWEEP_INTERVAL_MS = 15 * 60_000; // every 15 minutes
export const CHECKOUT_EXPIRY_MINUTES = 30;

export async function expireAbandonedCheckouts(): Promise<number> {
  const cutoff = new Date(Date.now() - CHECKOUT_EXPIRY_MINUTES * 60_000);
  const stale = await prisma.storeCheckout.findMany({
    where: { status: 'PENDING', createdAt: { lt: cutoff } },
    select: { id: true },
  });

  let expired = 0;
  for (const { id } of stale) {
    const cancelled = await cancelCheckoutOrders(id);
    await prisma.storeCheckout.update({ where: { id }, data: { status: 'FAILED' } });
    expired += cancelled;
  }
  return expired;
}

let intervalId: ReturnType<typeof setInterval> | null = null;

export function startCheckoutExpiry(): void {
  if (intervalId) return;
  void expireAbandonedCheckouts();
  intervalId = setInterval(() => {
    void expireAbandonedCheckouts();
  }, SWEEP_INTERVAL_MS);
}

export function stopCheckoutExpiry(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
