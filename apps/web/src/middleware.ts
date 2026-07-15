import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/services', '/compare', '/subscription-boxes', '/gallery', '/marketplace', '/technicians', '/offline'];
const AUTH_PATHS = ['/login', '/register', '/forgot-password', '/reset-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Security headers applied to all responses ──
  const response = NextResponse.next();

  // Strict Transport Security (HSTS) — 1 year, include subdomains
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload',
  );

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

  // Cross-origin isolation for the tRPC API endpoint
  if (pathname.startsWith('/api/trpc')) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    // Note: Access-Control-Allow-Origin must be a specific origin when credentials are used
    const origin = request.headers.get('origin') || '';
    if (origin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-CSRF-Token, Accept-Language',
    );
  }

  // ── Auth routing logic ──

  // Allow public paths and static assets
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname === '/' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    // Redirect authenticated users away from auth pages
    const token = request.cookies.get('gob_access')?.value;
    if (token && AUTH_PATHS.some((p) => pathname.startsWith(p))) {
      const redirect = NextResponse.redirect(new URL('/dashboard', request.url));
      redirect.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
      return redirect;
    }
    return response;
  }

  // Protected routes: check for auth cookie
  const accessToken = request.cookies.get('gob_access')?.value;
  if (!accessToken) {
    const redirect = NextResponse.redirect(new URL('/login', request.url));
    redirect.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    return redirect;
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
