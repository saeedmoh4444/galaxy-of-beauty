# Rules to Make a Well-Architected Platform

> **Galaxy of Beauty — Development Constitution**
> These rules are non-negotiable. They exist because we learned the hard way what breaks a platform.
> Every rule has a "why" — if you don't understand the why, ask before breaking the rule.

---

## Rule 0: The Prime Directive

**Every change must pass all checks before commit. Never skip a failing check.**

```
pnpm type-check   # Must exit 0 — ALL workspaces
pnpm test         # Must exit 0 — ALL 318+ tests
pnpm build        # Must exit 0 — ALL workspaces
```

**Why:** A broken build blocks everyone. A skipped test is a future bug. Type errors in production crash servers.

---

## Section A: Architecture Rules

### A1. Domain Boundaries Are Sacred

```
✅ CORRECT: Import from a domain barrel
import { bookingRouter, slotRouter } from '../domains/booking';

❌ WRONG: Deep import from another domain's internals
import { calculatePrice } from '../routers/bookings/internal';
```

**Why:** Domain boundaries enable future microservice extraction. A deep import creates hidden coupling that makes extraction impossible.

### A2. New Feature? New Domain (or Extend Existing)

```
1. Identify the domain: Does your feature belong to booking? payments? loyalty?
2. If new domain: create domains/<name>/index.ts
3. Add the router to routers/<name>.ts
4. Register in domains/<name>/index.ts (export)
5. Register in routers/index.ts (appRouter)
```

**Why:** 163 flat files was unmaintainable. 14 domains made it manageable. Don't undo this.

### A3. Shared Package — No JSX

```
✅ @galaxy/shared: types, constants, i18n, theme, utils (cn, formatCurrency)
✅ @galaxy/ui:     all JSX components, React hooks

❌ NEVER: put a React component in @galaxy/shared
❌ NEVER: import @galaxy/ui from @galaxy/api
```

**Why:** The API package must not depend on React. `@galaxy/shared` is pure TypeScript — importable from anywhere without DOM/JSX libs.

### A4. tRPC Middleware Chain — Never Skip Layers

```
Every procedure MUST follow the middleware chain:
publicProcedure       → rateLimitGuard
publicMutation        → rateLimitGuard → csrfGuard
protectedProcedure    → rateLimitGuard → isAuthed
protectedMutation     → rateLimitGuard → isAuthed → csrfGuard
customerProcedure     → rateLimitGuard → isAuthed → hasRole('CUSTOMER')
adminProcedure        → rateLimitGuard → isAuthed → hasRole('ADMIN')
```

**Why:** Rate limiting, CSRF, and auth are defense in depth. Skip one and you create a vulnerability.

### A5. Every Mutation Must Have Zod Validation

```
✅ CORRECT:
.input(z.object({ email: z.string().email(), password: z.string().min(8) }))

❌ WRONG:
.input(z.any())  // No validation
.mutation(async ({ input }) => { ... })  // No .input() at all
```

**Why:** Zod validates at runtime AND provides TypeScript types. Without it, any malformed input reaches your database.

---

## Section B: State Management Rules

### B1. The 4-State Pattern — No Exceptions

```
EVERY data-fetching page must handle these 4 states:

isLoading  → <Skeleton>       (or <CardSkeleton>, <DashboardSkeleton>, etc.)
isError    → <ErrorAlert>     (with onRetry button)
isEmpty    → <EmptyState>     (with CTA action)
data       → <DataView>       (the actual content)
```

**Why:** Users see loading spinners, not blank screens. Errors have retry buttons, not stack traces. Empty states guide users, not confuse them.

### B2. Mobile Mirrors Web — Same API, Same Patterns

```
✅ Mobile: import { trpc } from '@/lib/trpc-react'
✅ Mobile: <ScreenState isLoading={...} isError={...} isEmpty={...}>

❌ Mobile: import { trpc } from '@/lib/api'  (raw client, no hooks)
❌ Mobile: if (loading) return <SkeletonList />  (missing error/empty)
```

**Why:** The mobile app uses the same tRPC API as web. ScreenState gives us the same 4-state pattern with React Native primitives.

### B3. Form States — 4 States Again

```
idle      → Show the form
loading   → Disable submit button, show spinner
success   → Show success toast, redirect or reset
error     → Show error message above/below form
```

**Why:** Users need to know if their action succeeded or failed. A silent failure loses trust.

---

## Section C: API Design Rules

### C1. Procedures — query() vs mutation()

```
query()     = GET    = Read    = No side effects
mutation()  = POST   = Write   = Has side effects

✅ query:    bookings.list, services.search, wallet.getBalance
✅ mutation: bookings.create, wallet.topUp, auth.login
❌ NEVER:    query() that writes to the database
❌ NEVER:    mutation() that only reads (wastes CSRF protection)
```

### C2. Input Validation — Always Zod, Always Strict

