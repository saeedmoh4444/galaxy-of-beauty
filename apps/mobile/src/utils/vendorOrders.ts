/**
 * E2 — mobile order operations (Wave E): pure helpers for the orders
 * screen. Node-testable — no react-native imports.
 */

export type OrderStatusTone = 'fulfilled' | 'cancelled' | 'pending';

/** Mirrors the web orders-tab chip mapping (green/red/amber). */
export function orderStatusTone(status: string | null | undefined): OrderStatusTone {
  if (status === 'FULFILLED') return 'fulfilled';
  if (status === 'CANCELLED') return 'cancelled';
  return 'pending';
}

/** SLA late flag — only a still-pending order with a breach stamp is late. */
export function isLate(order: {
  status?: string | null;
  slaBreachedAt?: string | Date | null;
}): boolean {
  return Boolean(order.slaBreachedAt) && order.status === 'PENDING_FULFILLMENT';
}

/**
 * Per-tap idempotency key for fulfillOrder (min 8 chars). The screen keeps
 * one key per order until success so a retried tap re-uses it — a timed-out
 * first request that DID fulfill returns the row instead of BAD_REQUEST.
 */
export function fulfillIdempotencyKey(orderId: number): string {
  const rand = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return `mob-${orderId}-${rand}`;
}
