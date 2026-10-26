import { describe, it, expect } from 'vitest';
import { orderStatusTone, isLate, fulfillIdempotencyKey } from '../vendorOrders';

describe('orderStatusTone', () => {
  it('maps the three StoreOrder statuses to chip tones', () => {
    expect(orderStatusTone('PENDING_FULFILLMENT')).toBe('pending');
    expect(orderStatusTone('FULFILLED')).toBe('fulfilled');
    expect(orderStatusTone('CANCELLED')).toBe('cancelled');
  });

  it('falls back to the pending tone for unknown statuses (defensive)', () => {
    expect(orderStatusTone('REFUNDED' as never)).toBe('pending');
    expect(orderStatusTone(undefined)).toBe('pending');
    expect(orderStatusTone(null)).toBe('pending');
  });
});

describe('isLate', () => {
  it('is late only when an SLA breach exists AND the order is still pending', () => {
    expect(isLate({ status: 'PENDING_FULFILLMENT', slaBreachedAt: '2026-10-26T09:00:00Z' })).toBe(
      true,
    );
  });

  it('ignores breaches on orders that were since fulfilled or cancelled', () => {
    expect(isLate({ status: 'FULFILLED', slaBreachedAt: '2026-10-26T09:00:00Z' })).toBe(false);
    expect(isLate({ status: 'CANCELLED', slaBreachedAt: '2026-10-26T09:00:00Z' })).toBe(false);
  });

  it('is not late without a breach stamp', () => {
    expect(isLate({ status: 'PENDING_FULFILLMENT', slaBreachedAt: null })).toBe(false);
  });
});

describe('fulfillIdempotencyKey', () => {
  it('builds a stable-shaped key per order (mob-<orderId>-<random>)', () => {
    const key = fulfillIdempotencyKey(42);
    expect(key.startsWith('mob-42-')).toBe(true);
    expect(key.length).toBeGreaterThanOrEqual(8); // fulfillOrder input min
    expect(key.length).toBeLessThanOrEqual(100); // fulfillOrder input max
  });

  it('generates a distinct key on every call (repeat presses must not collide)', () => {
    const keys = new Set(Array.from({ length: 50 }, () => fulfillIdempotencyKey(7)));
    expect(keys.size).toBe(50);
  });
});
