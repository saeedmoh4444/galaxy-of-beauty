import { initTRPC, TRPCError } from '@trpc/server';
import { ZodError } from 'zod';
import superjson from 'superjson';
import type { Context } from './context';
import { verifyCsrfToken } from './lib/csrf';
import { checkRateLimit } from './lib/rateLimit';
import { incrementRequestCount, incrementErrorCount, recordTiming } from './lib/requestCounters';
import { recordSloRequest, recordSloError, recordSloLatency } from './lib/slo';
import { startProcedureSpan } from './lib/tracing';

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
// 7.3: the SLO counters feed from here — one request, one latency sample,
// one error per procedure, for both http and createCaller. tRPC v11 note:
// downstream errors do NOT reject next() — they arrive as result.ok=false.
const requestCounter = t.middleware(async ({ next, path }) => {
  recordSloRequest();
  incrementRequestCount();
  const t0 = performance.now();
  const result = await next();
  if (!result.ok) recordSloError();
  const duration = performance.now() - t0;
  recordSloLatency(duration);
  recordTiming(path, duration);
  return result;
});

// ── 7.3 Tracing Middleware — span per procedure (noop when OTEL off) ──
const tracingGuard = t.middleware(async ({ ctx, path, type, next }) => {
  const span = startProcedureSpan(path, type as 'query' | 'mutation', {
    'user.id': ctx.user?.id ?? 'anonymous',
  });
  try {
    // tRPC v11: downstream errors do NOT reject next() — they arrive as
    // result.ok === false, so record the exception from the result.
    const result = await next();
    if (!result.ok) span.recordException(result.error as Error);
    return result;
  } finally {
    span.end();
  }
});

export const { router, procedure, middleware, mergeRouters } = t;

// ---- Rate Limiting Middleware ----
const rateLimitGuard = middleware(async ({ ctx, next, path }) => {
  const tier = ctx.user ? (ctx.user.role === 'ADMIN' ? 'admin' : 'authenticated') : 'anonymous';

  // Anonymous: key by client IP + path to prevent one client exhausting the bucket
  // Authenticated: key by user ID
  // Admin: key by user ID (separate, higher limit)
  const clientId = ctx.user ? `${ctx.user.id}` : ctx.clientIp || 'unknown';
  const key = `${clientId}:${path}`;

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
// All procedures get request-counted and rate-limited by default.
// .meta({ tier }) stamps the minimum auth tier; it is inert at runtime and
// consumed only by the router-inventory snapshot gate (__tests__/
// router-inventory.test.ts) — meta propagates through .use() chains.
export const publicProcedure = procedure
  .use(tracingGuard)
  .use(requestCounter)
  .use(rateLimitGuard)
  .meta({ tier: 'public' });

// ---- CSRF Protection (applied to mutations) ----
const csrfGuard = middleware(({ ctx, next }) => {
  // Non-browser clients (native apps, curl) don't send an Origin header
  // and have no ambient cookie jar for an attacker to ride, so the
  // browser CSRF threat model doesn't apply — skip the guard for them.
  // Browsers always send Origin on POST (fetch and form submissions).
  if (!ctx.origin) return next();

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
export const publicMutation = procedure
  .use(tracingGuard)
  .use(requestCounter)
  .use(rateLimitGuard)
  .use(csrfGuard)
  .meta({ tier: 'public' });

// ---- Authenticated ----
const isAuthed = middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const protectedProcedure = procedure
  .use(tracingGuard)
  .use(isAuthed)
  .use(rateLimitGuard)
  .meta({ tier: 'protected' });

/**
 * Protected mutation — requires auth + CSRF.
 */
export const protectedMutation = protectedProcedure.use(csrfGuard).meta({ tier: 'protected' });

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

export const customerProcedure = protectedProcedure
  .use(hasRole('CUSTOMER'))
  .meta({ tier: 'customer' });
export const technicianProcedure = protectedProcedure
  .use(hasRole('TECHNICIAN'))
  .meta({ tier: 'technician' });
export const adminProcedure = protectedProcedure.use(hasRole('ADMIN')).meta({ tier: 'admin' });
export const staffProcedure = protectedProcedure
  .use(hasRole('TECHNICIAN', 'ADMIN'))
  .meta({ tier: 'staff' });

/**
 * Role-based mutations — require auth + role + CSRF.
 */
export const customerMutation = customerProcedure.use(csrfGuard).meta({ tier: 'customer' });
export const technicianMutation = technicianProcedure.use(csrfGuard).meta({ tier: 'technician' });
export const adminMutation = adminProcedure.use(csrfGuard).meta({ tier: 'admin' });

// ---- Resource Ownership ----

/**
 * Ensures the authenticated user owns the resource identified by the given
 * owner-extraction function. Throws FORBIDDEN if not the owner.
 *
 * Admins always bypass the ownership check (they can access any user's data
 * for support/audit purposes).
 *
 * Usage:
 *   protectedProcedure
 *     .input(z.object({ bookingId: z.number() }))
 *     .use(requireOwnership(async ({ ctx, input }) => {
 *       const booking = await prisma.booking.findUnique({ where: { id: input.bookingId } });
 *       return booking?.customerId ?? null;
 *     }))
 *     .query(...)
 */
export function requireOwnership(
  getOwnerId: (opts: { ctx: Context }) => Promise<number | null> | number | null,
) {
  return middleware(async ({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    // Admins bypass ownership checks (support/audit access)
    if (ctx.user.role === 'ADMIN') return next();

    const ownerId = await getOwnerId({ ctx });

    if (ownerId === null) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Resource not found' });
    }

    if (ownerId !== ctx.user.id) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied — not your resource' });
    }

    return next();
  });
}

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
