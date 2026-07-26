/**
 * Deep Linking Handler for Push Notifications
 *
 * Maps notification types to screen routes for navigation.
 * Called when the user taps a push notification.
 *
 * Supported deep links:
 *   booking_request   → Tech Dashboard (Requests tab)
 *   booking_accepted  → Booking detail (customer)
 *   booking_reminder  → Booking detail
 *   payment_success   → Wallet
 *   review_request    → Booking detail (highlight review prompt)
 *   waitlist_update   → Service detail / booking
 *   new_notification  → Notifications screen
 */

export const DEEP_LINK_MAP = {
  booking_request: {
    screen: 'TechTabs',
    params: { screen: 'RequestsTab' },
    role: 'TECHNICIAN',
  },
  booking_accepted: {
    screen: 'CustomerTabs',
    params: { screen: 'BookingsTab' },
    role: 'CUSTOMER',
  },
  booking_rejected: {
    screen: 'CustomerTabs',
    params: { screen: 'BookingsTab' },
    role: 'CUSTOMER',
  },
  booking_cancelled: {
    screen: 'CustomerTabs',
    params: { screen: 'BookingsTab' },
    role: 'CUSTOMER',
  },
  payment_success: {
    screen: 'CustomerTabs',
    params: { screen: 'WalletTab' },
    role: 'CUSTOMER',
  },
  booking_reminder: {
    screen: 'CustomerTabs',
    params: { screen: 'BookingsTab' },
    role: 'CUSTOMER',
  },
  review_request: {
    screen: 'CustomerTabs',
    params: { screen: 'BookingsTab', highlightReview: true },
    role: 'CUSTOMER',
  },
  waitlist_update: {
    screen: 'CustomerTabs',
    params: { screen: 'ServicesTab' },
    role: 'CUSTOMER',
  },
  wallet_updated: {
    screen: 'CustomerTabs',
    params: { screen: 'WalletTab' },
    role: 'CUSTOMER',
  },
  new_notification: {
    screen: 'Notifications',
    params: {},
    role: 'ANY',
  },
};

/**
 * Resolve a notification to a navigation target.
 *
 * @param {object} notification - Notification object from push/fcm
 * @returns {{ screen: string, params: object } | null}
 */
export function resolveDeepLink(notification) {
  const data = notification?.data || notification?.request?.content?.data || {};
  const type = data.type || notification?.type;

  if (!type) return null;

  const mapping = DEEP_LINK_MAP[type];
  if (!mapping) return { screen: 'Notifications', params: {} };

  return {
    screen: mapping.screen,
    params: { ...mapping.params, notificationData: data },
  };
}

export default { resolveDeepLink, DEEP_LINK_MAP };
