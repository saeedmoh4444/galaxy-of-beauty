import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter, createTRPCContext } from '@galaxy/api';
import { verifyAccessToken } from '@galaxy/api';
import { generateCsrfToken, buildCsrfCookie } from '@galaxy/api';
import type { NextRequest } from 'next/server';

const CSRF_COOKIE_NAME = 'csrf-token';
const AUTH_ACCESS_COOKIE = 'gob_access';

const handler = async (req: NextRequest) => {
  const isProduction = process.env.NODE_ENV === 'production';

  // ── Extract JWT from cookie (primary) or Authorization header (mobile fallback) ──
  let user = null;
  const accessCookie = req.cookies.get(AUTH_ACCESS_COOKIE)?.value;
  if (accessCookie) {
    try {
      user = verifyAccessToken(accessCookie);
    } catch {
      // Invalid/expired token — proceed as unauthenticated
    }
  }

  // Fallback: Authorization header (for mobile clients)
  if (!user) {
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        user = verifyAccessToken(authHeader.slice(7));
      } catch {
        // Invalid/expired token — proceed as unauthenticated
      }
    }
  }

  // ── Extract client IP (for rate limiting) ──
  // X-Forwarded-For is set by reverse proxies (nginx, load balancers).
  // Take the first IP in the chain (original client).
  const forwardedFor = req.headers.get('x-forwarded-for');
  const clientIp = forwardedFor?.split(',')[0]?.trim() ?? req.headers.get('x-real-ip') ?? '127.0.0.1';

  // ── Correlation ID for request tracing ──
  const correlationId = req.headers.get('x-request-id') ?? crypto.randomUUID?.() ?? 'unknown';

  // ── Extract CSRF tokens from cookie and header ──
  const csrfCookie = req.cookies.get(CSRF_COOKIE_NAME)?.value ?? null;
  const csrfHeader = req.headers.get('x-csrf-token') ?? null;

  // Ensure a CSRF cookie is always set
  const existingCookie = req.cookies.get(CSRF_COOKIE_NAME);
  const needsCsrfCookie = !existingCookie?.value || !/^[a-f0-9]{64}$/.test(existingCookie.value);

  // ── Collect cookies to set (auth router adds to this) ──
  const cookiesToSet: string[] = [];

  const response = await fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () =>
      createTRPCContext({
        user,
        csrfCookie,
        csrfHeader,
        isProduction,
        clientIp,
        correlationId,
        setCookies: (cookies: string[]) => {
          cookiesToSet.push(...cookies);
        },
      }),
    onError:
      process.env.NODE_ENV === 'development'
        ? ({ path, error }) => console.error(` tRPC failed on ${path}:`, error)
        : undefined,
  });

  // ── Apply collected cookies to response ──
  for (const cookie of cookiesToSet) {
    response.headers.append('Set-Cookie', cookie);
  }

  // Set CSRF cookie on the response if needed
  if (needsCsrfCookie) {
    const token = generateCsrfToken();
    response.headers.append('Set-Cookie', buildCsrfCookie(token, isProduction));
  }

  return response;
};

export { handler as GET, handler as POST };
