# System Architecture — Galaxy of Beauty

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENTS                               │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │ apps/web         │  │ apps/mobile      │                 │
│  │ Next.js 15 (SSR) │  │ Expo SDK 57      │                 │
│  │ 90+ pages        │  │ Expo Router      │                 │
│  │ tRPC Client      │  │ React Query      │                 │
│  │ React Query      │  │                  │                 │
│  └────────┬─────────┘  └────────┬─────────┘                │
└───────────┼─────────────────────┼──────────────────────────┘
            │ tRPC over HTTP      │
┌───────────▼─────────────────────▼──────────────────────────┐
│                     API LAYER                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ packages/api — tRPC v11 (243 routers)                │   │
│  │ Middleware: rateLimit → auth → role → CSRF → Zod     │   │
│  └──────────────────────┬───────────────────────────────┘   │
│  ┌──────────────────────┼───────────────────────────────┐   │
│  │ packages/db          │  packages/shared              │   │
│  │ Prisma (202 models)  │  UI kit, i18n, types          │   │
│  └──────────────────────┴───────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
            │
┌───────────▼───────────────────────────────────────────────┐
│                    INFRASTRUCTURE                           │
│  PostgreSQL 15 · Redis 7 · Socket.IO · Docker Compose     │
│  PayFort/APS · OpenAI · Google Calendar · ZATCA · SMS    │
│  Leaflet/OSM · MediaPipe · Cloudinary · Sentry           │
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

## Feature Inventory (v2.1.0)

| Category    | Features                                                                                  |
| ----------- | ----------------------------------------------------------------------------------------- |
| Core        | Booking System · Payments (PayFort) · Wallet · Auth (JWT+2FA) · AI Chatbot                |
| Commerce    | Gift Cards · Beauty Packages · Price Estimator · Flash Deals · Box Builder · Marketplace  |
| Social      | Community Feed · Group Bookings · Mood Board · Technician Q&A · Referrals                 |
| Content     | Blog · Beauty Tutorials · Live Stream · Beauty Courses · Lookbook · Campaigns             |
| Wellness    | Self-Care Tracker · Beauty Budget · Beauty Profile · Wellness Tracker · Post-Service Care |
| Innovation  | Virtual Try-On AR · AI Skin Analysis · AI Routine Builder · Beauty Analytics              |
| Wedding     | Bridal Concierge · Gift Registry                                                          |
| Family      | Family Account · Mommy & Me                                                               |
| Loyalty     | Loyalty Tiers · Challenges · Birthday Rewards · VIP Membership · Streaks                  |
| Discovery   | Salon Map · Search · Technician Badges · Events · Event Ticketing                         |
| Convenience | Home Service · Service Warranty · Recurring Bookings · Emergency Booking                  |
| Platform    | i18n (ar/en) · ZATCA · Notifications · PWA · Calendar Sync                                |

## Key Design Decisions

See `docs/adr/` for detailed architecture decision records.

| Decision                 | Rationale                                                |
| ------------------------ | -------------------------------------------------------- |
| tRPC over REST           | End-to-end type safety, no code generation               |
| Prisma over raw SQL      | Type-safe queries, migration support, productivity       |
| Next.js over Vite SPA    | SSR/ISR for SEO, file-based routing, API routes          |
| Separate Socket.IO       | Next.js 15 App Router doesn't support WebSocket upgrade  |
| JSONB for i18n           | Simpler than translation tables, works with Prisma Json  |
| `prisma db push` for dev | Faster iteration; `prisma migrate deploy` for production |
