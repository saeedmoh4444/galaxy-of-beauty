# API / tRPC Layer Audit 2026-11-11

Scope verified: packages/api/src (routers 269 files, trpc.ts, context.ts, lib/, domains/, validators/, **tests** 269 test files), shared constants, apps/web + apps/mobile tRPC call sites. All findings below were directly verified with file:line.

## 1. Domain inventory — table

Surface: 1220 procedures (692 queries + 528 mutations) across 269 routers (canonical snapshot `packages/api/src/__tests__/__snapshots__/router-inventory.test.ts.snap`, enforced by router-inventory.test.ts as a CI contract gate — every procedure must carry a tier meta).

| Domain                                                           | Routers | Procedures | Mutations | Tested routers (dedicated test refs) | Status                       |
| ---------------------------------------------------------------- | ------- | ---------- | --------- | ------------------------------------ | ---------------------------- |
| market (vendorPortal, subscriptions, flashDeals, marketplace...) | 26      | 231        | 114       | 17/26                                | Healthy core, heavily tested |
| social (reviews, disputes, community, reels=beautyShorts...)     | 42      | 176        | 77        | 10/42                                | Broad, thin tests            |
| wellness                                                         | 34      | 117        | 46        | 14/34                                | OK                           |
| admin (admin, cms, analytics, zatca-adjacent tools)              | 24      | 114        | 35        | 14/24                                | OK                           |
| catalog (services, technicians, search...)                       | 28      | 113        | 43        | 13/28                                | OK                           |
| content (blog, liveStream, beautyShorts-adjacent)                | 28      | 107        | 37        | 4/28                                 | Weak                         |
| operations                                                       | 27      | 85         | 33        | 9/27                                 | OK                           |
| booking                                                          | 14      | 57         | 30        | 6/14                                 | Core flows tested            |
| payments (wallet, payouts, giftCards, bnpl)                      | 9       | 55         | 28        | 7/9                                  | Good                         |
| ai                                                               | 12      | 40         | 18        | 7/12                                 | OK                           |
| loyalty                                                          | 9       | 40         | 13        | 5/9                                  | Good                         |
| auth (auth, users, uploads)                                      | 3       | 32         | 26        | 3/3                                  | Good                         |
| realtime (notifications, chat, video, whatsappBot)               | 7       | 21         | 12        | 3/7                                  | Partial                      |
| zatca                                                            | 1       | 13         | 5         | 1/1                                  | Good                         |
| safety                                                           | 1       | 10         | 7         | 0/1                                  | **No tests**                 |
| moderation                                                       | 1       | 4          | 2         | 1/1                                  | OK                           |
| vendorApi                                                        | 1       | 3          | 1         | 1/1                                  | OK                           |

Tier distribution: public 261, protected 106, customer 579, technician 41, admin 232, **seller 0, staff 0** (sellerProcedure/sellerMutation/staffProcedure are defined in trpc.ts:218,223-225 but zero routers use them).

## 2. Gaps 🔴

