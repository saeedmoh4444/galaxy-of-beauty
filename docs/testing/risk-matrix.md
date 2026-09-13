# API Risk Matrix — Tiered Testing Strategy

**Purpose**: Prioritize test coverage by business risk, not feature count.  
**Updated**: 2026-08-11

## Risk Tiers

| Tier       | Risk               | Impact                                     | Coverage Target           | CI Enforcement |
| ---------- | ------------------ | ------------------------------------------ | ------------------------- | -------------- |
| **Tier 1** | Critical           | Revenue loss, data breach, legal liability | ≥80% lines, ≥70% branches | Blocking       |
| **Tier 2** | High               | Customer-facing feature degradation        | ≥60% lines, ≥50% branches | Blocking       |
| **Tier 3** | Medium             | Non-critical UX degradation                | ≥40% lines                | Warning        |
| **Tier 4** | Low / Experimental | Internal tools, beta features              | Best effort               | Advisory       |

## Tier 1 — Critical (Must have comprehensive coverage)

These domains handle money, identity, availability, and personal data.

| Domain              | Routers                                                                                                                                                                                           | Risks                                                                 | Test Types Required               |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------- |
| **Auth & Sessions** | `auth.register`, `auth.login`, `auth.refresh`, `auth.logout`, `auth.me`, `auth.changePassword`, `auth.forgotPassword`, `auth.resetPassword`, `auth.setup2FA`, `auth.verify2FA`, `auth.disable2FA` | Account takeover, credential stuffing, session hijacking, token reuse | Unit + Integration + Security     |
| **Users**           | `users.*`                                                                                                                                                                                         | PII exposure, privilege escalation, account suspension bypass         | Integration + Authorization       |
| **Bookings**        | `bookings.*`, `slots.*`                                                                                                                                                                           | Double booking, revenue loss, slot conflict, availability corruption  | Unit + Integration + Concurrency  |
| **Payments**        | `payments.*`, `idempotency.*`                                                                                                                                                                     | Financial loss, duplicate charges, payment gateway failure            | Unit + Integration + Idempotency  |
| **Wallet**          | `wallet.*`, `wallet.topUp`, `wallet.transactions`                                                                                                                                                 | Balance corruption, unauthorized transfers, ledger integrity          | Unit + Integration + Double-spend |
| **Payouts**         | `payouts.*`                                                                                                                                                                                       | Technician non-payment, duplicate payouts, balance mismatch           | Integration + Reconciliation      |
| **Disputes**        | `disputes.*`                                                                                                                                                                                      | Chargeback handling, refund processing, evidence collection           | Integration                       |
| **Admin**           | `admin.users`, `admin.bookings`, `admin.technicians`, `admin.permissions`                                                                                                                         | Unauthorized admin actions, privilege escalation, audit bypass        | Authorization + Audit             |
| **Uploads**         | `uploads.*`                                                                                                                                                                                       | Malicious file upload, path traversal, DoS, PII leak via files        | Security + Integration            |
| **Socket.IO**       | `socket.auth`, `socket.rooms`                                                                                                                                                                     | Unauthorized room access, identity spoofing, event tampering          | Authorization + Integration       |
| **Notifications**   | `notifications.*`, `push.*`                                                                                                                                                                       | Missed booking confirmations, SMS/email spam, cost abuse              | Integration                       |

## Tier 2 — High (Customer-facing, lower blast radius)

| Domain          | Routers                                                              | Risks                                                    |
| --------------- | -------------------------------------------------------------------- | -------------------------------------------------------- |
| **Technicians** | `technicians.*`, `featuredTech.*`, `techCalendar.*`                  | Availability accuracy, search ranking, profile integrity |
| **Services**    | `services.*`, `categories.*`, `beautyServices.*`, `womensServices.*` | Catalog accuracy, pricing display, search results        |
| **Reviews**     | `reviews.*`                                                          | Review authenticity, rating calculation, moderation      |
| **Search**      | `search.*`, `recommendations.*`                                      | Search relevance, recommendation accuracy                |
| **Chat**        | `chat.*`, `messages.*`                                               | Message delivery, attachment handling, privacy           |
| **Waitlist**    | `waitlist.*`                                                         | Position accuracy, notification delivery                 |

## Tier 3 — Medium (Non-critical UX features)

| Domain                    | Routers                                                 |
| ------------------------- | ------------------------------------------------------- |
| **Loyalty**               | `loyalty.*`, `streaks.*`, `leaderboard.*`               |
| **Blog/Content**          | `blog.*`, `beautyTips.*`, `beautyAcademy.*`             |
| **Events**                | `beautyEvents.*`, `beautyWorkshops.*`                   |
| **Community**             | `beautyCommunity.*`, `sisterhood.*`, `beautyCircles.*`  |
| **Profile/Customization** | `beautyProfile.*`, `beautyJournal.*`, `beautyRoutine.*` |
| **Gift Cards**            | `giftCards.*`, `giftRegistry.*`                         |
| **Subscriptions**         | `subscriptions.*`, `membership.*`                       |
| **Marketplace**           | `marketplace.*`, `flashDeals.*`, `bundles.*`            |

## Tier 4 — Low / Experimental

| Domain           | Routers                                                           |
| ---------------- | ----------------------------------------------------------------- |
| **AI/ML**        | `skinAnalysis.*`, `virtualTryOn.*`, `aiChat.*`, `beautyScanner.*` |
| **Wellness**     | `wellness.*`, `wellnessTracker.*`, `selfCare.*`, `affirmations.*` |
| **Social**       | `socialFeed.*`, `inspiration.*`, `beautyMoodboard.*`              |
| **Gamification** | `beautyQuests.*`, `beautyChallenges.*`, `badges.*`                |
| **Innovation**   | `beautyInnovation.*`, `beautyTrends.*`, `predictiveDemand.*`      |
| **Special**      | `secretSanta.*`, `timeCapsule.*`, `concierge.*`                   |

## Test Coverage Order

Test in this priority order, not alphabetically:

1. Identity & Session (auth, users)
2. Money & Transactions (payments, wallet, payouts, disputes)
3. Booking & Availability (bookings, slots, waitlist)
4. Authorization & Admin (permissions, admin routes)
5. Uploads & Notifications
6. Real-time (Socket.IO)
7. Tier 2 routers by usage frequency
8. Tier 3 routers by usage frequency
9. Tier 4 routers — archive or remove unused routes before testing

## Coverage Commands

```bash
# Run tests with coverage
pnpm --filter @galaxy/api test -- --coverage

# View HTML report
open packages/api/coverage/index.html

# CI coverage check (fails below threshold)
pnpm --filter @galaxy/api test -- --coverage --coverage.thresholds
```