```
✅ CORRECT:
const createBookingSchema = z.object({
  technicianId: z.number().int().positive(),
  serviceId: z.number().int().positive(),
  addressId: z.number().int().positive(),
  startAt: z.string().datetime(),
  idempotencyKey: z.string().uuid(),
});

❌ WRONG:
const schema = z.object({ data: z.any() });  // Anything goes
.mutation(async ({ input }) => { ... });     // No schema
```

### C3. Idempotency — Every Payment/Critical Mutation

```
✅ CORRECT:
const input = z.object({
  idempotencyKey: z.string().uuid(),
  amount: z.number().positive(),
});

// In the handler:
const existing = await prisma.payment.findUnique({
  where: { idempotencyKey: input.idempotencyKey },
});
if (existing) return existing;

❌ WRONG:
// No idempotencyKey — duplicate payment possible
```

**Why:** Network retries happen. Without idempotency, a retried payment charges twice.

### C4. Error Handling — Use the Error Catalog

```
✅ CORRECT:
import { notFound, unauthorized, conflict, validationError } from '../lib/errors';
throw notFound('Booking', bookingId);
throw unauthorized('Authentication required');

❌ WRONG:
throw new Error('Not found');           // Generic, no code
throw new TRPCError({ code: 'NOT_FOUND' });  // Inconsistent messages
```

**Why:** The error catalog gives consistent error codes, messages, and HTTP status codes across all 177 routers.

---

## Section D: Database Rules

### D1. Prisma Is the Only Data Access Layer

```
✅ prisma.booking.findMany({ where: { status: 'COMPLETED' } })
❌ prisma.$queryRaw`SELECT * FROM bookings WHERE status = 'COMPLETED'`
```

**Exception:** `$queryRawUnsafe` is allowed ONLY for:
- Health checks (`SELECT 1`)
- Performance queries (`pg_stat_activity`)
- Full-text search ILIKE fallback

**Why:** Prisma gives type safety. Raw SQL bypasses it. Only use raw SQL when Prisma literally cannot express the query.

### D2. Migrations Over db push in Production

```
Development: pnpm db:push        (fast, skip migration files)
Production:  pnpm db:migrate:deploy  (tracked, reversible)
```

**Why:** `db push` can cause data loss. Migrations are versioned, tested, and reversible.

### D3. Never Seed in Production Migrations

```
✅ Seed = prisma/seed.ts        (only via pnpm db:seed)
✅ Enrich = prisma/seed-enrich.ts  (only via pnpm db:seed:enrich)
❌ NEVER: put seed data in a migration file
```

### D4. Index Every Query Path

```
model Booking {
  @@index([customerId, status, createdAt])
  @@index([technicianId, status, startAt])
  @@index([status, createdAt])
}
```

**Why:** Without indexes, every query is a full table scan. At 500 bookings it's fine. At 500K bookings it's a production outage.

---

## Section E: Testing Rules

### E1. Every New Router Needs Tests

```
New router file:  routers/beautyDashboard.ts
Test file:        __tests__/beauty-dashboard.test.ts  (MANDATORY)
```

**Why:** Untested code is broken code waiting to be discovered in production.

### E2. Test File Structure

```
describe('Feature Name', () => {
  describe('Success cases', () => {
    it('should do the happy path', async () => { ... });
  });
  describe('Error cases', () => {
    it('should reject unauthorized access', async () => { ... });
    it('should reject invalid input', async () => { ... });
  });
  describe('Edge cases', () => {
    it('should handle empty results', async () => { ... });
    it('should handle concurrent requests', async () => { ... });
  });
});
```

### E3. Test Real Behavior, Not Implementation

```
✅ Test: "customer can create a booking with valid data"
❌ Test: "calls prisma.booking.create with correct parameters"

✅ Test: "returns 401 when unauthenticated"
❌ Test: "calls isAuthed middleware"
```

**Why:** Tests should verify behavior, not implementation. Implementation changes — behavior shouldn't.

---

## Section F: Mobile Rules

### F1. Every Data-Fetching Screen Uses ScreenState

```
✅ <ScreenState isLoading={...} isError={...} isEmpty={...} onRetry={...}>
    <YourContent />
  </ScreenState>

❌ if (loading) return <ActivityIndicator />
❌ Manual loading/error state management
```

### F2. Use trpc-react, Not Raw Client

```
✅ import { trpc } from '@/lib/trpc-react'
✅ const bookings = trpc.bookings.list.useQuery({ limit: 10 })

❌ import { trpc } from '@/lib/api'  (raw client)
❌ (trpc as any).bookings.list.query({ limit: 10 })
```

### F3. React Native Compatible Patterns

```
✅ {condition ? <Component /> : null}     // RN-safe conditional
❌ {condition && <Component />}            // Breaks in RN (false is not valid child)

✅ <Text>{value}</Text>                    // Text must be in <Text>
❌ <View>{value}</View>                     // Raw text in View crashes
```

