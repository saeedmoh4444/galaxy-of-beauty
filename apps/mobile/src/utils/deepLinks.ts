// Deep link configuration for Galaxy of Beauty mobile app.
// Universal links + custom scheme: gob://

export const DEEP_LINK_CONFIG = {
  prefixes: ['gob://', 'https://galaxyofbeauty.sa'],
  config: {
    screens: {
      '(tabs)': {
        screens: {
          home: '',
          services: 'services',
          bookings: 'bookings',
          wallet: 'wallet',
          profile: 'profile',
        },
      },
      '(auth)': {
        screens: {
          login: 'login',
          register: 'register',
          'forgot-password': 'forgot-password',
          'reset-password': 'reset-password?token=:token',
          'verify-email': 'verify-email?token=:token',
          '2fa': '2fa',
        },
      },
      'services': {
        screens: {
          '[id]': 'services/:id',
          'surprise-me': 'services/surprise-me',
        },
      },
      technicians: {
        screens: {
          index: 'technicians',
          '[id]': 'technicians/:id',
        },
      },
      customer: {
        screens: {
          'ai-chat': 'chat',
          wishlist: 'wishlist',
          waitlist: 'waitlist',
          notifications: 'notifications',
          addresses: 'addresses',
          referrals: 'referrals',
          streaks: 'streaks',
          reviews: 'reviews',
          disputes: 'disputes',
          subscriptions: 'subscriptions',
        },
      },
      tech: {
        screens: {
          dashboard: 'tech/dashboard',
          bookings: 'tech/bookings',
          slots: 'tech/slots',
          earnings: 'tech/earnings',
          profile: 'tech/profile',
          calendar: 'tech/calendar',
        },
      },
      admin: {
        screens: {
          dashboard: 'admin/dashboard',
          users: 'admin/users',
          bookings: 'admin/bookings',
          finance: 'admin/finance',
          categories: 'admin/categories',
          services: 'admin/services',
          technicians: 'admin/technicians',
          analytics: 'admin/analytics',
          disputes: 'admin/disputes',
          zatca: 'admin/zatca',
          settings: 'admin/settings',
        },
      },
    },
  },
};

// Handle notification tap → navigate to relevant screen
export function resolveNotificationRoute(type: string, data?: Record<string, string>): string {
  const routes: Record<string, string> = {
    booking_request: '/tech/bookings',
    booking_accepted: '/bookings',
    booking_rejected: '/bookings',
    booking_cancelled: '/bookings',
    booking_started: '/bookings',
    booking_completed: '/bookings',
    new_message: data?.bookingId ? `/bookings/${data.bookingId}` : '/',
    payment_success: '/wallet',
    wallet_updated: '/wallet',
    waitlist_update: '/waitlist',
    new_notification: '/notifications',
    video_call_started: data?.bookingId ? `/bookings/${data.bookingId}` : '/',
    admin_update: '/admin/dashboard',
  };
  return routes[type] || '/';
}
