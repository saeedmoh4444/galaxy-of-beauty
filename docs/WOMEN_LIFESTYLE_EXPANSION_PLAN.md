# Women's Lifestyle Expansion Plan

> Status: **v1 — 2026-09-03**. User vision: grow beyond beauty into the
> woman's life platform — new service verticals (gym, trainers, medical
> beauty clinics, …) + lifestyle tools (period tracking, …). Extends the
> provider model from STORE_MARKETPLANE_PLAN.

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

- Nail bars, barberettes, at-home salons (homeService pattern)
- Babysitting/kids activities — LATER, only after core verticals are
  profitable (scope guard)
- Beauty AI → Lifestyle AI: the advisor answers cycle/fitness/nutrition
  too (B.21 evolution), funneling to the new verticals

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
