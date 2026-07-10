import { initTRPC } from '@trpc/server';
import type { TRPCContext } from './context';
import { ZodError } from 'zod';

const t = initTRPC.context<TRPCContext>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const { router, procedure, middleware, mergeRouters } = t;
export const publicProcedure = procedure;