1. **wallet.topUp is a dead-end flow (money feature non-functional)** — HIGH — `routers/wallet.ts:199-250`. Creates only a PENDING walletTransaction (`source: 'PLATFORM_FEE_SHARE'` at wallet.ts:237 — the sole occurrence in the entire API src; nothing ever completes it). The comment claims "credit lands only through a verified gateway callback", but no such callback exists in payments.ts/fatoorah.ts. Mobile UI calls it and shows a success toast (`apps/mobile/src/app/customer/wallet/top-up/index.tsx:40-53`). Fix: build the MyFatoorah redirect + completion callback, or gate the feature off. Effort M.
2. **No seller/vendor tier anywhere** — MEDIUM — `trpc.ts:218-225` unused; all 114 vendorPortal mutations are customer-tier. Mitigation is per-procedure internal lookups (resolveVendorActor/vendorForStaff, vendorPortal.ts:210-291), but `ensureVendor` (vendorPortal.ts:32-43) silently auto-creates a Vendor row on first use — any customer becomes a "store" with no approval/verification gate (no isActive/isVerified check anywhere in vendorPortal.ts). Fix: stamp seller-tier on vendorPortal + on-boarding gate. Effort M.
3. **bookings.transition `complete` is not concurrency-idempotent** — MEDIUM — `routers/bookings.ts:712-946`. Status validation reads outside the tx; final `tx.booking.update({ where: { id } })` (bookings.ts:945-946) has no status precondition. A double-clicked complete double-increments `technician.completedBookings`, double-credits referral rewards (bookings.ts:838-870, check-then-update, no row lock) and influencer commissions (bookings.ts:877-930). Fix: `updateMany({ where: { id, status: booking.status } })` + conflict retry. Effort S.
4. **payments.refund never returns the customer's money** — HIGH — `routers/payments.ts:364-426`. Flips payment to REFUNDED and reverses cashback only; no wallet credit, no gateway refund call. Also non-transactional (status flip precedes cashback reversal) and the update is unguarded, so a concurrent double-refund race double-debits bonusBalance. Fix: wrap in tx, add status guard, credit wallet or call Fatoorah refund. Effort M.
5. **payouts.approveRequest can approve an under-covered request under concurrency** — MEDIUM — `routers/payouts.ts:559-590`. Balance pre-check is outside the tx; inside, rows are covered oldest-first but the loop never asserts the full amount was covered — a concurrent approval leaves `remaining > 0` yet the request is still marked APPROVED. Fix: assert remaining === 0 inside the tx. Effort S.
6. **payouts.process parks payouts in PROCESSING forever** — LOW (documented simulate-safe) — `routers/payouts.ts:298-301` ("no bank/wallet provider integration yet, so payouts STAY in PROCESSING"). Technicians can never reach COMPLETED; UI must surface this. Effort L (provider integration).
7. **Duplicate-dispute path yields raw 500** — LOW — 1:1 invariant exists at schema level (`packages/db/prisma/schema.prisma:882-883`, bookingId/storeOrderId @unique), but `disputes.create` (routers/disputes.ts:69-78) doesn't pre-check, so a second dispute throws uncaught P2002 → INTERNAL_SERVER_ERROR instead of 409. Effort S.
8. **wallet.withdraw idempotency replay leaks other users' data** — LOW — `routers/wallet.ts:108-113`: `findUnique({ where: { idempotencyKey } })` returns any user's transaction (amount, walletId) if the key is guessed. Fix: scope by walletId. Effort S.
9. **subscriptions.purchase debit is not conditional** — LOW — `routers/subscriptions.ts:56-67`: balance check outside tx, decrement unguarded → concurrent purchases can drive balance negative. Effort S.
10. **vendorApi procedures are stamped tier 'public' in the inventory** — LOW/cosmetic — trpc.ts:152-169 builds vendorApiKeyProcedure on publicProcedure without a tier meta override; the snapshot lists vendorApi.orders/products/updateStock as public though they require X-Api-Key. Effort S.
11. **giftCardMarket.list is a mutation** (snapshot line 491) — semantic oddity; a pure read exposed as a CSRF-gated mutation. LOW. Effort S.

## 3. Errors 🟡

1. **Subscription renewal is a stub** — `workers/subscriptionRenewal.ts:20-40`: `const renewed = 0` (line 27) — autoRenew=true subscriptions are set EXPIRED at expiry ("no payment method / gateway capture path exists for renewals yet"). Users who paid via wallet for autoRenew plans silently lose the subscription.
2. **whatsappBot.webhook is a demo echo** — `routers/whatsappBot.ts:14-37`: keyword matcher, no Meta signature verification, no outbound message send, no state changes.
3. **33 raw `throw new Error(...)` across 25 routers** (e.g., flashDeals.ts:63, beautyAwards.ts:60, blog.ts:39, certificationQuiz.ts:58, giftCardMarket.ts:27) — tRPC wraps these as INTERNAL_SERVER_ERROR, so "not found"/"invalid" client errors surface as 500s instead of 4xx. Zero TODO/FIXME/HACK markers exist in API src (verified).
4. **flashDeals.claim rollback catch-all** — `routers/flashDeals.ts:106-114`: any create error (incl. transient DB failures) decrements currentRedemptions even when the claim actually landed, corrupting the counter.
5. **skinAnalysis deterministic stub fallback** — `routers/skinAnalysis.ts:13` (documented).
6. **Simulate modes** — ZATCA (`routers/zatca.ts:97`) and Fatoorah (`lib/fatoorah.ts:52-64`) env-gated, dev-only. Legitimate.
7. **ensureWallet create race** — `routers/wallet.ts:17-27`: find-then-create without unique-catch → P2002/500 on first concurrent calls. Minor.
8. **Dead code**: `csrfGuard` middleware (trpc.ts:69-90) is redundant with root-level `procedureWithCsrf` (trpc.ts:101-113) and only re-applied by the *Mutation wrappers; trpc.ts:93-99 comment confirms root-level enforcement. `mergeRouters`/`middleware` exports (trpc.ts:66) unused. No hardcoded secrets (env.ts validates; only localhost dev defaults, e.g. env.ts:32,35).

## 4. Security assessment

