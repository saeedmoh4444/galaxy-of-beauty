# Architecture Context Map — ARCH-001

**Purpose**: Classify every feature domain and define dependency rules.
**Updated**: 2026-08-11
**Baseline**: 245 API routers, 202 database models

## Domain Classification

### Core (Must work correctly — revenue/safety critical)

| Domain           | Routers                                   | Models                                     | Risk             |
| ---------------- | ----------------------------------------- | ------------------------------------------ | ---------------- |
| Identity & Auth  | `auth.*`                                  | User, RefreshToken, ResetToken, Session    | Account takeover |
| Booking Engine   | `bookings.*`, `slots.*`, `availability.*` | Booking, BookingSlot, AvailabilitySlot     | Revenue loss     |
| Payments         | `payments.*`, `wallet.*`, `payouts.*`     | Payment, Wallet, WalletTransaction, Payout | Financial loss   |
| Disputes         | `disputes.*`                              | Dispute, DisputeEvidence                   | Chargeback       |
| Admin Operations | `admin.*`                                 | AuditLog, AdminAction                      | Privilege abuse  |

### Supporting (Customer-facing, non-critical)

| Domain          | Routers                                | Models                         |
| --------------- | -------------------------------------- | ------------------------------ |
| Service Catalog | `services.*`, `categories.*`, `tags.*` | Service, Category, ServiceTag  |
| Technicians     | `technicians.*`, `featuredTech.*`      | Technician, TechnicianBadge    |
| Reviews         | `reviews.*`                            | Review, ReviewReply            |
| Search          | `search.*`, `recommendations.*`        | (uses existing models)         |
| Notifications   | `notifications.*`, `push.*`            | Notification, PushSubscription |
| Chat            | `chat.*`, `messages.*`                 | ChatRoom, Message              |
| Uploads         | `uploads.*`                            | (S3/file system)               |

### Generic (Shared infrastructure)

| Domain        | Routers           | Notes                  |
| ------------- | ----------------- | ---------------------- |
| Health        | `health`          | Health check endpoints |
| i18n          | (shared package)  | Translation system     |
| Feature Flags | (trpc middleware) | Runtime toggles        |
| Monitoring    | `monitoring.*`    | Internal metrics       |
| Analytics     | `analytics.*`     | Usage tracking         |

### Experimental (Not production-ready — archive or gate)

| Domain            | Routers              | Recommendation                          |
| ----------------- | -------------------- | --------------------------------------- |
| Skin Analysis     | `skinAnalysis.*`     | Gate behind `ENABLE_SKIN_ANALYSIS` flag |
| Virtual Try-On    | `virtualTryOn.*`     | Gate behind `ENABLE_VIRTUAL_TRYON` flag |
| AI Chat           | `aiChat.*`           | Gate behind `ENABLE_AI_CHAT` flag       |
| Product Scanner   | `productScanner.*`   | Gate behind feature flag                |
| Predictive Demand | `predictiveDemand.*` | Archive (no router references)          |
| Beauty Trends     | `beautyTrends.*`     | Archive (unused)                        |
| Beauty Innovation | `beautyInnovation.*` | Merge into blog/content                 |
| Secret Santa      | `secretSanta.*`      | Gate seasonally                         |
| Time Capsule      | `timeCapsule.*`      | Archive (no active usage)               |
| Concierge         | `concierge.*`        | Beta — gate                             |

### Duplicate / Low Value — Archive Candidates

| Domain                         | Reason                              |
| ------------------------------ | ----------------------------------- |
| `beautySanta` vs `secretSanta` | Two implementations of same feature |
| `beautyQuests.*`               | No client-side integration          |
| `sisterhoodWish.*`             | Merged into sisterhood              |
| `socialFeed.*`                 | Duplicate of community posts        |
| `beautyMoodboard.*`            | Unused                              |
| `beautyScanner.*`              | Duplicate of productScanner         |

## Dependency Rules (enforced by ARCH-003)

```
config/ ──> (no deps)
shared/ ──> config/
db/     ──> config/
api/    ──> shared/, db/
ui/     ──> shared/
web/    ──> api/, ui/, db/ (SSR)
mobile/ ──> api/, ui/
```

### Forbidden Dependencies (CI must reject)

- `shared/` → `ui/` ❌ (was the circular dependency in Phase 0)
- `api/` → `ui/` ❌ (API must remain platform-agnostic)
- `db/` → `api/` ❌
- `shared/` → `api/` ❌

## Router Size Health

| Size           | Count                           | Action                |
| -------------- | ------------------------------- | --------------------- |
| >1000 lines    | 1 (`womensServices.ts` — 3,626) | 🔴 Emergency split    |
| 500–1000 lines | 6                               | 🟡 Split by subdomain |
| 300–500 lines  | 8                               | 🟡 Review for split   |
| <300 lines     | 230                             | ✅ Healthy            |

### Oversized Router Split Plan

1. **`womensServices.ts` (3,626 lines)** → Split into:
   - `womensServices/core.ts` — CRUD operations
   - `womensServices/packages.ts` — Package/bundle management
   - `womensServices/specialists.ts` — Specialist matching
   - `womensServices/privacy.ts` — Privacy/safety features

2. **`auth.ts` (837 lines)** → Already well-structured; extract:
   - 2FA operations into `auth/twoFactor.ts`
   - Email verification into `auth/verification.ts`

3. **`services.ts` (815 lines)** → Split by concern:
   - `services/catalog.ts` — Core CRUD
   - `services/search.ts` — Search operations (move to search router)
   - `services/addons.ts` — Add-on management

## any Budget — ARCH-006

| Workspace         | Current (Aug 2026) | Target (Dec 2026) | Reduction |
| ----------------- | ------------------ | ----------------- | --------- |
| `apps/mobile`     | 943                | 500               | -47%      |
| `apps/web`        | 286                | 150               | -48%      |
| `packages/api`    | 171                | 80                | -53%      |
| `packages/shared` | 0                  | 0                 | ✅ Done   |
| `packages/ui`     | 1                  | 0                 | -100%     |
| **Total**         | **1,401**          | **730**           | **-48%**  |

### Rules

1. **No new `any`** in Tier 1 domains (auth, bookings, payments, wallet)
2. **Prefer `unknown`** + type guards
3. **CI tracks** count regression (must not increase)
4. **Mobile `any`** can use `Record<string, unknown>` for dynamic API responses

## ESLint Suppression Review — ARCH-007

| Workspace                            | Count | Notes                         |
| ------------------------------------ | ----- | ----------------------------- |
| `@typescript-eslint/no-explicit-any` | ~180  | Vast majority of suppressions |
| Others                               | ~26   | Various rule bypasses         |

### Rules for Suppression

1. Every `eslint-disable` must have a comment explaining WHY
2. Link to an issue if temporary
3. No blanket disables on entire files
4. Maximum 90-day expiry for temporary suppressions
