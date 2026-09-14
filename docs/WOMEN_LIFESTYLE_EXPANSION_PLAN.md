# Women's Lifestyle Expansion Plan

> Status: **v2 — 2026-09-08**. User vision: grow beyond beauty into the
> woman's life platform — new service verticals (gym, trainers, medical
> beauty clinics, …) + lifestyle tools (period tracking, …). Extends the
> provider model from STORE_MARKETPLANE_PLAN.
> Delivered so far: E2 clinics (PR #87), E3 gyms (PR #88), E4a cycle
> upgrade (PR #89), E4b wellness/nutrition/measurements/bnpl (PR #90).
> v2 adds the E6+ women's-platform differentiators horizon.

## 1. Vision

"Galaxy of Beauty" becomes the trusted single app for the Saudi woman:
**book services** (beauty today, clinics/gyms/trainers tomorrow),
**manage her wellness** (cycle, sleep, habits, budget), and **get AI
guidance** (Beauty AI → lifestyle AI). The moat: trust + verified
providers + data the AI personalizes everything with (B.25 profile).

## 2. The platform already has foundations for this

| Need                                     | Existing infra                                                                   |
| ---------------------------------------- | -------------------------------------------------------------------------------- |
| Provider model (extend with new types)   | unified provider model (STORE_MARKETPLANE_PLAN)                                  |
| Booking engine, slots, payments, reviews | live                                                                             |
| Cycle tracking                           | `cycleTracker` router (exists — needs upgrade)                                   |
| Wellness tools                           | sleepTracker, beautyHabits, selfCare, wellnessTracker/Hub, spaPlanner, nightMode |
| Finance tools                            | beautyBudget, savingsGoals, wallet, bnpl, subscriptions, vip-membership          |
| AI advisor                               | Beauty AI (B.20/B.21)                                                            |
| Community + pen pal + groups             | B.19/B.22/B.10                                                                   |
| Compliance/trust                         | provider KYC + B.7 approval queue + B.9 certifications                           |

## 3. Phases

### E1 — Multi-vertical foundation (prerequisite)

- Provider model gains new types: `CLINIC`, `GYM`, `TRAINER` (same
  registration → KYC → approval → dashboard pipeline; per-type fields:
  licenses, specialties, capacity)
- Booking engine generalization: class/session booking (capacity vs 1:1
  slots), venue-based providers (address + area coverage)
- Categories/catalog structure for new verticals
- Acceptance: a clinic provider passes the SAME onboarding flow end-to-end

### E2 — Medical beauty clinics (first vertical pilot)

- Types: dermatology, laser, injectables, dental cosmetic, nutrition
- Provider profile: **license verification** (MOH/SFDA) surfaced as
  trust badges — compliance as a feature
- Booking: consultation slots + treatment packages (reuse B.6
  package machinery)
- Medical disclaimers + consent flows + post-care instructions (B.15!)
- Acceptance: clinic registers → license verified → consultation booked →
  post-care plan delivered

### E3 — Fitness vertical (second pilot)

- Gyms: membership plans (subscriptions infra exists), class bookings
  (capacity-based), day passes
- Trainers: 1:1 sessions, packages (B.6 pattern), home training
  (homeService pattern)
- Customer profile integration: measurements + goals feed trainer
  recommendations (B.25 profile)
- Acceptance: class booked via capacity slots; trainer session through the
  standard booking flow

### E4 — Lifestyle tools suite (retention engine)

- **Period tracking upgrade**: cycle predictions, ovulation/fertility
  awareness, symptom logging, calendar sync (calendarSync exists),
  PMS self-care recommendations (tie to selfCare), pregnancy mode
- **Mental wellness**: mood tracking (beautyDiary exists), guided
  breathing/meditations, journaling prompts, therapist directory later
- **Nutrition**: meal suggestions tied to beauty goals, water tracking
- **Body measurements**: progress photos/charts, goals → trainer/Beauty AI
- **Women's finance**: savings goals for treatments (savingsGoals exists),
  installment plans (bnpl exists)

### E5 — Long tail & ecosystem

Design decisions (user-confirmed 2026-09-08, one PR):

- **Nail bars** — venue vertical like clinics: Vendor type `NAIL_BAR` +
  station-capacity slots (ClinicSlot pattern, pay-at-venue record-only).
- **Barberettes** — technician engine only: barberette services ride
  existing technicians (catalog + VERIFIED badge, zero new infra).
- **At-home salons** — route requests to providers: Vendor type `ATHOME`
  - city coverage; homeService requests get assigned to verified at-home
    providers (keeps the existing request flow).
- Babysitting/kids activities — LATER, only after core verticals are
  profitable (scope guard)
- Beauty AI → Lifestyle AI: the advisor answers cycle/fitness/nutrition
  too (B.21 evolution), funneling to the new verticals

### E6+ — Women's platform differentiators (post-E5 horizon, 2026-09-08)

Only a women's platform can ship these; each reuses infra already built.
Recommended order: life-stage journeys → period pampering → postpartum.

**Tier 1 — differentiators**

1. **Life-stage journeys** — rebundle existing pieces into a stage-aware
   experience: bridalConcierge (getting married) → cycleTracker + clinic
   consultations (trying) → pregnancy mode + `isPregnancySafe` services
   (pregnant) → `isMommyFriendly` salons (new mom) → E4 wellness (back to
   me). Almost no new infrastructure; the unifying retention story.
2. **Period pampering** — E4a predicts period dates; 2–3 days ahead offer
   cramps-relief massages, self-care kits from stores, home delivery.
   Turns tracking into revenue; the cycle ↔ booking/store glue.

**E6a design (user-confirmed 2026-09-08, one PR)**

- **Scope**: life-stage journeys + period pampering together.
- **Stage model**: auto-derived + manual override, stored on
  `BeautyProfile.lifeStage` (`bride | trying | pregnant | new_mom | back_to_me`).
  Derivation: bridalConcierge exists → bride; cycleSettings.pregnancyMode
  → pregnant; cycle settings with lastPeriodStart → trying; else
  back_to_me. Manual `choose()` always wins.
- **New `lifeStage` router** (wellness domain):
  - `get` — derived/override stage + bilingual stage definitions
  - `choose({ stage })` — manual override (upserts BeautyProfile)
  - `home` — stage-aware sections: cycle summary (trying/pregnant),
    pregnancy weeks/trimester (pregnant), pregnancy-safe services
    (pregnant), mommy-friendly services (new_mom), bridal summary (bride),
    quick links
  - `pamperStatus` — computeCyclePredictions → isPamperWindow
    (daysUntilNext ≤ 3 or period day ≤ 3) + offers: active FlashDeals,
    self-care kits (top products in product-skincare/haircare), spa
    services (spa-wellness category)
- **UI**: web wellness-hub stage card + pamper card (activates in the
  window), cycle-tracker pamper banner; mobile wellness-hub equivalents.
- **Tests**: life-stage.test.ts (~8) — derivation, override, home
  sections per stage, pamper window edges.

3. **Postpartum care vertical** — recovery services, baby-friendly salons,
   nursing-safe treatments. Rides homeService + clinic patterns. (Adult
   women's health — NOT the deferred kids vertical.)
4. **Menopause/perimenopause mode** — extend cycleTracker the way
   pregnancy mode did: mode for 40+, tailored wellness content, symptom
   tracking, hormone-consultation clinic tie-ins.

**Tier 2 — trust & privacy badges (cheap, very KSA)**

5. **"Women-only staff" + "private suite" badges** across services,
   clinics, gyms — modesty is the #1 purchase driver; licenseVerifiedAt
   already models the badge pattern. Clinics can list female-doctors-only.
6. **Pregnancy-safe filter everywhere** — tag exists on services; surface
   as a global filter + auto-recommend in pregnancy mode.

**Tier 3 — catalog enrichment (no new verticals)**

7. **Henna (نقش الحناء) + hijab-care categories** — scalp health under
   hijab, henna nights, Eid-ready packages.
8. **Goal-linked installment plans** — attach a persisted BnplPlan (E4b)
   to a savingsGoal ("laser course by wedding day").
9. **Bridal season campaigns** — bridalConcierge elevation + bride-squad
   group bookings (groupBookingRouter exists).

**Avoid (scope guard)**

- Babysitting/kids activities — deferred until core verticals profitable
- Ride-hailing — full-API decision stands (deferred)
- Medical advisory beyond marketplace + disclaimers (PDPL, liability)
- New heavy verticals that don't reuse the existing provider pipeline

### E7 — Beauty Media Layer (reels & before/after visuals)

User request 2026-09-08. Today `beautyShorts` serves a hardcoded mock
(no video URLs/images); `ShortLike` and the uploads pipeline already exist.
A beauty platform without visuals is the biggest attractiveness gap.

- **Persisted shorts**: `Short` model (videoUrl, thumbnailUrl, duration,
  views, category, technicianId?) replacing the hardcoded array; mobile
  vertical swipe feed (TikTok-style), web hover-play grid
- **Technician before/after galleries** — posted work converts browsers
  into bookings better than ratings
- **Product images in stores** — real product shots instead of emojis
- **Uploads** — reuse the existing upload pipeline (KYC uploads work) for
  video + images, with a moderation queue before publish
- **Privacy as the moat (KSA-specific)**: women-only feeds (no public
  indexing), consent on every upload, face-blur option, no-camera badges
  for salons — market it as "the only beauty reels that never leave the
  women's circle"

## 4. Sequencing rules

1. Core backlog (B.1–B.25 + store plan) BEFORE verticals — each vertical
   reuses it.
2. One vertical pilot at a time; measure booking volume + retention before
   the next.
3. Lifestyle tools ship alongside verticals (E4 pieces interleave) — they
   are the daily-engagement glue.
4. Compliance first for medical verticals — licenses, disclaimers,
   consent, data privacy for health data (Saudi PDPL).

## 5. Open questions & risks

- **Scope guard**: the super-app trap — 20 half-features. Rule: only ship
  a vertical when its provider pipeline reuses the existing one without
  modification.
- **Health-data privacy**: cycle/medical data is sensitive — PDPL
  compliance, encryption, per-field controls (B.25 privacy design).
- **Medical liability**: platform as marketplace (not practitioner) —
  legal review of disclaimers/consent before E2.
- **Naming**: does "Galaxy of Beauty" still fit a lifestyle platform?
  Brand evolution decision for later.
