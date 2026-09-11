/**
 * Phase 3 sprint 4 — grouped customer sidebar navigation.
 * Web-local config: the 68 customer links organized into 6 collapsible
 * groups so the dashboard sidebar stops being a flat feature wall.
 *
 * Icons: @galaxy/ui `Icon` names (30-icon curated SVG set) — no more
 * empty-glyph strings; group emblems stay emoji for warmth.
 */
import type { TranslationKey } from '@galaxy/shared';
import type { IconName } from '@galaxy/ui';

export type NavLink = { href: string; key: TranslationKey; icon: IconName };
export type NavGroup = { key: TranslationKey; icon: string; links: NavLink[] };

export const customerNavGroups: NavGroup[] = [
  {
    key: 'nav.group.core',
    icon: '🏠',
    links: [
      { href: '/dashboard', key: 'nav.dashboard', icon: 'sparkle' },
      { href: '/bookings', key: 'nav.myBookings', icon: 'calendar' },
      { href: '/bookings/create', key: 'nav.bookings.create', icon: 'plus' },
      { href: '/wallet', key: 'nav.wallet', icon: 'wallet' },
      { href: '/profile', key: 'nav.profile', icon: 'user' },
      { href: '/addresses', key: 'nav.addresses', icon: 'map-pin' },
      { href: '/notifications', key: 'nav.notifications', icon: 'bell' },
      { href: '/smart-schedule', key: 'nav.smart-schedule', icon: 'clock' },
      { href: '/calendar-sync', key: 'nav.calendar-sync', icon: 'calendar' },
      { href: '/booking-checklist', key: 'nav.booking-checklist', icon: 'check' },
    ],
  },
  {
    key: 'nav.group.bookPay',
    icon: '💳',
    links: [
      { href: '/saved-cards', key: 'nav.saved-cards', icon: 'wallet' },
      { href: '/bnpl', key: 'nav.bnpl', icon: 'clock' },
      { href: '/cashback', key: 'nav.cashback', icon: 'download' },
      { href: '/group-bookings', key: 'nav.group-bookings', icon: 'user' },
      { href: '/service-warranty', key: 'nav.service-warranty', icon: 'check' },
      { href: '/promo', key: 'nav.promo', icon: 'gift' },
    ],
  },
  {
    key: 'nav.group.beauty',
    icon: '🌸',
    links: [
      { href: '/wellness-hub', key: 'nav.wellness-hub', icon: 'sparkle' },
      { href: '/wellness-tracker', key: 'nav.wellness-tracker', icon: 'clock' },
      { href: '/skin-analysis', key: 'nav.skin-analysis', icon: 'camera' },
      { href: '/skin-diary', key: 'nav.skin-diary', icon: 'edit' },
      { href: '/ai-assistant', key: 'nav.ai-assistant', icon: 'chat' },
      { href: '/ai-chat', key: 'nav.ai-chat', icon: 'chat' },
      { href: '/ai-routine', key: 'nav.ai-routine', icon: 'sparkle' },
      { href: '/dna-beauty', key: 'nav.dna-beauty', icon: 'filter' },
      { href: '/virtual-try-on', key: 'nav.virtual-try-on', icon: 'camera' },
      { href: '/hair-color-sim', key: 'nav.hair-color-sim', icon: 'camera' },
      { href: '/style-match', key: 'nav.style-match', icon: 'heart' },
      { href: '/mood-board', key: 'nav.mood-board', icon: 'heart' },
      { href: '/beauty-analytics', key: 'nav.beauty-analytics', icon: 'filter' },
      { href: '/post-care', key: 'nav.post-care', icon: 'check' },
      { href: '/routine-scheduler', key: 'nav.routine-scheduler', icon: 'clock' },
      { href: '/spa-planner', key: 'nav.spa-planner', icon: 'sparkle' },
      { href: '/travel-kit', key: 'nav.travel-kit', icon: 'map-pin' },
      { href: '/expiry-tracker', key: 'nav.expiry-tracker', icon: 'clock' },
      { href: '/restock-reminder', key: 'nav.restock-reminder', icon: 'bell' },
      { href: '/night-mode', key: 'nav.night-mode', icon: 'star' },
      { href: '/bridal-concierge', key: 'nav.bridal-concierge', icon: 'heart' },
    ],
  },
  {
    key: 'nav.group.shopping',
    icon: '🛍️',
    links: [
      { href: '/marketplace', key: 'nav.marketplace', icon: 'search' },
      { href: '/cart', key: 'nav.cart', icon: 'download' },
      { href: '/subscription-boxes', key: 'nav.subscription-boxes', icon: 'gift' },
      { href: '/subscriptions', key: 'nav.subscriptions', icon: 'gift' },
      { href: '/wishlist', key: 'nav.wishlist', icon: 'heart' },
      { href: '/service-wishlist', key: 'nav.service-wishlist', icon: 'heart' },
      { href: '/gift-card-market', key: 'nav.gift-card-market', icon: 'gift' },
      { href: '/sale-alerts', key: 'nav.sale-alerts', icon: 'bell' },
      { href: '/price-drop-alerts', key: 'nav.price-drop-alerts', icon: 'bell' },
      { href: '/product-scanner', key: 'nav.product-scanner', icon: 'camera' },
      { href: '/box-builder', key: 'nav.box-builder', icon: 'plus' },
    ],
  },
  {
    key: 'nav.group.community',
    icon: '💝',
    links: [
      { href: '/referrals', key: 'nav.referrals', icon: 'share' },
      { href: '/loyalty', key: 'nav.loyalty', icon: 'star' },
      { href: '/loyalty-punch-card', key: 'nav.loyalty-punch-card', icon: 'star' },
      { href: '/challenges', key: 'nav.challenges', icon: 'sparkle' },
      { href: '/beauty-bingo', key: 'nav.beauty-bingo', icon: 'sparkle' },
      { href: '/birthday-rewards', key: 'nav.birthday-rewards', icon: 'gift' },
      { href: '/vip-membership', key: 'nav.vip-membership', icon: 'star' },
      { href: '/social', key: 'nav.social', icon: 'chat' },
      { href: '/video', key: 'nav.video', icon: 'camera' },
      { href: '/pen-pal', key: 'nav.pen-pal', icon: 'edit' },
      { href: '/live-chat', key: 'nav.live-chat', icon: 'chat' },
      { href: '/family-account', key: 'nav.family-account', icon: 'user' },
    ],
  },
  {
    key: 'nav.group.more',
    icon: '✨',
    links: [
      { href: '/womens-services', key: 'nav.womens-services', icon: 'heart' },
      { href: '/ride-hailing', key: 'nav.ride-hailing', icon: 'map-pin' },
      { href: '/last-mile', key: 'nav.last-mile', icon: 'map-pin' },
      { href: '/home-service', key: 'nav.home-service', icon: 'map-pin' },
      { href: '/vendor-portal', key: 'nav.vendor-portal', icon: 'external-link' },
      { href: '/tech-onboarding', key: 'nav.tech-onboarding', icon: 'user' },
      { href: '/tech-waitlist', key: 'nav.tech-waitlist', icon: 'clock' },
      { href: '/certification-quiz', key: 'nav.certification-quiz', icon: 'check' },
    ],
  },
];

/** Flat list (mobile bottom nav + any legacy consumers). */
export const customerLinks: NavLink[] = customerNavGroups.flatMap((group) => group.links);
