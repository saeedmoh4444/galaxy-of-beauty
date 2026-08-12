# Development Workflow — Galaxy of Beauty

> Step-by-step guide for daily development. From zero to running app.

---

## Prerequisites

- **Node.js** v20+
- **pnpm** 9+ (`corepack enable && corepack prepare pnpm@9 --activate`)
- **Docker Desktop** (for PostgreSQL + Redis)
- **Git**

---

## First-Time Setup

```bash
# 1. Clone
git clone https://github.com/saeedmoh4444/galaxy-of-beauty.git
cd galaxy-of-beauty

# 2. Install
pnpm install

# 3. Start infrastructure
docker compose up -d postgres redis

# 4. Setup database
pnpm db:generate
pnpm db:push
pnpm db:seed

# 5. Start dev server
pnpm dev
# → Web: http://localhost:3000
# → Mobile: http://localhost:8081
```

---

## Daily Development

```bash
# Start fresh each day
docker compose up -d postgres redis   # Ensure DB + Redis are running
pnpm dev                               # Start all dev servers

# Before committing
pnpm type-check     # Must pass — 10/10 workspaces
pnpm test           # Must pass — 318/318 tests
pnpm build          # Must pass — 255 routes
pnpm lint           # Should be clean
```

---

## Test Credentials

| Role       | Email                     | Password       |
| ---------- | ------------------------- | -------------- |
| Admin      | `admin@galaxyofbeauty.sa` | `Admin@123456` |
| Customer   | `customer@test.com`       | `Admin@123456` |
| Technician | `tech1@test.com`          | `Admin@123456` |

All seed users use `Admin@123456`.

---

## Adding a New Feature

### 1. Database (if needed)

```bash
# Edit packages/db/prisma/schema.prisma
# Add your model

pnpm db:push              # Quick push to dev DB
pnpm db:generate           # Regenerate Prisma client
```

### 2. API Router

```typescript
// packages/api/src/routers/myFeature.ts
import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

export const myFeatureRouter = router({
  list: publicProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ input }) => {
      return prisma.myFeature.findMany({ take: input.limit });
    }),
});
```

### 3. Register Router

```typescript
// packages/api/src/domains/<domain>/index.ts
export { myFeatureRouter } from '../../routers/myFeature';

// packages/api/src/routers/index.ts
import { myFeatureRouter } from '../domains/<domain>';
// Add to appRouter: myFeature: myFeatureRouter,
```

### 4. Web Page

```typescript
// apps/web/src/app/(customer)/my-feature/page.tsx
'use client';
import { api } from '@/lib/trpc';
import { CardSkeleton, ErrorAlert, EmptyState } from '@galaxy/ui';

export default function MyFeaturePage() {
  const { data, isLoading, isError, isEmpty, refetch } = useMyData();

  if (isLoading) return <CardSkeleton />;
  if (isError) return <ErrorAlert message="..." onRetry={refetch} />;
  if (isEmpty) return <EmptyState title="..." />;
  return <DataView data={data} />;
}
```

### 5. Mobile Screen

```typescript
// apps/mobile/src/app/customer/my-feature/index.tsx
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';

export default function MyFeatureScreen() {
  const { data, isLoading, isError } = trpc.myFeature.list.useQuery({ limit: 10 });
  return (
    <ScreenState isLoading={isLoading} isError={isError} isEmpty={!data?.length} onRetry={refetch}>
      <YourContent data={data} />
    </ScreenState>
  );
}
```

### 6. Tests (MANDATORY)

```typescript
// packages/api/src/__tests__/my-feature.test.ts
import { describe, it, expect } from 'vitest';

describe('MyFeature', () => {
  it('should list items', async () => { ... });
  it('should reject unauthorized access', async () => { ... });
  it('should validate input', async () => { ... });
});
```

### 7. Verify and Commit

```bash
pnpm type-check && pnpm test && pnpm build
git add -A
git commit -m "feat: my new feature"
```

---

## Database Operations

```bash
pnpm db:generate           # Regenerate Prisma client
pnpm db:push               # Push schema to DB (dev only)
pnpm db:migrate:dev        # Create migration (committed to git)
pnpm db:migrate:deploy     # Apply migrations (production)
pnpm db:seed               # Reset + seed (100 rows)
pnpm db:seed:enrich        # Add 500 bookings, 30 customers, 100 reviews
pnpm db:studio             # Open Prisma Studio (GUI)
```

---

## Testing

```bash
# API tests (318 tests, 16 suites)
pnpm test

# Single test file
pnpm --filter @galaxy/api exec npx vitest run src/__tests__/auth-flow.test.ts

# Watch mode
pnpm --filter @galaxy/api exec npx vitest

# E2E tests (Playwright, web only)
pnpm --filter @galaxy/web test:e2e

# k6 load test
k6 run scripts/k6-load-test.js
```

---

## Docker

```bash
docker compose up -d              # Start all 5 services
docker compose up -d postgres redis  # Start just DB + cache
docker compose ps                 # Check health
docker compose logs -f web        # Tail web logs
docker compose down               # Stop all
docker compose down -v            # Stop + delete volumes (reset DB)
```

---

## Debugging

```bash
# Check API health
curl http://localhost:3000/api/trpc/health

# Check DB
docker exec gob-postgres psql -U gob_admin -d Galaxy_of_Beauty_db -c "SELECT count(*) FROM bookings;"

# Check Redis
docker exec gob-redis redis-cli PING

# Check build cache
pnpm turbo build --force

# TypeScript errors by file
pnpm type-check 2>&1 | grep "error TS"

# Failed tests with details
pnpm test 2>&1 | grep -A 5 "FAIL"
```

---

## Production Deployment

```bash
# 1. Build
pnpm build

# 2. Migrate
pnpm db:migrate:deploy

# 3. Start
cd apps/web && npx next start -p 3000

# 4. Workers
pnpm --filter @galaxy/api worker

# 5. Health check
curl https://galaxyofbeauty.sa/api/trpc/health
```

See `docs/DEPLOYMENT.md` for full production runbook (PM2, Nginx, SSL).
