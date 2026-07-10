import { initTRPC, TRPCError } from '@trpc/server';
import { ZodError } from 'zod';
import type { Context } from './context';

const t = initTRPC.context<Context>().create({
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

// ---- Public (no auth) ----
export const publicProcedure = procedure;

// ---- Authenticated ----
const isAuthed = middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const protectedProcedure = procedure.use(isAuthed);

// ---- Role-based ----
const hasRole = (...roles: string[]) =>
  middleware(({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    if (!roles.includes(ctx.user.role)) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Insufficient permissions' });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
  });

export const customerProcedure = protectedProcedure.use(hasRole('CUSTOMER'));
export const technicianProcedure = protectedProcedure.use(hasRole('TECHNICIAN'));
export const adminProcedure = protectedProcedure.use(hasRole('ADMIN'));
export const staffProcedure = protectedProcedure.use(hasRole('TECHNICIAN', 'ADMIN'));
