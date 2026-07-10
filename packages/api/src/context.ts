import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';

/**
 * tRPC context — created for each request.
 * Extend this with auth, database, and other per-request state.
 */
export async function createTRPCContext(_opts?: CreateFastifyContextOptions) {
  return {
    // db: prisma,
    // session: null,
    // req: opts?.req,
    // res: opts?.res,
  };
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;
