# System Architecture — Galaxy of Beauty

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENTS                               │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │ apps/web         │  │ apps/mobile      │                 │
│  │ Next.js 14 (SSR) │  │ Expo SDK 54      │                 │
│  │ tRPC Client      │  │ Expo Router      │                 │
│  │ React Query      │  │ React Query      │                 │
│  └────────┬─────────┘  └────────┬─────────┘                │
└───────────┼─────────────────────┼──────────────────────────┘
            │ tRPC over HTTP      │
┌───────────▼─────────────────────▼──────────────────────────┐
│                     API LAYER                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ packages/api — tRPC v11 (45 routers)                 │   │
│  │ Middleware: rateLimit → auth → role → CSRF → Zod     │   │
│  └──────────────────────┬───────────────────────────────┘   │
│  ┌──────────────────────┼───────────────────────────────┐   │
│  │ packages/db          │  packages/shared              │   │
│  │ Prisma (42 models)   │  UI kit, i18n, types          │   │
│  └──────────────────────┴───────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
            │
┌───────────▼───────────────────────────────────────────────┐
│                    INFRASTRUCTURE                           │
│  PostgreSQL 15 · Redis 7 · Socket.IO · Docker Compose     │
│  PayFort/APS · OpenAI · Google Calendar · ZATCA · SMS    │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow: Booking Lifecycle

```
1. Customer browses services → categories.list (Redis-cached, 5min)
2. Customer views service → services.getById (SSR, server component)
3. Customer creates booking → bookings.create (CSRF, idempotency key)
   ├── Validates slot availability
   ├── Creates booking (status: REQUESTED)
   └── Emits Socket.IO event → technician room
4. Technician accepts → bookings.transition (ACCEPTED)
   ├── Confirms slot reservation
   └── Emits Socket.IO event → customer room
5. Payment authorized → payments.authorize
   ├── PayFort/APS API call
   └── Credits cashback to wallet
6. Service completed → bookings.transition (COMPLETED)
   ├── Unlocks review creation
   ├── Updates streak counter
   └── Credits loyalty points
7. Optional dispute → disputes.create
   └── Admin resolves → disputes.resolve
```

## Key Design Decisions

See `docs/adr/` for detailed architecture decision records.

| Decision | Rationale |
|----------|-----------|
| tRPC over REST | End-to-end type safety, no code generation |
| Prisma over raw SQL | Type-safe queries, migration support, productivity |
| Next.js over Vite SPA | SSR/ISR for SEO, file-based routing, API routes |
| Separate Socket.IO | Next.js 14 App Router doesn't support WebSocket upgrade |
| JSONB for i18n | Simpler than translation tables, works with Prisma Json |
| `prisma db push` for dev | Faster iteration; `prisma migrate deploy` for production |
