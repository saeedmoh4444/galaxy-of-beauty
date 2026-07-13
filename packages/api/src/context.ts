import { prisma } from '@galaxy/db';
import type { JwtPayload } from './lib/jwt';

export interface TRPCContext {
  prisma: typeof prisma;
  user: JwtPayload | null;
  /** CSRF token from the client's cookie */
  csrfCookie: string | null;
  /** CSRF token from the X-CSRF-Token request header */
  csrfHeader: string | null;
}

export interface CreateContextOptions {
  user?: JwtPayload | null;
  csrfCookie?: string | null;
  csrfHeader?: string | null;
}

export async function createTRPCContext(opts?: CreateContextOptions): Promise<TRPCContext> {
  return {
    prisma,
    user: opts?.user ?? null,
    csrfCookie: opts?.csrfCookie ?? null,
    csrfHeader: opts?.csrfHeader ?? null,
  };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
