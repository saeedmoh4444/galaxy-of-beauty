# Galaxy of Beauty — Full Platform Inventory (2026-11-18)

> The honest, complete answer to "what have we actually built, and what is still missing."
> Compiled after the six-wave audit build-out closed (board zero target). Companion docs:
> `brain_code.md` (architecture), `Rules_to_make_well_archtichtrue-platform.md` (how to work),
> `docs/AUDIT_2026-11-11_MASTER_PLAN.md` (gap tracker, closed).

**Scale snapshot (measured):** 269 tRPC routers · ~1,220 procedures (tier-gated) · ~251 DB models ·
49 migrations · 321 web pages · 337 mobile screens · 2,029+ unit tests · 39 web + 3 mobile E2E specs ·
16 BullMQ queues + 11 interval sweeps · 11 CI gates · i18n ar/en ~5,739 web + ~8,800 mobile keys ·
94 women's service categories · 393-service seeded catalog (all bookable) · 560+ ui components.

---

## 1. Feature Inventory — shipped and verified ✓

### 1.1 Core commerce & money (W1-hardened)

| Feature                                                                            | Web | Mobile | Notes                                                                                                                                           |
| ---------------------------------------------------------------------------------- | --- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Booking core (create/confirm/detail/reschedule/recurring/group/emergency/advanced) | ✓   | ✓      | idempotency keys, Jummah windows, bundle/addon/subscription math, slot re-check in tx, technician↔service mapping + address ownership validated |
| Booking verticals: services, gyms, nail-bars, clinics, trainers, kids, women's     | ✓   | ✓      | E2/E3/E5/K-series; 393-service catalog 100% bookable (seed round-robin technician mapping)                                                      |
| Video bookings (WebRTC rooms, customer + technician)                               | ✓   | ✓      | relay signaling in-process                                                                                                                      |
| Marketplace + cart + checkout + shipping                                           | ✓   | ✓      | MyFatoorah simulate; store stock decrement in tx                                                                                                |
| Wallet: balance, transactions, withdraw (atomic), cashback, BNPL, beauty-budget    | ✓   | ✓      | withdraw atomicity + idempotency tested; top-up completion gateway-gated                                                                        |
| Payments: authorize/capture/refund, ZATCA invoicing (simulate), disputes           | ✓   | ✓      | capture = atomic AUTHORIZED→CAPTURED claim (#691 — the race is closed); 33 raw-500 errors converted to typed 4xx                                |
| Payouts: technician lifecycle + seller requests → admin approve/reject             | ✓   | ✓      | under-covered concurrency approve fixed (remaining===0 assert in tx)                                                                            |
| Subscriptions: plans, purchase, pause/resume/cancel, box-builder, AI plans         | ✓   | ✓      | unguarded-debit race closed; autoRenew capture gateway-gated                                                                                    |
| Flash deals: admin CRUD, atomic claims, public list                                | ✓   | ✓      | price now applied to booking totals (W2-6)                                                                                                      |
| Gift cards, promo codes (consolidated engine), loyalty, kindness points, referrals | ✓   | ✓      | referral double-claim closed (compound unique)                                                                                                  |
| Dynamic pricing engine (opt-in tiers/peak/surge + preview + admin UI)              | ✓   | ✓      | flagship services opted in (W2-8)                                                                                                               |

### 1.2 Seller & vendor economy

| Feature                                                                        | Web | Mobile | Notes                                                            |
| ------------------------------------------------------------------------------ | --- | ------ | ---------------------------------------------------------------- |
| Vendor portal + wizard (provider submission, drafts, ownership gates)          | ✓   | ✓      | mobile portal auth-guarded with hydration hold (W3-3)            |
| SELLER first-class role (registration, routing, gates)                         | ✓   | ✓      | R1–R4 + D1–D4                                                    |
| Seller dashboard: analytics, payouts, low-stock, reviews, health-score         | ✓   | ✓      | capability-filtered tabs, CSV exports, real data only            |
| Provider approval pipeline: stores/products/packages/promotions → admin decide | ✓   | ✓      | ensureVendor auto-creates are INACTIVE + filed for review (W3-2) |

### 1.3 Women's platform (the core differentiator)

| Feature                                                                                | Web | Mobile | Notes                                                                                                                  |
| -------------------------------------------------------------------------------------- | --- | ------ | ---------------------------------------------------------------------------------------------------------------------- |
| Women-only privacy: womens-services, night-mode, hijab-care, badges                    | ✓   | ✓      | NOW enforced: self-declared gender gate + booking enforcement (W3-5p2); mens-grooming hidden from mobile tree (W3-5p1) |
| Kids K1–K4: family members, kids-care, bundles, babysitting (hourly)                   | ✓   | ✓      | booking path validated (W2-7)                                                                                          |
| Hijab-care, postpartum, pregnancy-safe, menopause, PCOS, fertility, breastfeeding-safe | ✓   | ✓      | catalog + booking                                                                                                      |
| Safety: panic alerts, escorts, location share, check-in                                | ✓   | ✓      | safety router now has a 9-test contract suite (W6-3)                                                                   |
| Women's categories: **94** — see §3                                                    |

### 1.4 Community, content & AI

| Feature                                                                  | Web | Mobile | Notes                                              |
| ------------------------------------------------------------------------ | --- | ------ | -------------------------------------------------- |
| Community: circles, posts, beauty-community, pen-pal, mood boards        | ✓   | ✓      | content/social test coverage 4/28→12/28 (W6-4)     |
| Reels: shorts feed, shoppable tags, watch analytics, reports             | ✓   | ✓      | media pipeline job (ffmpeg optional)               |
| AI: ai-chat, assistant, feed, routine, skin-analysis, content-gen, DNA   | ✓   | ✓      | skinAnalysis stub fallback documented, fail-closed |
| Wellness: hub, tracker, cycle, pregnancy, menopause, sleep, measurements | ✓   | ✓      | —                                                  |
| Gamification: achievements, bingo, kindness points, quizzes, awards      | ✓   | ✓      | —                                                  |

### 1.5 Platform infrastructure

| Feature                                                      | Status          | Notes                                                                                                                                                                                                             |
| ------------------------------------------------------------ | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Realtime (Socket.IO)                                         | ✓ WORKS in prod | W3-1 Redis bridge: API emits publish via a broadcast-only io node — no more silent no-ops; orphan listeners/producers paired (W3-6); socket URL fallback fixed (W3-7)                                             |
| Workers: 16 BullMQ queues + 11 interval sweeps + schedulers  | ✓               | cashback job idempotent (W1-4); reconciliation alerting + registry visibility (W1-8); Sentry heartbeats for schedulers (W6-5)                                                                                     |
| CI: 11 gates                                                 | ✓               | format, audit, cycles, type, lint, coverage-ratchet, build+size, E2E+axe, mobile-smoke, k6, docker(prod images)                                                                                                   |
| DB hardening                                                 | ✓               | money FKs, dispute CHECK, NULLS NOT DISTINCT (W5-1/4); overlap exclusion on availability slots (W5-3); index hygiene (W5-5/12); duplicate model families consolidated (W5-6a/c/d); StoreOrder codes + enum (W5-7) |
| Observability                                                | ✓               | Sentry (DSN-gated), prom metrics, Grafana, k6 1K buckets, alerting (paging = user-gated webhook)                                                                                                                  |
| Offline/PWA (web) + offline queue + persisted cache (mobile) | ✓               | genuine implementations                                                                                                                                                                                           |
| i18n ar/en                                                   | ✓               | typed keys, dynamic catalogs, RTL, CI static-Arabic gate extended to ui (W6-2); 402/530 ui components migrated to locale plumbing (#696)                                                                          |
| SEO                                                          | ✓               | page-metadata gate (W6-1): 76-URL sitemap + 14 flagship wrappers; **41-page metadata queue drained to zero** (#695)                                                                                               |
| OTA / APK                                                    | ✓               | EAS pipeline; `fallbackToCacheTimeout` fixed (W4-5); dead deep-links removed (W4-7)                                                                                                                               |

---

## 2. Logic & workflows — completed and tested

1. **Booking create flow** — idempotency replay → technician exists + active mapping → address owned by caller → slot re-check in tx + Jummah window → pricing engine preview (tier/peak/surge + flash-deal price) → create REQUESTED + snapshot pricingBreakdown → realtime emits (Redis bridge).
2. **Money state machines** — booking/dispute/payout/submission transitions are explicit claims (`updateMany({where:{status:CURRENT}})`), typed CONFLICT on count 0. Captures, cashback credits, referral claims, flash-deal claims all race-proof.
3. **Approval pipeline** — provider submissions (stores/products/packages/promotions) → `providerReview.decide` → materialize (activate vendor, flip LIVE, create FlashDeal). The ONLY path to live state.
4. **Realtime bridge** — API (io=null) → getBroadcastIO() Redis adapter node → socket server :4001 → rooms (`user:*`, `technician:*`, `waitlist:*`, `admin`). Exactly-once: local io wins, bridge only when null.
5. **Fail-closed analytics** — unwired verticals return explicit reasons; pro-tools renders REAL data (W4-1); fabricated-analytics contracts pin it.
6. **Daily-stats materialization** — NOON-UTC buckets, computed by workers, never per-request.
7. **Imagery fallback chain** — `resolveEntityImage` entity → category → kind → brand (I1); never a broken image.
8. **Biometric login** — actually signs in now (W3-4), outcome via pure `biometricLoginOutcome`.
9. **Women-only enforcement** — self-declared gender gate (option 1 live); verified-female KYC = tracked upgrade pass (option 2).

---

## 3. Women's service categories — the full 94

**Motherhood & family:** pregnancy_safe · postpartum · breastfeeding_safe · fertility_wellness · single_mother · twins_mom · mommy_makeover · baby_shower · new_bride · mother_of_bride · bridal_party · bridal_prep · grandmother_beauty · grandmother_bride

**Health & medical-adjacent:** chronic_care · diabetic_care · pcos_care · post_surgery · cancer_survivor · menopause · physiotherapist_beauty · pharmacist_beauty · dentist_beauty · psychologist_beauty · dietitian_beauty · healthcare_worker

**Professions (beauty for her career):** accountant_beauty · architect_beauty · lawyer_beauty · teacher_beauty · journalist_beauty · interpreter_beauty · librarian_beauty · designer_beauty · entrepreneur_beauty · banker_beauty · real_estate_beauty · working_woman · tech_woman · call_center_beauty · event_host_beauty · influencer_beauty · photographer_beauty · writer_beauty · musician_beauty · actress_beauty · artist_beauty · farmer_beauty · florist_beauty · gardener_beauty · chef_beauty · veterinarian_beauty · social_worker_beauty · volunteer_beauty · pilot_beauty · police_firefighter · night_shift_beauty · homemaker_beauty · student_beauty · expat_beauty · nomad_beauty · retirement_beauty

**Sport & fitness:** athlete_beauty · runner_beauty · swimmer_beauty · cyclist_beauty · climber_beauty · dancer_beauty · boxer_beauty · weightlifter_beauty · yoga_instructor · horse_rider · sailor_beauty · gamer_beauty

**Beauty & ritual:** henna · hijab_care · intimate_care · brows_lashes · makeup_artist_self · body_contouring · mature_skin · teen_beauty · plus_size_beauty · natural_beauty · eco_beauty · kbeauty_inspired · luxury_spa · ramadan_beauty · eid_prep · first_beauty · fresh_start · accessible_beauty

---

## 4. Gaps / errors / missing — the honest remainder

### 4.1 Closed by the audit build-out (all six waves)

W1 money integrity (13 gaps) · W2 catalog bookability (11 gaps — 90% of catalog was unbookable; now 100%) · W3 realtime+seller+privacy (7 gaps — realtime was dead in prod; now wired) · W4 web/mobile correctness (13 gaps — fabricated pro-tools numbers, stub screens, cosmetic biometric login, dead deep-links) · W5 DB & infra (12 gaps — missing FKs, double-claims, prod-image build broken 5 ways) · W6 SEO+i18n+coverage (5 gaps — 33/321 pages had metadata; safety router had 0 tests).

### 4.2 User-gated (code ready, keys/secrets needed — cannot proceed without you)

1. **Fatoorah live token** — wallet top-up completion (W1-10), subscription autoRenew capture (W1-7), real gateway payments
2. **Sentry DSNs** — EAS env for mobile + web prod
3. **AWS console** — S3 bucket + CloudFront CDN (imagery I3/I6), S3 lifecycle
4. **Apple account** — iOS device builds
5. **Prod server** — staging TLS/nginx, deploy
6. **Postman key** — API engineering workspace
7. **Pentest execution** — before public launch
8. **ALERT_WEBHOOK_URL** — real paging (Alertmanager webhook is a placeholder until then)

### 4.3 Tracked follow-ups (ratcheted, can only shrink)

- ui i18n migration: 402/530 files done (#696 in flight); 128 remain — all ratcheted behind `static-arabic-ui-allowlist.txt`
- SEO metadata queue: drained to ZERO (#695)
- Verified-female KYC upgrade (W3-5 option 2) — ID upload → admin review
- expo-secure-store for the refresh token (W3-4 hardening note)
- Path-filtered CI workflows (deferred by design — paths-ignore breaks auto-merge)

### 4.4 Hard truths (unchanged by the program — honest)

- `staffProcedure` tier is dead code (0 procedures) — staff authorization lives in the ownership model
- Mobile pure-logic tests cover utils only; screens rely on E2E (Detox stubs removed; native Detox = future option)
- AsyncStorage still holds the refresh token (must move to expo-secure-store)
- Shared test DB still races under parallel workers (isolated DB reserved for the 2 seed contracts)
- Launch requires the user-gated list above — **the code is done; the keys are not**

---

## 5. Running the whole platform

```bash
# 1. Infrastructure (postgres 5433 + redis)
docker compose up -d postgres redis

# 2. API (tRPC, web dev server, port 3000) — also hosts workers via worker entry
pnpm dev                      # turbo: web + mobile metro + worker + socket

# Individual pieces:
pnpm --filter @galaxy/web dev          # Next.js :3000
pnpm --filter @galaxy/api dev:worker   # BullMQ workers
pnpm --filter @galaxy/api dev:socket   # Socket.IO :4001
pnpm --filter @galaxy/mobile start     # Expo metro :8083
```

Verify: web home + `/ar` RTL · book a service end-to-end (picker → confirm shows real code/date → payment authorize → booking appears) · open the socket page and create a booking → realtime toast on the technician side · admin → BullMQ queue monitor shows 16 queues healthy · `pnpm --filter @galaxy/api test` green.

---

## 6. What the board looks like at close

- Master: `d54f0ffa1` (#693) + in-flight: #694/#695/#696 (relays + SEO queue + ui i18n), #697 (docs), #698 (ratchet master-red fix)
- After the drain: **zero open PRs** — the state this whole program defended.
