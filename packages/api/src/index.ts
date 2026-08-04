export { createTRPCContext } from './context';
export type { TRPCContext, Context } from './context';
export { appRouter } from './routers/index';
export type { AppRouter } from './routers/index';
export { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from './lib/jwt';
export type { JwtPayload } from './lib/jwt';
export { hashPassword, verifyPassword } from './lib/password';
export { getEnv } from './lib/env';
export type { Env } from './lib/env';
export { generateCsrfToken, verifyCsrfToken, buildCsrfCookie, getCsrfCookieName, getCsrfHeaderName } from './lib/csrf';
export { initializeSocket, getIO, emitToUser, emitToTechnician, emitToWaitlist, emitToAdmin } from './socket/index';

// ── Type helpers for tRPC consumers ──
import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from './routers/index';

/** Fully typed router outputs. Use: type BookingList = RouterOutputs['bookings']['list'] */
export type RouterOutputs = inferRouterOutputs<AppRouter>;
