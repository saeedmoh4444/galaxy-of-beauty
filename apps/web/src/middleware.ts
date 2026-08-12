import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Only these prefixes REQUIRE authentication — everything else is public
const PROTECTED_PATHS = [
  '/dashboard',
  '/bookings',
  '/wallet',
  '/cart',
  '/checkout',
  '/payments',
  '/profile',
  '/addresses',
  '/notifications',
  '/admin',
  '/tech',
  '/customer',
  '/loyalty',
  '/wishlist',
  '/gift-cards',
  '/gift-registry',
  '/subscriptions',
  '/saved-cards',
  '/reviews',
  '/disputes',
  '/promo',
  '/referrals',
  '/streaks',
  '/beauty-profile',
  '/beauty-budget',
  '/beauty-journal',
  '/beauty-routine',
  '/inspiration',
  '/self-care',
  '/my-journey',
  '/my-subscription',
  '/recurring',
  '/savings-goals',
  '/service-history',
  '/waitlist',
];
const AUTH_PATHS = ['/login', '/register', '/forgot-password', '/reset-password'];

export function middleware(request: NextRequest) {
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
    const allowedOrigins = [
      process.env['NEXT_PUBLIC_APP_URL'] || 'http://localhost:3000',
    ].filter(Boolean);

    const origin = request.headers.get('origin');
    if (origin && allowedOrigins.includes(origin)) {
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
  if (token && AUTH_PATHS.some((p) => pathname.startsWith(p))) {
    const redirect = NextResponse.redirect(new URL('/dashboard', request.url));
    redirect.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload',
    );
    return redirect;
  }

  // Protected routes: check for auth cookie
  if (PROTECTED_PATHS.some((p) => pathname.startsWith(p))) {
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
