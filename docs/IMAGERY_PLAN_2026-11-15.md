# IMAGERY PLAN — real, distinct visuals for Galaxy of Beauty

**Created:** 2026-11-15 · **Owner:** platform engineering + boss (user-gated items)
**Status:** plan approved by boss ("make it") — slices build in order I1 → I6.
**Tracker:** `docs/AUDIT_2026-11-11_MASTER_PLAN.md` Part B + `docs/PLATFORM_IMPROVEMENT_PLAN_2026.md`.

## Goal

Every customer-facing surface shows a **real, distinct, culturally-appropriate image** for its
entity (service, category, store, product, technician, booking, community post) — with a
**fallback chain** so nothing ever renders as an emoji, placeholder box, or broken image.

Beauty is a visual purchase decision. The KSA women's market has a high aesthetic bar AND
specific cultural norms (modesty, hijab-appropriate, some categories better without
identifiable faces). Placeholder/stock mismatches damage trust and conversion.

## Two lanes (different owners, different timelines)

### Lane 1 — Platform-owned imagery (services, categories, heroes, banners)

We own this content. Ship **before deployment**.

| Source                | Use                                          | Note                                                                                                          |
| --------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **AI-generated**      | Starter library: category + service heroes   | Culturally-appropriate by prompt control; zero licensing risk; fast/cheap. **User-gated: generator account.** |
| **Licensed stock**    | Surfaces needing authentic human faces       | Testimonials, community, lifestyle.                                                                           |
| **Photography shoot** | Upgrade pass LATER — never blocks deployment | Already user-gated. Design the system so swapping source = drop-in URL change.                                |

### Lane 2 — User-generated imagery (vendors, products, technicians)

We build the **pipeline** now; vendors fill content after launch (chicken-and-egg: vendors
don't exist pre-launch). Every entity ships with a curated category default so the store
never looks empty; the upload path is frictionless from day one.

## Current state (2026-11-15)

- Schema already has the fields: `Service.imageUrl`, `Product.imageUrl` + `Product.images[]`,
  `Technician.avatarUrl`, store/vendor image fields.
- **Missing:** an upload pipeline (S3 presigned / multipart), CDN delivery (user-gated AWS
  console), a moderation hook on user-uploaded images, a shared fallback-chain resolver,
  and a real distinct-image content library (current content = static assets + emoji
  placeholders from the §3.5 sweep era).

## Build slices (test-first, one PR per slice, full CI, merge on green)

| ID  | Slice                                                                                                                                                                                                                                                 | Layer      | Effort | Gates on                   |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------ | -------------------------- |
| I1  | **Fallback chain resolver** — shared `resolveEntityImage(entity)` helper: entity image → category default → curated manifest → brand pattern. Adopt in service/store/product/technician card components (web+mobile). Unit tests in `@galaxy/shared`. | Shared+UI  | S      | —                          |
| I2  | **Curated default manifest** — JSON manifest of category/slug → image URL (per locale where relevant), consumed by I1. Serves as the swap point for the AI library.                                                                                   | Content    | S      | —                          |
| I3  | **Upload pipeline** — S3 presigned upload endpoint (env-gated, degrades to local storage in dev), entity attachment update (service/product/store/technician), size/type validation.                                                                  | API        | M      | AWS S3 bucket (user-gated) |
| I4  | **Moderation hook** — user-uploaded images enter the existing moderation queue before going live; fallback chain holds until approved.                                                                                                                | API        | S-M    | Moderation router (exists) |
| I5  | **Vendor/technician media management UI** — upload, reorder, delete in vendor-portal + technician profile (web+mobile mirrors).                                                                                                                       | Web+Mobile | M      | I3, I4                     |
| I6  | **CDN + optimization** — CloudFront wiring, WebP/AVIF transforms, responsive sizes, alt-text ar/en audit, size budgets.                                                                                                                               | Infra+Web  | M      | AWS console (user-gated)   |

## AI starter library (content task, user-gated account)

1. Boss picks a generator account (Midjourney / Flux / Replicate API) — **user-gated**.
2. Generate ~40-80 category/service hero images with a fixed prompt template (modest KSA
   women's beauty aesthetic, no identifiable faces where culturally appropriate, consistent
   lighting/palette).
3. Upload to the CDN (I6) and register in the I2 manifest → instantly live via I1 fallback.

## User-gated items

- AI generator account (content lane).
- AWS console: S3 bucket + CloudFront CDN (I3, I6).
- Photography shoot (upgrade pass, later).
- Fatoorah/Sentry/etc. — unchanged, unrelated.

## Sequencing vs the audit waves

Imagery code slices run **alongside the W3/W4 waves** (independent scope). Suggested order:
I1+I2 (one small PR) → I3+I4 (pipeline PR) → I5 (UI PR) → I6 (CDN, gated). The boss can
interleave or postpone any slice; the fallback chain (I1) is valuable even with the current
static assets.