---

## Section G: Performance Rules

### G1. No N+1 Queries

```
✅ const bookings = await prisma.booking.findMany({
    include: { service: true, technician: true },
  });

❌ const bookings = await prisma.booking.findMany();
   for (const b of bookings) {
     b.service = await prisma.service.findUnique({ where: { id: b.serviceId } }); // N+1!!!
   }
```

### G2. Paginate Everything

```
✅ .input(z.object({ page: z.number().default(1), limit: z.number().max(50).default(10) }))
✅ take: input.limit, skip: (input.page - 1) * input.limit

❌ .findMany() with no limit // Returns EVERYTHING
```

**Why:** A query returning 500K rows will OOM your server. Always paginate.

### G3. Async Side Effects Are Fire-and-Forget

```
✅ walletQueue.add('cashback.accrue', { userId, amount })  // Non-blocking
❌ await walletService.accrueCashback(userId, amount)       // Blocks booking response
```

**Why:** Booking creation should return in <500ms. Cashback, loyalty points, notifications, and calendar sync happen in the background via BullMQ.

---

## Section H: Security Rules

### H1. Never Trust the Client

```
✅ const user = await prisma.user.findUnique({ where: { id: ctx.user.id } });
✅ const ownBooking = await prisma.booking.findFirst({
    where: { id: input.bookingId, customerId: ctx.user.id },
  });

❌ const booking = await prisma.booking.findUnique({ where: { id: input.bookingId } });
   // No ownership check — any user can access any booking!
```

### H2. Secrets Never in Code

```
✅ DATABASE_URL=postgresql://... (in .env, NOT committed)
✅ JWT_ACCESS_SECRET=...          (in .env, NOT committed)

❌ const SECRET_KEY = 'my-secret-key-123';  // NEVER commit this
❌ process.env.DATABASE_URL || 'postgresql://admin:pass@localhost/db'  // No defaults
```

### H3. Rate Limiting on Every Public Procedure

```
// Already automatic via publicProcedure — DO NOT bypass
✅ export const myProcedure = publicProcedure.query(...)
❌ export const myProcedure = t.procedure.query(...)  // No rate limit!
```

---

## Section I: Code Review Checklist

Before merging any PR, verify:

```
[ ] pnpm type-check — ALL workspaces pass
[ ] pnpm test — ALL 318+ tests pass
[ ] pnpm build — ALL workspaces build
[ ] New routers have Zod validation on every input
[ ] New mutations have idempotency keys (if payment/critical)
[ ] New data-fetching pages have 4-state pattern (loading/error/empty/data)
[ ] New mobile screens use ScreenState + trpc-react
[ ] No raw SQL except in allowed exceptions (health check, perf, ILIKE)
[ ] No secrets committed (.env is in .gitignore)
[ ] No N+1 queries (use include or batch queries)
[ ] Pagination on all list endpoints
[ ] Auth check on all protected procedures (via middleware, not manual)
[ ] No imports from @galaxy/ui into @galaxy/api
[ ] No JSX in @galaxy/shared
```

---

## Section J: When to Break These Rules

Rules are defaults, not dogma. You can break a rule IF:

1. **You document why** — comment in the code explaining the exception
2. **You get review** — another developer confirms the exception is justified
3. **You add a test** — the exception is covered by tests
4. **You plan to fix it** — there's a ticket to bring it back into compliance

Examples of valid exceptions:
- Raw SQL for PostgreSQL full-text search (Prisma doesn't support it)
- `as any` for deeply nested tRPC RouterOutput types (TypeScript TS2589 limit)
- Skipping EmptyState on a form page (no list to be empty)

---

## Appendix: Quick Reference

### Add a new feature (step by step)

```
1. Add Prisma model to packages/db/prisma/schema.prisma
2. pnpm db:push (dev) or pnpm db:migrate:dev (migration)
3. pnpm db:generate
4. Create packages/api/src/routers/<feature>.ts
5. Add Zod validation schemas
6. Register in the right domain: domains/<domain>/index.ts
7. Register in routers/index.ts
8. Create web page: apps/web/src/app/<route>/page.tsx
9. Create mobile screen: apps/mobile/src/app/<route>/index.tsx
10. Add tests: packages/api/src/__tests__/<feature>.test.ts
11. Run: pnpm type-check && pnpm test && pnpm build
12. Commit
```

### Common commands

```bash
pnpm dev                  # Start all dev servers
pnpm type-check           # TypeScript check all workspaces
pnpm test                 # Run 318 API tests
pnpm build                # Build all workspaces
pnpm lint                 # Run ESLint
pnpm db:seed              # Seed database
pnpm db:seed:enrich       # Add 500+ bookings, 30+ customers
pnpm --filter @galaxy/api worker  # Start job queue workers
docker compose up -d      # Start PostgreSQL + Redis
docker compose ps         # Check service health
npx expo export --platform ios  # Test mobile build
```
