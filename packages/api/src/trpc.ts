import { initTRPC, TRPCError } from '@trpc/server';
import { ZodError } from 'zod';
import type { Context } from './context';
import { verifyCsrfToken } from './lib/csrf';
import { checkRateLimit } from './lib/rateLimit';

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

// ---- Rate Limiting Middleware ----
const rateLimitGuard = middleware(async ({ ctx, next, path }) => {
  const tier = ctx.user
    ? ctx.user.role === 'ADMIN' ? 'admin' : 'authenticated'
    : 'anonymous';
  const key = ctx.user ? `user:${ctx.user.id}` : `anon:${path}`;

  const result = await checkRateLimit(key, tier as 'anonymous' | 'authenticated' | 'admin');
  if (!result.allowed) {
    throw new TRPCError({
      code: 'TOO_MANY_REQUESTS',
      message: `Rate limit exceeded. Reset at ${new Date(result.resetAt * 1000).toISOString()}`,
    });
  }

  return next();
});

// ---- Public (no auth) ----
// All procedures get rate-limited by default
export const publicProcedure = procedure.use(rateLimitGuard);

// ---- CSRF Protection (applied to mutations) ----
const csrfGuard = middleware(({ ctx, next }) => {
  // Read CSRF cookie and header from the context
  const cookieToken = ctx.csrfCookie ?? null;
  const headerToken = ctx.csrfHeader ?? null;

  if (!verifyCsrfToken(cookieToken, headerToken)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'CSRF token missing or invalid',
    });
  }

  return next();
});

/**
 * Public mutation — CSRF-protected, no auth required.
 */
export const publicMutation = procedure.use(csrfGuard);

// ---- Authenticated ----
const isAuthed = middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const protectedProcedure = procedure.use(isAuthed);

/**
 * Protected mutation — requires auth + CSRF.
 */
export const protectedMutation = protectedProcedure.use(csrfGuard);

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

/**
 * Role-based mutations — require auth + role + CSRF.
 */
export const customerMutation = customerProcedure.use(csrfGuard);
export const technicianMutation = technicianProcedure.use(csrfGuard);
export const adminMutation = adminProcedure.use(csrfGuard);
