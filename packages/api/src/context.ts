import { prisma } from '@galaxy/db';
import type { JwtPayload } from './lib/jwt';

export interface TRPCContext {
  prisma: typeof prisma;
  user: JwtPayload | null;
}

export async function createTRPCContext(opts?: { user?: JwtPayload | null }): Promise<TRPCContext> {
  return {
    prisma,
    user: opts?.user ?? null,
  };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
