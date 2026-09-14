# KIDS & BABYSITTING PLAN (C4)

Created 2026-09-14 — scoping session for backlog item C4 ("Kids/babysitting —
deferred feature (needs scope discussion)").

## 1. Context & sources

- `docs/comprehensive_details_of_beautyofgalaxy.md` / `our_galaxy_of_beauty.md`:
  original vision items — #71 Family Account ("manage family members, book on
  their behalf"), #72 Mommy & Me ("mother-child beauty services"), #73 Kids
  Services ("child-friendly beauty and grooming").
- `docs/WOMEN_LIFESTYLE_EXPANSION_PLAN.md` scope guard: "Babysitting/kids
  activities — LATER, only after core verticals are profitable."
- `docs/WOMEN_ONLY_PLATFORM_PLAN.md` W9: "Child-friendly corner in salons
  (toys, coloring books) for moms who can't find childcare."

## 2. What already exists (foundation inventory)

| Piece                            | State                                                                                                                                                             |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FamilyMember` model             | SHIPPED — relationship (child/spouse/parent/sibling/other), ageGroup (infant/child/teen/adult/senior), preferences (gentle/hypoallergenic/fragrance_free…), notes |
| `familyAccount` router           | SHIPPED — list/add/update/remove/memberName (customer-only)                                                                                                       |
| Family-account UI                | SHIPPED — web page (~410 lines) + mobile screen                                                                                                                   |
| `Service.isMommyFriendly` flag   | SCHEMA ONLY — dormant, no seed usage, no UI badge                                                                                                                 |
| Booking ↔ family member link     | **MISSING** — `Booking` has no `familyMemberId`; you cannot book FOR a child today                                                                                |
| Kids categories/services in seed | **MISSING** — no kids category, no child services                                                                                                                 |
| Babysitting vertical             | **MISSING** — nothing at all                                                                                                                                      |

**Conclusion:** the "book on behalf of my kid" backbone (family members) is
already built; it is just not connected to bookings, and there is no kids
catalog to book from.

## 3. Two very different features share the C4 label

### C4a — Kids beauty & grooming (rides the existing vertical)

Kids haircuts, first-haircut packages, kid-safe nail care, gentle skincare
— delivered by existing technicians in existing venues/homeService flows.
The parent books, the child is the recipient.

- Reuses 100% of the provider pipeline (technicians, slots, bookings).
- Reuses `FamilyMember` for "on behalf of" metadata.
- Low risk, no new provider role, no liability surface beyond the standard
  service disclaimers (parent accompanies child).

### C4b — Babysitting (a NEW vertical)

Caregiver sessions (hourly), vetting/verification of caregivers, emergency
contacts, live session tracking, cancel/safety rules.

- New provider role or a new vertical on the unified provider model
  (`docs/STORE_MARKETPLACE_PLAN.md`).
- Real regulatory/liability surface (PDPL, child-safety checks) — would need
  product + possibly legal review before building.
- **Explicitly scope-guarded** by WOMEN_LIFESTYLE_EXPANSION_PLAN: "only after
  core verticals are profitable."

## 4. Recommended phasing (C4a first, C4b gated)

### Phase K1 — Book-on-behalf foundation (small)

- `Booking.familyMemberId` (optional FK) + migration.
- `bookings.create` input accepts `familyMemberId`; validates the member
  belongs to the customer; returns member name/ageGroup in booking detail.
- Technician booking views show "on behalf of: {name} (child)".
- Family-account UI: list members inline at checkout (picker).

### Phase K2 — Kids services catalog

- Kids root category in seed + child services (haircuts, first-cut packages,
  kid-safe care) with `isMommyFriendly: true`.
- Service cards get the mommy/kid-friendly badge; kids category filtering
  (ageGroup → recommended services mapping).
- Gentle/hypoallergenic preference hints from `FamilyMember.preferences`
  surfaced to the technician.

### Phase K3 — Mommy & Me bundles

- Mother+child same-slot packages (bundle of 2 services, one booking,
  child attached via family member).
- Salon "child-friendly corner" flag (W9) as a filter.

### Phase K4 — Babysitting vertical (GATED)

Only after core verticals are profitable (per the expansion plan scope
guard). If/when green-lit:

- Provider model decision (unified provider vs new caregiver role).
- Hourly pricing model, session tracking (reuse video/socket infra for
  live check-ins?), vetting flow, PDPL review, liability disclaimers.

## 5. Decisions (2026-09-15)

1. **Scope now** — **K1 only** (book-on-behalf foundation). K2/K3 stay
   planned, not executing.
2. **Book-on-behalf UX** — **family picker at checkout** (attach an optional
   family member to the booking; no separate kids mode).
3. **Mommy & Me** — **planned as K3**, parked with K4 until the core kids
   vertical lands.
4. **Babysitting provider model** (K4 plan only) — **a vertical on the
   unified provider model** (STORE_MARKETPLACE_PLAN), not a separate
   caregiver role. K4 remains gated: core verticals profitable first.

## 6. Definition of done

Per phase: schema/API + seed + web & mobile UI + tests (router contract +
e2e nav) merged to master with CI green, following the repo's standard
workflow (TDD, rtk, prettier-verify-before-push).
