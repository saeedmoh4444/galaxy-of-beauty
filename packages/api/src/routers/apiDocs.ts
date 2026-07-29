import { publicProcedure, router } from '../trpc';

const API_REFERENCE = {
  version: '2.2.0',
  title: 'Galaxy of Beauty API',
  description: 'REST-like tRPC API for the Galaxy of Beauty platform — 145 routers, 300+ procedures',
  baseUrl: 'https://galaxyofbeauty.sa/api/trpc',
  authentication: {
    type: 'JWT Bearer Token',
    header: 'Authorization: Bearer <token>',
    refresh: 'POST /auth.refreshToken — body: { refreshToken }',
    csrf: 'All mutations require X-CSRF-Token header matching csrf-token cookie',
  },
  categories: [
    {
      name: 'Auth & Users', emoji: '🔐',
      routers: ['auth', 'users', 'addresses', 'savedCards', 'notificationPrefs', 'calendarSync', 'techOnboarding'],
      description: 'Authentication, user profiles, and account management',
    },
    {
      name: 'Core Booking', emoji: '📅',
      routers: ['bookings', 'slots', 'technicians', 'reschedule', 'advancedBooking', 'emergencyBooking', 'recurringBookings', 'bookingChecklist', 'bookingHeatmap'],
      description: 'Booking lifecycle, slot management, and technician discovery',
    },
    {
      name: 'Services & Marketplace', emoji: '💄',
      routers: ['services', 'categories', 'marketplace', 'favorites', 'wishlist', 'priceEstimator', 'serviceMatchmaker', 'serviceWishlist', 'serviceTrends', 'giftCards', 'giftCardMarket', 'serviceMenuQr'],
      description: 'Service catalog, marketplace products, and pricing tools',
    },
    {
      name: 'Payments & Finance', emoji: '💰',
      routers: ['payments', 'wallet', 'payouts', 'cashback', 'bnpl', 'promo', 'savedCards', 'zatca'],
      description: 'Payment processing, wallet, BNPL, and Saudi tax compliance',
    },
    {
      name: 'Social & Community', emoji: '💬',
      routers: ['community', 'reviews', 'videoTestimonials', 'penPal', 'referrals', 'referralRace', 'lookOfTheDay', 'beautyStories', 'beautyShorts', 'audioRooms', 'social'],
      description: 'Community interactions, reviews, and social features',
    },
    {
      name: 'Content & Learning', emoji: '📚',
      routers: ['blog', 'tutorials', 'beautyPodcast', 'beautyCourses', 'certificationQuiz', 'beautyFaq', 'behindScenes', 'newsletter'],
      description: 'Beauty education, tutorials, and content management',
    },
    {
      name: 'AI & Innovation', emoji: '🤖',
      routers: ['ai', 'aiFeatures', 'aiAssistant', 'aiRoutine', 'skinAnalysis', 'skinDiary', 'virtualTryOn', 'hairColorSim', 'styleMatch', 'recommendations'],
      description: 'AI-powered features, skin analysis, and virtual try-on',
    },
    {
      name: 'Wellness & Self-Care', emoji: '🧘',
      routers: ['selfCare', 'beautyBudget', 'beautyProfile', 'beautyJournal', 'wellnessTracker', 'postCare', 'nightMode', 'routineScheduler', 'spaPlanner', 'travelKit'],
      description: 'Personal wellness tracking and self-care routines',
    },
    {
      name: 'Loyalty & Gamification', emoji: '🏆',
      routers: ['loyalty', 'loyaltyPunchCard', 'streaks', 'challenges', 'birthdayRewards', 'vipMembership', 'beautyBingo', 'beautyAwards', 'techLeaderboard'],
      description: 'Customer loyalty programs, challenges, and rewards',
    },
    {
      name: 'Business & B2B', emoji: '🏢',
      routers: ['corporateWellness', 'vendorPortal', 'salonManagement', 'groupBuy', 'homeService', 'serviceWarranty', 'liveChat', 'whatsappBot', 'geofenceOffers'],
      description: 'Enterprise features, vendor management, and B2B tools',
    },
    {
      name: 'Admin & Operations', emoji: '⚙️',
      routers: ['admin', 'adminTools', 'adminAnalyticsV2', 'adminReports', 'analytics', 'beautyAnalytics', 'performance', 'platform', 'featureFlags', 'cms', 'uploads', 'notifications', 'disputes', 'campaigns', 'flashDeals', 'gallery'],
      description: 'Administrative tools, analytics, and platform management',
    },
  ],
  endpoints: 145,
  procedures: '300+',
  lastUpdated: new Date().toISOString(),
};

export const apiDocsRouter = router({
  reference: publicProcedure.query(() => API_REFERENCE),
  openapi: publicProcedure.query(() => ({
    openapi: '3.0.3',
    info: { title: 'Galaxy of Beauty API', version: '2.2.0', description: 'Beauty marketplace tRPC API — 145 routers, 300+ procedures' },
    servers: [{ url: 'https://galaxyofbeauty.sa/api/trpc', description: 'Production' }, { url: 'http://localhost:3000/api/trpc', description: 'Local' }],
    paths: API_REFERENCE.categories.reduce((acc, cat) => {
      cat.routers.forEach((r) => {
        const key = `/${r}`;
        (acc as Record<string, unknown>)[key] = { get: { summary: `${r} — ${cat.name}`, tags: [cat.name], responses: { '200': { description: 'tRPC procedure response' } } } };
      });
      return acc;
    }, {} as Record<string, unknown>),
  })),
});
