import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Only these prefixes REQUIRE authentication — everything else is public
// Exception: /marketplace is a guest-browsable storefront (its API is
// publicProcedure by design) — auth is enforced at checkout, not browsing.
const PROTECTED_PATHS = [
  '/accessories-guide',
  '/achievements',
  '/addresses',
  '/admin',
  '/advanced-booking',
  '/ai-assistant',
  '/ai-chat',
  '/ai-feed',
  '/ai-routine',
  '/allergen-checker',
  '/beauty-academy',
  '/beauty-advisor',
  '/beauty-analytics',
  '/beauty-bingo',
  '/beauty-budget',
  '/beauty-budget-planner',
  '/beauty-closet',
  '/beauty-community',
  '/beauty-courses',
  '/beauty-dashboard',
  '/beauty-diary',
  '/beauty-discovery',
  '/beauty-events',
  '/beauty-expenses',
  '/beauty-extras',
  '/beauty-goals',
  '/beauty-innovation',
  '/beauty-journal',
  '/beauty-lifestyle',
  '/beauty-mentor',
  '/beauty-metaverse',
  '/beauty-party',
  '/beauty-profile',
  '/beauty-reminders',
  '/beauty-rescue',
  '/beauty-rewards',
  '/beauty-routine',
  '/beauty-services',
  '/beauty-tips',
  '/beauty-wishlist-gifts',
  '/birthday-rewards',
  '/bnpl',
  '/booking-checklist',
  '/booking-insights',
  '/bookings',
  '/box-builder',
  '/calendar-sync',
  '/cart',
  '/cashback',
  '/certification-quiz',
  '/challenges',
  '/chat',
  '/checkout',
  '/clinic-connect',
  '/color-analysis',
  '/community',
  '/corporate-wellness',
  '/customer',
  '/cycle-tracker',
  '/dashboard',
  '/disputes',
  '/dna-beauty',
  '/emergency-booking',
  '/expiry-tracker',
  '/family-account',
  '/family-beauty',
  '/favorites',
  '/following',
  '/franchise-portal',
  '/geofence-offers',
  '/gift-card-market',
  '/gift-cards',
  '/gift-registry',
  '/group-bookings',
  '/hair-care-guide',
  '/hair-color-sim',
  '/home-service',
  '/inspiration',
  '/invoices',
  '/iot-sync',
  '/last-mile',
  '/leadership',
  '/life-events',
  '/live-chat',
  '/loyalty',
  '/loyalty-punch-card',
  '/makeup-guide',
  '/mood-board',
  '/my-journey',
  '/my-subscription',
  '/nail-care-guide',
  '/newsletter',
  '/night-mode',
  '/notification-settings',
  '/notifications',
  '/payments',
  '/pen-pal',
  '/perfume-guide',
  '/personal-care',
  '/personalized-feed',
  '/post-care',
  '/post-treatment',
  '/price-drop-alerts',
  '/pro-tools',
  '/product-scanner',
  '/profile',
  '/promo',
  '/recommendations',
  '/recurring',
  '/referral-dashboard',
  '/referrals',
  '/reschedule',
  '/restock-reminder',
  '/reviews',
  '/rewards-marketplace',
  '/ride-hailing',
  '/routine-scheduler',
  '/safety',
  '/sale-alerts',
  '/salon-management',
  '/salon-membership',
  '/saved-cards',
  '/savings-goals',
  '/seasonal-calendar',
  '/self-care',
  '/service-compare',
  '/service-history',
  '/service-menu-qr',
  '/service-warranty',
  '/service-wishlist',
  '/skin-analysis',
  '/skin-diary',
  '/skin-timeline',
  '/skincare-guide',
  '/smart-schedule',
  '/social',
  '/social-challenges',
  '/spa-planner',
  '/streak-calendar',
  '/streaks',
  '/style-match',
  '/subscriptions',
  '/sustainability',
  '/tech',
  '/tech-onboarding',
  '/tech-waitlist',
  '/travel-checklist',
  '/travel-kit',
  '/vendor-portal',
  '/video',
  '/vip-membership',
  '/virtual-consultation',
  '/virtual-try-on',
  '/waitlist',
  '/wallet',
  '/wellness',
  '/wellness-hub',
  '/wellness-tracker',
  '/wishlist',
];
const AUTH_PATHS = ['/login', '/register', '/forgot-password', '/reset-password'];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Request ID for traceability ──
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID();

  // ── Security headers applied to all responses ──
  const response = NextResponse.next();
  response.headers.set('X-Request-ID', requestId);

  // Strict Transport Security (HSTS) — 1 year, include subdomains
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // Restrict referrer information
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Restrict browser features
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self), payment=()',
  );

  // CORS for the tRPC API endpoint — only allowed origins
  if (pathname.startsWith('/api/trpc')) {
    const allowedOrigins = [process.env['NEXT_PUBLIC_APP_URL'] || 'http://localhost:3000'].filter(
      Boolean,
    );

    const origin = request.headers.get('origin');
    // Dev origins: the Expo web build (Metro on :8081/:8083) calls the API
    // cross-origin — without this the browser discards every response and
    // the app renders blank. localhost-only, production unaffected.
    const isDevLocalOrigin = !!origin && /^http:\/\/localhost(:\d+)?$/.test(origin);
    if (origin && (allowedOrigins.includes(origin) || isDevLocalOrigin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      response.headers.set(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-CSRF-Token, Accept-Language',
      );
    }
  }

  // ── Auth routing logic ──

  // Allow static assets and API routes
  if (
    pathname === '/' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return response;
  }

  // Redirect authenticated users away from auth pages
  const token = request.cookies.get('gob_access')?.value;
  if (token && AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    const redirect = NextResponse.redirect(new URL('/dashboard', request.url));
    redirect.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload',
    );
    return redirect;
  }

  // Protected routes: check for auth cookie.
  // Segment-aware match — '/tech' must gate /tech/* but NOT '/technicians'
  // (public page) or '/tech-calendar' (public page).
  if (PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    if (!token) {
      const redirect = NextResponse.redirect(new URL('/login', request.url));
      redirect.headers.set(
        'Strict-Transport-Security',
        'max-age=63072000; includeSubDomains; preload',
      );
      return redirect;
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
