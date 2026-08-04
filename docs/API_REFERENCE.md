# API Reference — Galaxy of Beauty

> **177 tRPC routers, 400+ procedures, 14 domain modules**
> All endpoints are type-safe. No REST endpoints. Use the tRPC client.

---

## Quick Start

```typescript
// Web (Next.js)
import { api } from '@/lib/trpc';
const { data } = api.categories.list.useQuery();

// Mobile (Expo)
import { trpc } from '@/lib/trpc-react';
const { data } = trpc.categories.list.useQuery();
```

---

## Domain: Auth (3 routers)

| Procedure | Type | Auth | Description |
|-----------|------|------|-------------|
| `auth.register` | mutation | Public | Register new user |
| `auth.login` | mutation | Public | Login (returns JWT + user) |
| `auth.refresh` | mutation | Public | Refresh access token |
| `auth.me` | query | Protected | Get current user |
| `auth.changePassword` | mutation | Protected | Change password |
| `auth.forgotPassword` | mutation | Public | Send reset email |
| `auth.resetPassword` | mutation | Public | Reset with token |
| `auth.setupTwoFactor` | mutation | Protected | Enable 2FA (returns secret/QR) |
| `auth.verifyTwoFactor` | mutation | Protected | Verify + enable 2FA |
| `auth.disableTwoFactor` | mutation | Protected | Disable 2FA |
| `users.getMe` | query | Protected | User profile |
| `users.updateProfile` | mutation | Protected | Update profile |
| `users.mySessions` | query | Protected | List active sessions |
| `users.revokeSession` | mutation | Protected | Revoke a session |
| `users.revokeOtherSessions` | mutation | Protected | Revoke all other sessions |
| `uploads.upload` | mutation | Protected | Upload file (avatar, KYC, gallery) |

## Domain: Booking (12 routers)

| Procedure | Type | Auth | Description |
|-----------|------|------|-------------|
| `bookings.create` | mutation | Customer | Create booking |
| `bookings.list` | query | Protected | List user's bookings |
| `bookings.getById` | query | Protected | Booking detail |
| `bookings.cancel` | mutation | Customer | Cancel booking |
| `bookings.accept` | mutation | Technician | Accept booking |
| `bookings.reject` | mutation | Technician | Reject booking |
| `bookings.start` | mutation | Technician | Start service |
| `bookings.complete` | mutation | Technician | Complete booking |
| `bookings.noShow` | mutation | Technician | Mark no-show |
| `slots.create` | mutation | Technician | Create availability slot |
| `slots.bulkCreate` | mutation | Technician | Bulk create slots |
| `slots.list` | query | Public | List available slots |
| `calendar.list` | query | Protected | Calendar view |
| `reschedule.request` | mutation | Customer | Request reschedule |
| `recurringBookings.*` | — | Customer | Manage recurring bookings |
| `emergencyBooking.*` | — | Customer | Emergency booking (+50 SAR) |
| `advancedBooking.*` | — | Customer | Advanced booking |
| `groupBookings.*` | — | Customer | Group/party booking |
| `waitlist.*` | — | Customer | Join waitlist |
| `calendarSync.*` | — | Technician | Google Calendar sync |
| `bookingChecklist.*` | — | Customer | Pre-booking checklist |
| `bookingHeatmap.*` | — | Public | Booking density heatmap |

## Domain: Catalog (14 routers)

| Procedure | Type | Auth | Description |
|-----------|------|------|-------------|
| `categories.list` | query | Public | List categories (hierarchical) |
| `services.list` | query | Public | List services (search, filter, sort) |
| `services.getById` | query | Public | Service detail + variants |
| `search.search` | query | Public | Full-text search (Arabic ILIKE) |
| `search.nearMe` | query | Public | Find nearby technicians |
| `gallery.*` | — | Public | Technician portfolio |
| `recommendations.*` | — | Customer | Personalized recommendations |
| `favorites.*` | — | Customer | Quick-booking favorites |
| `serviceRecommender.*` | — | Public | Quiz-based recommendations |
| `serviceMatchmaker.*` | — | Public | Match services to preferences |
| `serviceTrends.*` | — | Public | Trending services |
| `serviceWishlist.*` | — | Customer | Price-tracking wishlist |
| `serviceMenuQr.*` | — | Public | QR code service menu |
| `priceEstimator.*` | — | Public | Price calculator |
| `productCompare.*` | — | Public | Compare beauty products |

