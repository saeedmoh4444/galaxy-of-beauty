/**
 * E3 — mobile seller inbox (Wave E): pure helper mapping vendor
 * notification types to portal routes. Node-testable — no RN imports.
 * Unknown types navigate nowhere (the row is still marked read).
 */
export function inboxRoute(type: string | null | undefined): string | null {
  switch (type) {
    // Order lifecycle — the run loop lives on the mobile orders screen.
    case 'store_order_placed':
    case 'order_sla_breached':
    case 'dispute_resolved':
      return '/vendor-portal/orders';
    // Stock/review/payout surfaces are web-first today (E4 adds earnings) —
    // land on the portal home, which carries the product list.
    case 'store_low_stock':
    case 'store_review_left':
    case 'payout_processing':
      return '/vendor-portal';
    default:
      return null;
  }
}
