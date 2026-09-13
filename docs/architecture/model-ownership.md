# Model Ownership Map — DATA-001

**Purpose**: Assign every Prisma model to a bounded context and lifecycle status.
**Updated**: 2026-08-11
**Source**: `packages/db/prisma/schema.prisma` (202 models)

## Bounded Contexts

### 1. Identity & Access (core)

| Model            | Status | Notes                         |
| ---------------- | ------ | ----------------------------- |
| User             | Active | Core entity                   |
| Session          | Active | Multi-device session tracking |
| RefreshToken     | Active | Token family rotation         |
| ResetToken       | Active | Password reset flow           |
| EmailVerifyToken | Active | (embedded in User)            |

### 2. Booking & Availability (core)

| Model                  | Status | Notes                |
| ---------------------- | ------ | -------------------- |
| Booking                | Active | Core transaction     |
| BookingSlot            | Active | Time-slot management |
| TechnicianAvailability | Active | Working hours        |
| ServiceAvailability    | Active | Service scheduling   |
| RecurringBooking       | Active | Subscription-based   |
| GroupBooking           | Active | Group appointments   |
| Waitlist               | Active | Waitlist entries     |
| WaitlistNotification   | Active | Position updates     |

### 3. Service Catalog (core)

| Model          | Status | Notes                |
| -------------- | ------ | -------------------- |
| Category       | Active | Service categories   |
| Service        | Active | Core service entity  |
| ServiceTag     | Active | Tagging system       |
| ServiceAddon   | Active | Add-on services      |
| Bundle         | Active | Service bundles      |
| BundleService  | Active | Bundle-service join  |
| Package        | Active | Service packages     |
| PackageService | Active | Package-service join |

### 4. Finance & Payments (core)

| Model             | Status | Notes                 |
| ----------------- | ------ | --------------------- |
| Payment           | Active | Payment records       |
| Wallet            | Active | Customer balance      |
| WalletTransaction | Active | Ledger entries        |
| Payout            | Active | Technician payouts    |
| PayoutBatch       | Active | Batch processing      |
| Dispute           | Active | Chargeback/dispute    |
| DisputeEvidence   | Active | Dispute attachments   |
| IdempotencyKey    | Active | (embedded in Payment) |
| PlatformFee       | Active | Revenue tracking      |
| CashbackRule      | Active | Cashback config       |

### 5. Trust & Safety (core)

| Model       | Status | Notes                    |
| ----------- | ------ | ------------------------ |
| Review      | Active | Customer reviews         |
| ReviewReply | Active | Technician responses     |
| Report      | Active | Abuse reports            |
| AuditLog    | Active | Admin audit trail        |
| KYC         | Active | (embedded in Technician) |

### 6. Loyalty & Gamification (supporting)

| Model           | Status       | Notes                   |
| --------------- | ------------ | ----------------------- |
| LoyaltyTier     | Active       | Tier definitions        |
| LoyaltyPoints   | Active       | Points ledger           |
| LoyaltyReward   | Active       | Redeemable rewards      |
| Streak          | Active       | Booking streaks         |
| Achievement     | Active       | Achievement definitions |
| UserAchievement | Active       | Earned achievements     |
| Badge           | Active       | Badge definitions       |
| TechnicianBadge | Active       | Technician badges       |
| Challenge       | Active       | Gamified challenges     |
| BeautyQuest     | Experimental | Quest system            |

### 7. Communications (supporting)

| Model            | Status | Notes                |
| ---------------- | ------ | -------------------- |
| Notification     | Active | In-app notifications |
| PushSubscription | Active | Push token storage   |
| EmailTemplate    | Active | Email templates      |
| SmsLog           | Active | SMS delivery log     |
| ChatRoom         | Active | Chat infrastructure  |
| Message          | Active | Chat messages        |

### 8. Content & Marketing (supporting)

| Model            | Status | Notes              |
| ---------------- | ------ | ------------------ |
| BlogPost         | Active | Blog content       |
| BlogComment      | Active | User comments      |
| BeautyTip        | Active | Beauty tips        |
| BeautyEvent      | Active | Physical events    |
| EventAttendee    | Active | Event RSVPs        |
| Promotion        | Active | Promo campaigns    |
| PromoCode        | Active | Discount codes     |
| PromoUsage       | Active | Code redemption    |
| FlashDeal        | Active | Time-limited deals |
| GiftCard         | Active | Gift card system   |
| GiftCardPurchase | Active | Purchase records   |
| Referral         | Active | Referral tracking  |
| Banner           | Active | Marketing banners  |
| SeoMetadata      | Active | SEO config         |

### 9. Marketplace (supporting)

| Model              | Status | Notes              |
| ------------------ | ------ | ------------------ |
| MarketplaceProduct | Active | Product listings   |
| ProductCategory    | Active | Product categories |
| ProductReview      | Active | Product reviews    |
| Cart               | Active | Shopping cart      |
| CartItem           | Active | Cart line items    |
| Order              | Active | Order records      |
| OrderItem          | Active | Order line items   |
| Vendor             | Active | Vendor profiles    |
| VendorStore        | Active | Store pages        |

### 10. AI & Innovation (experimental)

| Model            | Status       | Notes            |
| ---------------- | ------------ | ---------------- |
| SkinAnalysis     | Beta         | AI skin analysis |
| VirtualTryOn     | Beta         | AR try-on        |
| AiChatSession    | Beta         | Chatbot sessions |
| ProductScan      | Beta         | Product scanner  |
| PredictiveDemand | Experimental | ML forecasting   |
| BeautyTrend      | Experimental | Trend tracking   |

### 11. Social & Community (experimental)

| Model            | Status       | Notes               |
| ---------------- | ------------ | ------------------- |
| BeautyProfile    | Active       | User beauty profile |
| BeautyJournal    | Active       | Personal journal    |
| BeautyRoutine    | Active       | Routine tracking    |
| CommunityPost    | Experimental | Social posts        |
| CommunityComment | Experimental | Comments            |
| Moodboard        | Experimental | Visual collections  |
| SisterhoodCircle | Experimental | Women-only circles  |
| SecretSanta      | Experimental | Gift exchange       |
| TimeCapsule      | Experimental | Future messages     |

### 12. Operations & Admin (supporting)

| Model            | Status | Notes           |
| ---------------- | ------ | --------------- |
| FeatureFlag      | Active | Feature toggles |
| AdminAction      | Active | Admin log       |
| ConciergeRequest | Active | VIP concierge   |
| MonitoringMetric | Active | System metrics  |
| ScheduledTask    | Active | Cron jobs       |
| BackupLog        | Active | Backup records  |

## Models Recommended for Archival

These models have no known active usage or are superseded:

| Model       | Reason                   | Action                 |
| ----------- | ------------------------ | ---------------------- |
| BeautySanta | Duplicate of SecretSanta | Merge into SecretSanta |
| BeautyQuest | No router references     | Archive or implement   |
| Affirmation | Standalone, low value    | Merge into Wellness    |

## Lifecycle Status Summary

| Status            | Count   |
| ----------------- | ------- |
| Active            | ~155    |
| Beta              | 4       |
| Experimental      | ~10     |
| Duplicate/Archive | 3       |
| **Total**         | **202** |