- **Tier gates** (trpc.ts): publicProcedure(141-145), vendorApiKeyProcedure(152-169), publicMutation(174-179), protectedProcedure(189-193), protectedMutation(198), customerProcedure(215-217), sellerProcedure(218), technicianProcedure(219-221), adminProcedure(222), staffProcedure(223-225), customerMutation(230), sellerMutation(231), technicianMutation(232), adminMutation(233), plus requireOwnership(253-276) and requireFeatureFlag(291-322). seller/staff unused (see 🔴2). The router-inventory snapshot test fails CI on any procedure missing a tier — verified 0 untiered procedures.
- **CSRF**: universal for mutations via root `procedureWithCsrf` (trpc.ts:101-113); every mutation chain derives from it, including bare `.mutation` on protectedProcedure sites (verified: no router uses the raw `procedure` export). Skip conditions (lib/csrf.ts:80-82): no Origin header (native/curl/server-to-server) or X-Client-Platform (preflight-defended custom header). Constant-time compare (csrf.ts:53-56). Tests: csrf.test.ts, csrf-enforcement.test.ts, csrf-exemption.test.ts.
- **Rate limiting**: applied to every base chain via rateLimitGuard (trpc.ts:116-134) — anonymous 20/min keyed by IP+path, authenticated 60/min, admin 300/min (shared/src/constants.ts:103-105). Honest caveats: anonymous buckets are shared per NAT IP; Redis outage fails OPEN by design (lib/rateLimit.ts:33-37, 53-56); the `health` query is itself anonymous-rate-limited (LB check risk >20/min/IP).
- **Idempotency / invariants verified good**: bookings.create (unique idempotencyKey, owner-scoped replay, bookings.ts:117-126); wallet.withdraw (unique key + conditional `updateMany` debit in one tx, wallet.ts:151-187); payouts.requestPayout (unique idempotencyKey, payouts.ts:451-467); flashDeals.claim (atomic `updateMany` capacity guard + @@unique(dealId,userId) schema.prisma:3249); store checkout (stock decrement in caller tx, status-guarded cancel restore, lib/storeCheckout.ts:131-187, 363-401); payments.authorize concurrent-key guard (payments.ts:223); capture requires AUTHORIZED + technician ownership (payments.ts:243-263); disputes resolve refund guarded by per-dispute idempotencyKey `dispute_refund_<id>` (disputes.ts:213) — racing double-resolve aborts on the unique key rather than double-paying.
- **Weak spots**: bookings.complete, payments.refund, payouts.approveRequest races (🔴3-5); capture cashback is check-then-create on non-unique `referenceId` (payments.ts:292-296; schema has only @@index, schema.prisma:435) → theoretical double-cashback under concurrent capture.
- **Vendor API**: sha256-hashed keys, revokedAt check, belongs-to scoping (trpc.ts:152-169, vendorApi.ts:38-64). Webhook signing exists (lib/webhookSigning.ts, vendor-webhooks.test.ts).

## 5. Test-coverage gaps

269 test files total (1:1 with routers). Direct-reference coverage 119/269 routers. Domains with the weakest dedicated coverage:

- **safety — 0/1 routers tested** (10 procs, 7 mutations incl. triggerPanic/requestEscort/checkIn) — highest priority gap.
- **content — 4/28** (blog, liveStream, cms-adjacent, tutorials, bookClub all untested).
- **social — 10/42** (community, chat, concierge, secretSanta, gratitude... untested).
- **booking — 6/14** (bookingChecklist, bookingHeatmap, serviceQueue untested).
- **operations — 9/27** (salonMap, salonMembership, rideHailing, iotSync untested).
- **realtime — 3/7** (chat, liveChat, audioRooms untested).
- Routers with zero test references include: safety, chat, cms, blog, liveStream, liveChat, aiAssistant, whatsappBot, notificationPrefs, apiDocs, giftCardMarket, giftRegistry, groupBuy, franchises... (150 total zero-ref routers; many are exercised indirectly via api-flows/integration/business-logic/contracts tests — bookings/payments/wallet/vendorPortal have deep dedicated suites: wallet-withdraw-atomicity.test.ts, money-integrity.test.ts, seller-gates.test.ts, payout-requests.test.ts, flash-deals.test.ts, vendor-* ~45 files).

## 6. Cross-check: UI calls vs API surface

Verified via grep+diff of `api.<router>.<proc>` (web) and `(api|trpc|client).<router>.<proc>` (mobile):

- Web: 209 distinct routers, 689 unique procedure calls — **all exist in the API** (7 apparent misses are regex artifacts: `auth.disable2FA` word-boundary splits, `users.consent`/`vendorPortal.staff` sub-routers, `config.ts` import path, `health.useQuery` hook).
- Mobile: 192 distinct routers, 385 unique procedure calls — **all exist**.
- No UI calls a missing procedure; no evidence of API endpoints the UI expects but that don't exist (beyond wallet.topUp's non-completion, 🔴1).

Bottom line: architecture is sound (universal CSRF, universal rate limits, tier meta CI gate, extensive tests); the real risks are the three money-path races (bookings complete / payments refund / payout approve), the wallet top-up dead end, and the absent seller tier.
