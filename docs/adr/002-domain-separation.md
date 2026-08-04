# ADR-002: Domain Separation via Barrel Modules

**Date:** 2026-08-04
**Status:** Accepted

## Context

The API had 177 tRPC router files in a single flat directory (`packages/api/src/routers/`). Imports were unwieldy — `routers/index.ts` was 370 lines of individual imports. No clear ownership boundaries existed.

## Decision

Organize routers into 14 domain modules using barrel files (`domains/<name>/index.ts`). Each domain re-exports its routers. The main `routers/index.ts` imports from domains rather than individual files.

## Domains

| Domain | Routers | Responsibility |
|--------|---------|----------------|
| auth | 3 | Registration, login, JWT, 2FA, uploads |
| booking | 12 | Booking lifecycle, slots, calendar, reschedule, recurring, emergency, group |
| catalog | 14 | Categories, services, variants, search, gallery, recommendations |
| payments | 9 | Wallet, transactions, PayFort, saved cards, promo, gift cards, cashback |
| loyalty | 8 | Points, tiers, streaks, achievements, referrals, birthday rewards, VIP |
| social | 12 | Reviews, disputes, community, inspiration, challenges, follows, Q&A |
| admin | 13 | Dashboard, analytics, users, disputes, KYC, reports, settings, CMS |
| ai | 10 | Chatbot, skin analysis, virtual try-on, AI routines, personalized feed |
| zatca | 1 | E-invoicing compliance |
| realtime | 7 | Notifications, chat, live chat, video, WhatsApp bot, audio rooms |
| content | 15 | Blog, campaigns, events, tutorials, live stream, courses, stories |
| market | 13 | Marketplace, subscriptions, flash deals, group buy, bridal, gift registry |
| wellness | 21 | Self-care, tracking, budget, diary, cycle, spa, routines, reminders |
| operations | 18 | Addresses, home service, salon, ride hailing, corporate, franchise, IoT |

## Consequences

**Positive:**
- Clear ownership — a developer can own `booking/` without touching `loyalty/`
- Enables future microservice extraction — move a domain to its own service
- Imports are readable and maintainable
- New routers drop into the right domain immediately

**Negative:**
- Physical files still in flat `routers/` directory (barrel pattern, not full move)
- Some routers span multiple domains conceptually (e.g., reviews touches both social and booking)

## Alternatives Considered

1. **Physical file move** — Move each router file into `domains/<name>/`. Rejected because it would break all relative imports (`../trpc` → `../../trpc`) across 177 files. Too risky.
2. **No change** — Leave 177 files flat. Rejected because it doesn't scale.
3. **Microservices** — Extract each domain as a separate service. Rejected as premature at 1-10K user scale.
