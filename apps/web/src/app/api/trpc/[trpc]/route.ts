import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter, createTRPCContext } from '@galaxy/api';
import { verifyAccessToken } from '@galaxy/api';
import type { NextRequest } from 'next/server';

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

  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ user }),
    onError:
      process.env.NODE_ENV === 'development'
        ? ({ path, error }) => console.error(`❌ tRPC failed on ${path}:`, error)
        : undefined,
  });
};

export { handler as GET, handler as POST };
