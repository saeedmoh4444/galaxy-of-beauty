import { prisma } from '@galaxy/db';
import type { JwtPayload } from './lib/jwt';

export interface TRPCContext {
  prisma: typeof prisma;
  user: JwtPayload | null;
  /** CSRF token from the client's cookie */
  csrfCookie: string | null;
  /** CSRF token from the X-CSRF-Token request header */
  csrfHeader: string | null;
  /** Origin header — null for non-browser clients (native apps, curl) */
  origin: string | null;
  clientPlatform: string | null;
  /** Whether the server is running in production mode */
  isProduction: boolean;
  /** Set auth cookies on the response (called by auth router) */
  setCookies: (cookies: string[]) => void;
  /** Client IP for rate limiting (privacy: only used for rate-limit key derivation) */
  clientIp: string | null;
  /** Correlation ID for request tracing across services */
  correlationId: string | null;
  /** D1 — raw X-Api-Key header (vendor API auth; null for browser calls) */
  apiKey: string | null;
}

export interface CreateContextOptions {
  user?: JwtPayload | null;
  csrfCookie?: string | null;
  csrfHeader?: string | null;
  origin?: string | null;
  clientPlatform?: string | null;
  isProduction?: boolean;
  setCookies?: (cookies: string[]) => void;
  clientIp?: string | null;
  correlationId?: string | null;
  apiKey?: string | null;
}

export async function createTRPCContext(opts?: CreateContextOptions): Promise<TRPCContext> {
  return {
    prisma,
    user: opts?.user ?? null,
    csrfCookie: opts?.csrfCookie ?? null,
    csrfHeader: opts?.csrfHeader ?? null,
    origin: opts?.origin ?? null,
    clientPlatform: opts?.clientPlatform ?? null,
    isProduction: opts?.isProduction ?? false,
    setCookies: opts?.setCookies ?? (() => {}),
    clientIp: opts?.clientIp ?? null,
    correlationId: opts?.correlationId ?? null,
    apiKey: opts?.apiKey ?? null,
  };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
