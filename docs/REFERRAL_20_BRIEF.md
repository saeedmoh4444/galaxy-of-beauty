# 8.1 Referral Program 2.0 — Delivery Brief

Completes ENHANCEMENT_PLAN 8.1. The referral core (deterministic codes,
double-sided rewards, tiered crediting 50/200/500 via
`lib/referralRewards.ts`, loyalty-point integration) already shipped in
earlier slices. This program closes the remaining plan items:

| Slice | Scope                                                  | Plan item                       |
| ----- | ------------------------------------------------------ | ------------------------------- |
| 8.1a  | Monthly leaderboard + prizes + tier-display alignment  | Leaderboard with monthly prizes |
| 8.1b  | UTM attribution on share links                         | Referral link with UTM tracking |
| 8.1c  | Influencer program (unique codes + booking commission) | Influencer program              |

## 8.1a — Monthly leaderboard & prizes

- `ReferralPrize` model: `month` (`"YYYY-MM"`, UTC), `rank` (1–3),
  `amount`, `winnerId?`, `status` (`PENDING|CREDITED`), `creditedAt` —
  `@@unique([month, rank])`.
- Prize schedule (ranks 1–3): **500 / 300 / 200 SAR** (`MONTHLY_PRIZE_AMOUNTS`).
- `referrals.leaderboard` v2: enriched rows `{ rank, userId, name,
avatarUrl, count }`, optional `month` input (UTC completedAt window;
  absent = all-time). Consumer (`referral-dashboard`) updated to render
  names; legacy anonymous bars replaced.
- `referrals.monthlyPrizes` (public): current (or given) month's prize
  rows; before awarding, synthesizes the config with null winners.
- `referrals.awardMonthlyPrizes` (admin): awards the previous month (or
  given `month`). Top-3 referrers by COMPLETED referrals whose
  `completedAt` falls in the month; ties broken by referrerId asc.
  Upserts prize rows, credits `bonusBalance` +
  `walletTransaction` (`REFERRAL_BONUS`, `referenceId = prize_<id>`).
  **Idempotent**: existing rows for the month short-circuit (no double
  credit).
- Tier-display alignment: `getEnhancedStats.referrerBonus` now derives
  from `tieredReferrerReward(count + 1)` (50/200/500) instead of the
  stale 20/30/50; `referredBonus = REFERRED_REWARD` (20). No UI consumer
  yet — test-only alignment.

## 8.1b — UTM attribution (next slice)

- `Referral` gains nullable `utmSource/utmMedium/utmCampaign/utmContent`.
- `shareCard` emits UTM-tagged URLs (`utm_source=referral&utm_medium=share&utm_campaign=<code>`).
- `applyCode` accepts optional `utm` payload, persisted at redemption;
  register page threads query params through.
- `getStats` adds a per-source attribution breakdown.

## 8.1c — Influencer program (next slice)

- `Influencer` model: unique code (`INF-…`), name, `commissionRate`,
  optional `userId` (wallet crediting), counters, `isActive`.
- Admin CRUD router; `booking.create` accepts an optional
  `influencerCode`; on completion the influencer earns
  `rate × total` credited via wallet (or accumulated on the model when
  unlinked).