## Domain: Payments (9 routers)

| Procedure | Type | Auth | Description |
|-----------|------|------|-------------|
| `wallet.getBalance` | query | Customer | Wallet balance |
| `wallet.getTransactions` | query | Customer | Transaction history |
| `wallet.topUp` | mutation | Customer | Add funds |
| `wallet.withdraw` | mutation | Customer | Withdraw to bank |
| `payments.authorize` | mutation | Customer | Authorize payment (PayFort) |
| `payments.capture` | mutation | Admin | Capture authorized payment |
| `payments.refund` | mutation | Admin | Refund payment |
| `payouts.list` | query | Technician | List payouts |
| `payouts.request` | mutation | Technician | Request payout |
| `savedCards.*` | — | Customer | Manage saved cards |
| `promo.*` | — | Customer | Validate/redeem promo codes |
| `giftCards.*` | — | Customer | Purchase/redeem gift cards |
| `giftCardMarket.*` | — | Customer | P2P gift card market |
| `cashback.*` | — | Customer | Cashback history |
| `bnpl.*` | — | Customer | Buy now, pay later |

## Domain: Loyalty (8 routers)

| Procedure | Type | Auth | Description |
|-----------|------|------|-------------|
| `loyalty.myAccount` | query | Customer | Loyalty status + tier |
| `loyalty.myTransactions` | query | Customer | Points history |
| `loyalty.rewards` | query | Public | Available rewards catalog |
| `loyalty.redeem` | mutation | Customer | Redeem points |
| `streaks.get` | query | Customer | Current streak |
| `streaks.getAchievements` | query | Customer | Earned achievements |
| `referrals.getMyCode` | query | Customer | Referral code + stats |
| `referrals.redeem` | mutation | Customer | Redeem referral reward |
| `customerAchievements.*` | — | Customer | Achievement display |
| `loyaltyPunchCard.*` | — | Customer | Punch card progress |
| `birthdayRewards.*` | — | Customer | Birthday reward claims |
| `vipMembership.*` | — | Customer | VIP tier management |
| `referralRace.*` | — | Public | Referral leaderboard |

## Admin Endpoints

All admin endpoints require `ADMIN` role. Key routers:

| Router | Key Queries |
|--------|------------|
| `admin` | `dashboardStats`, `auditLogs`, user/booking management |
| `adminAnalyticsV2` | Advanced analytics + reports |
| `adminReports` | Financial + operational reports |
| `adminTools` | Platform tools (export, bulk ops) |
| `analytics` | Customer insights, trends |
| `cms` | Content management |
| `featureFlags` | Feature flag management |
| `monitoring` | Live system health + metrics |
| `platform` | Platform config + maintenance |

### CSV Export

```
GET /api/export/bookings?status=COMPLETED&from=2026-01-01&to=2026-12-31
→ CSV download with Content-Disposition header
→ Auth: gob_access cookie required
```

---

## API Conventions

### Middleware Chain
```
publicProcedure       = rateLimit → handler
publicMutation        = rateLimit → csrf → handler
protectedProcedure    = rateLimit → auth → handler
protectedMutation     = rateLimit → auth → csrf → handler
adminProcedure        = rateLimit → auth → admin → handler
```

### Error Format
```json
{
  "error": {
    "json": {
      "message": "Resource not found",
      "code": -32004,
      "data": {
        "code": "NOT_FOUND",
        "httpStatus": 404
      }
    }
  }
}
```

### Rate Limits
| Tier | Requests/min |
|------|-------------|
| Anonymous | 20 |
| Authenticated | 60 |
| Admin | 300 |

### Health Check
```
GET /api/trpc/health
→ { status: "ok" | "degraded", checks: { database, redis }, uptime }
```
