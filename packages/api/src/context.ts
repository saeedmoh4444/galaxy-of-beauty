import { prisma } from '@galaxy/db';
import type { JwtPayload } from './lib/jwt';

export interface TRPCContext {
  prisma: typeof prisma;
  user: JwtPayload | null;
  /** CSRF token from the client's cookie */
  csrfCookie: string | null;
  /** CSRF token from the X-CSRF-Token request header */
  csrfHeader: string | null;
  /** Whether the server is running in production mode */
  isProduction: boolean;
  /** Set auth cookies on the response (called by auth router) */
  setCookies: (cookies: string[]) => void;
  /** Client IP for rate limiting (privacy: only used for rate-limit key derivation) */
  clientIp: string | null;
  /** Correlation ID for request tracing across services */
  correlationId: string | null;
}

export interface CreateContextOptions {
  user?: JwtPayload | null;
  csrfCookie?: string | null;
  csrfHeader?: string | null;
  isProduction?: boolean;
  setCookies?: (cookies: string[]) => void;
  clientIp?: string | null;
  correlationId?: string | null;
}

export async function createTRPCContext(opts?: CreateContextOptions): Promise<TRPCContext> {
  return {
    prisma,
    user: opts?.user ?? null,
    csrfCookie: opts?.csrfCookie ?? null,
    csrfHeader: opts?.csrfHeader ?? null,
    isProduction: opts?.isProduction ?? false,
    setCookies: opts?.setCookies ?? (() => {}),
    clientIp: opts?.clientIp ?? null,
    correlationId: opts?.correlationId ?? null,
  };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
