import { describe, it, expect } from 'vitest';
import { inboxRoute } from '../vendorInbox';

describe('inboxRoute', () => {
  it('routes order-lifecycle notifications to the orders screen', () => {
    expect(inboxRoute('store_order_placed')).toBe('/vendor-portal/orders');
    expect(inboxRoute('order_sla_breached')).toBe('/vendor-portal/orders');
    expect(inboxRoute('dispute_resolved')).toBe('/vendor-portal/orders');
  });

  it('routes stock/review/payout notices to the portal home (their screens are web-first)', () => {
    expect(inboxRoute('store_low_stock')).toBe('/vendor-portal');
    expect(inboxRoute('store_review_left')).toBe('/vendor-portal');
    expect(inboxRoute('payout_processing')).toBe('/vendor-portal');
  });

  it('returns null for unknown or missing types (mark-read only)', () => {
    expect(inboxRoute('booking_reminder')).toBeNull();
    expect(inboxRoute(undefined)).toBeNull();
    expect(inboxRoute(null)).toBeNull();
  });
});
