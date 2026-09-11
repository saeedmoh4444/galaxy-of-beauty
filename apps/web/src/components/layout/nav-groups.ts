/**
 * Phase 3 sprint 4 — grouped customer sidebar navigation.
 * Web-local config: the 68 customer links organized into 6 collapsible
 * groups so the dashboard sidebar stops being a flat feature wall.
 */
import type { TranslationKey } from '@galaxy/shared';

export type NavLink = { href: string; key: TranslationKey; icon: string };
export type NavGroup = { key: TranslationKey; icon: string; links: NavLink[] };

export const customerNavGroups: NavGroup[] = [
  {
    key: 'nav.group.core',
    icon: '🏠',
    links: [
      { href: '/dashboard', key: 'nav.dashboard', icon: '' },
      { href: '/bookings', key: 'nav.myBookings', icon: '' },
      { href: '/bookings/create', key: 'nav.bookings.create', icon: '' },
      { href: '/wallet', key: 'nav.wallet', icon: '' },
      { href: '/profile', key: 'nav.profile', icon: '' },
      { href: '/addresses', key: 'nav.addresses', icon: '' },
      { href: '/notifications', key: 'nav.notifications', icon: '' },
      { href: '/smart-schedule', key: 'nav.smart-schedule', icon: '' },
      { href: '/calendar-sync', key: 'nav.calendar-sync', icon: '️' },
      { href: '/booking-checklist', key: 'nav.booking-checklist', icon: '' },
    ],
  },
  {
    key: 'nav.group.bookPay',
    icon: '💳',
    links: [
      { href: '/saved-cards', key: 'nav.saved-cards', icon: '' },
      { href: '/bnpl', key: 'nav.bnpl', icon: '' },
      { href: '/cashback', key: 'nav.cashback', icon: '' },
      { href: '/group-bookings', key: 'nav.group-bookings', icon: '‍️' },
      { href: '/service-warranty', key: 'nav.service-warranty', icon: '️' },
      { href: '/promo', key: 'nav.promo', icon: '️' },
    ],
  },
  {
    key: 'nav.group.beauty',
    icon: '🌸',
    links: [
      { href: '/wellness-hub', key: 'nav.wellness-hub', icon: '🌿' },
      { href: '/wellness-tracker', key: 'nav.wellness-tracker', icon: '' },
      { href: '/skin-analysis', key: 'nav.skin-analysis', icon: '' },
      { href: '/skin-diary', key: 'nav.skin-diary', icon: '' },
      { href: '/ai-assistant', key: 'nav.ai-assistant', icon: '' },
      { href: '/ai-chat', key: 'nav.ai-chat', icon: '' },
      { href: '/ai-routine', key: 'nav.ai-routine', icon: '' },
      { href: '/dna-beauty', key: 'nav.dna-beauty', icon: '' },
      { href: '/virtual-try-on', key: 'nav.virtual-try-on', icon: '' },
      { href: '/hair-color-sim', key: 'nav.hair-color-sim', icon: '‍️' },
      { href: '/style-match', key: 'nav.style-match', icon: '' },
      { href: '/mood-board', key: 'nav.mood-board', icon: '' },
      { href: '/beauty-analytics', key: 'nav.beauty-analytics', icon: '' },
      { href: '/post-care', key: 'nav.post-care', icon: '‍️' },
      { href: '/routine-scheduler', key: 'nav.routine-scheduler', icon: '' },
      { href: '/spa-planner', key: 'nav.spa-planner', icon: '️' },
      { href: '/travel-kit', key: 'nav.travel-kit', icon: '' },
      { href: '/expiry-tracker', key: 'nav.expiry-tracker', icon: '️' },
      { href: '/restock-reminder', key: 'nav.restock-reminder', icon: '' },
      { href: '/night-mode', key: 'nav.night-mode', icon: '' },
      { href: '/bridal-concierge', key: 'nav.bridal-concierge', icon: '' },
    ],
  },
  {
    key: 'nav.group.shopping',
    icon: '🛍️',
    links: [
      { href: '/marketplace', key: 'nav.marketplace', icon: '️' },
      { href: '/cart', key: 'nav.cart', icon: '' },
      { href: '/subscription-boxes', key: 'nav.subscription-boxes', icon: '' },
      { href: '/subscriptions', key: 'nav.subscriptions', icon: '' },
      { href: '/wishlist', key: 'nav.wishlist', icon: '️' },
      { href: '/service-wishlist', key: 'nav.service-wishlist', icon: '' },
      { href: '/gift-card-market', key: 'nav.gift-card-market', icon: '' },
      { href: '/sale-alerts', key: 'nav.sale-alerts', icon: '' },
      { href: '/price-drop-alerts', key: 'nav.price-drop-alerts', icon: '' },
      { href: '/product-scanner', key: 'nav.product-scanner', icon: '' },
      { href: '/box-builder', key: 'nav.box-builder', icon: '' },
    ],
  },
  {
    key: 'nav.group.community',
    icon: '💝',
    links: [
      { href: '/referrals', key: 'nav.referrals', icon: '💝' },
      { href: '/loyalty', key: 'nav.loyalty', icon: '' },
      { href: '/loyalty-punch-card', key: 'nav.loyalty-punch-card', icon: '' },
      { href: '/challenges', key: 'nav.challenges', icon: '' },
      { href: '/beauty-bingo', key: 'nav.beauty-bingo', icon: '' },
      { href: '/birthday-rewards', key: 'nav.birthday-rewards', icon: '' },
      { href: '/vip-membership', key: 'nav.vip-membership', icon: '' },
      { href: '/social', key: 'nav.social', icon: '' },
      { href: '/video', key: 'nav.video', icon: '' },
      { href: '/pen-pal', key: 'nav.pen-pal', icon: '' },
      { href: '/live-chat', key: 'nav.live-chat', icon: '' },
      { href: '/family-account', key: 'nav.family-account', icon: '‍‍' },
    ],
  },
  {
    key: 'nav.group.more',
    icon: '✨',
    links: [
      { href: '/womens-services', key: 'nav.womens-services', icon: '' },
      { href: '/ride-hailing', key: 'nav.ride-hailing', icon: '' },
      { href: '/last-mile', key: 'nav.last-mile', icon: '' },
      { href: '/home-service', key: 'nav.home-service', icon: '' },
      { href: '/vendor-portal', key: 'nav.vendor-portal', icon: '' },
      { href: '/tech-onboarding', key: 'nav.tech-onboarding', icon: '' },
      { href: '/tech-waitlist', key: 'nav.tech-waitlist', icon: '' },
      { href: '/certification-quiz', key: 'nav.certification-quiz', icon: '' },
    ],
  },
];

/** Flat list (mobile bottom nav + any legacy consumers). */
export const customerLinks: NavLink[] = customerNavGroups.flatMap((group) => group.links);
