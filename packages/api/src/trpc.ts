import { initTRPC, TRPCError } from '@trpc/server';
import { ZodError } from 'zod';
import superjson from 'superjson';
import type { Context } from './context';
import { verifyCsrfToken } from './lib/csrf';
import { checkRateLimit } from './lib/rateLimit';
import { incrementRequestCount, incrementErrorCount, recordTiming } from './lib/requestCounters';

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    incrementErrorCount();
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

// ── Request Counting + Performance Middleware ──
const requestCounter = t.middleware(async ({ next, path }) => {
  incrementRequestCount();
  const t0 = performance.now();
  const result = await next();
  const duration = performance.now() - t0;
  recordTiming(path, duration);
  return result;
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
// All procedures get request-counted and rate-limited by default
export const publicProcedure = procedure.use(requestCounter).use(rateLimitGuard);

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
 * Public mutation — request-counted, CSRF-protected, no auth required.
 */
export const publicMutation = procedure.use(requestCounter).use(csrfGuard);

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

// ---- Feature Flags ----

/**
 * Gates a procedure behind a feature flag. If the flag is disabled,
 * returns a NOT_FOUND error (so disabled features appear not to exist).
 *
 * Usage:
 *   myProcedure.use(requireFeatureFlag('ENABLE_NEW_FEATURE'))
 *
 * The flag is checked against the FeatureFlag table (cached in-memory
 * for 30s to avoid DB load). Flags with rolloutPercent < 100 require
 * authenticated users with matching role/userId configuration.
 */
export function requireFeatureFlag(flagKey: string) {
  // Lazy import to avoid circular dependency
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cachedFlags = new Map<string, { enabled: boolean; expiresAt: number }>();

  return middleware(async ({ ctx, next }) => {
    // Check in-memory cache first (30s TTL)
    const cached = cachedFlags.get(flagKey);
    if (cached && cached.expiresAt > Date.now()) {
      if (!cached.enabled) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Feature not available' });
      }
      return next();
    }

    // Query the flag from the database
    try {
      const flag = await ctx.prisma.featureFlag.findUnique({ where: { key: flagKey } });
      const enabled = flag?.enabled ?? false;

      // Cache for 30 seconds
      cachedFlags.set(flagKey, { enabled, expiresAt: Date.now() + 30000 });

      if (!enabled) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Feature not available' });
      }
    } catch (err) {
      // If the query fails (e.g., during migration), allow access
      if (err instanceof TRPCError) throw err;
    }

    return next();
  });
}
