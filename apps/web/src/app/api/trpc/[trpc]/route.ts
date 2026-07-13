import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter, createTRPCContext } from '@galaxy/api';
import { verifyAccessToken } from '@galaxy/api';
import { generateCsrfToken, buildCsrfCookie } from '@galaxy/api';
import type { NextRequest } from 'next/server';

const CSRF_COOKIE_NAME = 'csrf-token';

const handler = async (req: NextRequest) => {
  // Extract JWT from Authorization header
  let user = null;
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    try {
      user = verifyAccessToken(authHeader.slice(7));
    } catch {
      // Invalid/expired token — proceed as unauthenticated
    }
  }

  // Extract CSRF tokens from cookie and header
  const csrfCookie = req.cookies.get(CSRF_COOKIE_NAME)?.value ?? null;
  const csrfHeader = req.headers.get('x-csrf-token') ?? null;

  // Ensure a CSRF cookie is always set
  const existingCookie = req.cookies.get(CSRF_COOKIE_NAME);
  const needsCsrfCookie = !existingCookie?.value || !/^[a-f0-9]{64}$/.test(existingCookie.value);

  const response = await fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ user, csrfCookie, csrfHeader }),
    onError:
      process.env.NODE_ENV === 'development'
        ? ({ path, error }) => console.error(`❌ tRPC failed on ${path}:`, error)
        : undefined,
  });

  // Set CSRF cookie on the response if needed
  if (needsCsrfCookie) {
    const token = generateCsrfToken();
    response.headers.set('Set-Cookie', buildCsrfCookie(token));
  }

  return response;
};

export { handler as GET, handler as POST };
