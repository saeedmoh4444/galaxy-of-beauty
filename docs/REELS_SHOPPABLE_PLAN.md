# Shoppable Reels Plan — Galaxy of Beauty

> Companion to `VENDOR_PROFESSIONALIZATION_PLAN.md` (DELIVERED) and the
> E7 "beauty shorts" foundation (Short model + moderation + feed, shipped
> in Phase 3 sprint 1). This plan makes short video a **commerce surface**:
> reels on products, store pages and service cards — not a standalone
> TikTok clone.
>
> Status: **PHASE 1 DELIVERED** (2026-10-28/29, master `f15e0a02`) — the
> foundation is on master: surfaces, uploads, pipeline, web+mobile strips
> and moderation. Phases 2–3 (engagement + commerce) remain proposed.

---

## 0a. Phase 1 — delivery record (DELIVERED 2026-10-28/29)

| Item                  | PR   | Shipped                                                                                       |
| --------------------- | ---- | --------------------------------------------------------------------------------------------- |
| Plan doc              | #541 | this document (phases, pre-deployment checklist)                                              |
| R1 surface linkage    | #542 | `Short` → product/service/vendor FKs + `surfaceShorts` + ownership guards + 14 tests          |
| R2 video upload path  | #543 | `shorts` presigns (video-only) + 100 MB finalize cap + 10-reel quota + 6 tests                |
| R3 media pipeline     | #544 | `gob-media` worker — ffprobe duration + ffmpeg poster, graceful degradation + 3 tests         |
| R4 web surfaces       | #545 | reel strips on store + service pages (poster-first `ReelCard` rows) + E2E                     |
| R5 mobile surfaces    | #546 | `ReelStrip` on both mobile store screens, expo-video player + `mobile.stores.reels.title` key |
| R6 moderation reports | #547 | `ShortReport` + report flow + 3-report auto-hide + admin queue + vendor `myShorts` + 8 tests  |

The foundation is live: reels attach to catalog surfaces, upload through
a capped video path, get probed/poster-ized by a worker, render
poster-first on web + mobile, and moderate through reports/takedowns.

## 0. Why this shape

KSA beauty retail is social-commerce first (Snapchat/TikTok discovery →
storefront → purchase). The platform already has: `Short` (reel +
before/after, moderation-gated, consent + face-blur privacy), a public
feed + curated home row (`beautyShorts.feed` / `.home`), an admin
moderation queue, `ReelCard` in the UI kit, S3 in `me-south-1` with
presigned PUT, and — critically — the commerce rails (C1 variant picker,
cart/checkout, vendor analytics). The gap is **linkage**: a Short today
has no `productId`/`serviceId`/`vendorId`, so reels cannot appear on a
store, product or service page, and there is **no video upload path**
(uploads are images-only; presigned folders exclude shorts).

The winning move: **shoppable product/store reels as a storefront
surface**, with the discovery feed layered on top.

## 1. Non-goals

| Non-goal                          | Note                                                        |
| --------------------------------- | ----------------------------------------------------------- |
| Full TikTok clone                 | No comments/reactions/music library/personalized FYP        |
| Live streaming                    | Out of scope — booking-video rooms already exist            |
| User-generated (customer) uploads | Vendor/technician authors only; customers never post        |
| Cloud transcoding lock-in         | ffmpeg in a worker; no per-minute MediaConvert costs at MVP |

## 2. Phase 1 — Foundation (make it deployable)

### R1 — Surface linkage (data + router)

- `Short` gains nullable `productId` / `serviceId` / `vendorId` +
  relations + back-relations (`Product.shorts`, `Service.shorts`,
  `Vendor.shorts`) — Prisma 7 requires back-relations.
- Hand-written migration `20261028000000_short_surface_links`:
  3 nullable FK columns + indexes (the drift-safe recipe:
  SQL → `db execute --file` → `migrate resolve --applied` → `db:generate`).
- `beautyShorts.surfaceShorts` public query: one of product/service/vendor
  id → approved + active shorts, newest first, take 12; anonymous callers
  keep the face-blurred-only rule.
- `beautyShorts.create` gains optional attachment fields with ownership
  guards:
  - **Verified technician** (E7 rule stays): may tag their own store
    (`Technician.storeVendorId`) and its products/store-services, or a
    platform service they provide (`technicianServices`).
  - **Vendor owner/staff** (`vendorForStaff` reuse from A1): may tag
    themselves, their products, their store services.
  - Cross-owner tagging → `FORBIDDEN`; product/service must exist → `NOT_FOUND`.
- Tests first (TDD): `vendor-shorts-links.test.ts` — surface filtering,
  privacy rule on surfaces, ownership guard matrix, back-relation cleanup.

### R2 — Video upload path

- Presigned PUT for `shorts/` folder (extend the `uploads.presignedUrl`
  folder enum), video content-types only (`video/mp4`, `video/quicktime`,
  `video/webm`).
- Size discipline: ≤100 MB enforced via a `finalizeShortUpload` mutation
  (HEAD the object post-upload, reject oversize and delete) — presigned
  signatures cannot bound size.
- Per-vendor quota (10 active reels/vendor) checked at create.

### R3 — Media pipeline worker

- New `gob-media` BullMQ queue + worker (the `queues/index.ts` +
  `workers/handlers.ts` pattern): ffprobe → real `durationSec`; ffmpeg →
  poster frame + metadata strip (EXIF/GPS); HLS/MP4 1080p vertical
  transcode when ffmpeg is present.
- **Graceful degradation**: no ffmpeg binary → record the upload, keep the
  original URL, log a warning (dev/CI never blocks on binaries).
- Sentry alerting on pipeline failure + dead-letter retry (Sentry wired
  since #352).

### R4 — Web surfaces

- Product page: reels strip in the C4 media gallery (poster thumbnails,
  click-to-play — never eager video on a product page).
- Store page: reel strip under the storefront hero (C4c StorefrontClient
  section, lazy posters).
- Service detail: before/after + reel strip from `surfaceShorts`.
- E2E spec `shoppable-reels.spec.ts`: product → reel → play; store strip;
  anonymous blur rule visible.

### R5 — Mobile surfaces

- Expo Video (`expo-video`) on product and store screens; poster-first,
  tap-to-play; no new deps beyond expo-video (already in the SDK family).

### R6 — Moderation hardening + reports

- `shortReports` (reason enum + reportedShortId, unique per user) +
  admin queue entry; reported shorts auto-hide over threshold.
- Vendor-facing "my reels" moderation status (extends `myShorts`).

### Infra (user-gated, do before public launch — documented, not code)

- CloudFront (or Cloudflare) in front of the bucket: HLS manifest
  no-cache, segments long-cache; TLS on a media subdomain.
- S3 lifecycle: rejected shorts auto-delete after 14 days; old content →
  cheaper tier. Billing alarm on the account.
- Bucket CORS for direct PUTs.

## 3. Phase 2 — Engagement

- Full-screen swipe feed web + mobile (IntersectionObserver play/pause,
  autoplay muted, tap-to-unmute — KSA mobile-data respectful).
- Virtualized feed (current page renders N `<video>` elements at once —
  must be fixed before any growth).
- Watch analytics: watch-time + completion events (views alone don't
  measure conversion).

## 4. Phase 3 — Commerce (the payoff)

- **Shoppable reels**: product tags overlaid on the video → tap opens
  the product / add-to-cart (C1 picker + checkout already exist — mostly
  UI work).
- Reel → order conversion attribution into the vendor analytics
  read-models (D1/D2 pattern).
- Vendor reel analytics (views per reel, top reels) in the portal.

## 5. Pre-deployment checklist

1. **Cost**: lifecycle rules + billing alarm + server-side size caps
   (never client-only) + per-vendor quotas.
2. **Moderation SLA**: manual-only queue doesn't scale — wire a
   moderation API into the pipeline pre-launch, keep human review for
   borderline; reports/takedown from R6.
3. **Legal/KSA**: before/after content = advertising-claims risk →
   disclaimers; original/royalty-free audio only; no minors without
   guardian consent; consent checkbox stays mandatory; data stays in
   `me-south-1`.
4. **Performance**: lazy poster-first loading on store/product pages;
   feed virtualization; FE-007 bundle gate — players lazy-loaded, never
   in the main chunk.
5. **Observability**: transcode failures → Sentry + retry path.
6. **Analytics**: view/like exist; add watch-time + reel→product-click
   before launch so reels are measured by conversion, not vibes.

## 6. i18n key plan (Arabic-first)

- `beautyShorts.surface.*` (store/product/service strip titles)
- `admin.shorts.reports` (queue labels), `shorts.report` (report sheet)
- `shorts.shopNow` / `shorts.viewProduct` (commerce overlays)
- Keys land in `misc.ts` + generated `ar.ts`/`en.ts` at the alphabetical
  position; drift guard runs per PR (`check-locale-catalogs`).

## 7. Anticipated gotchas

- Prisma 7 back-relations are mandatory — adding a relation without the
  inverse fails `validate` (P1012 pattern from B5/G3).
- Presigned PUTs can't bound size — the finalize-HEAD step is the gate.
- The public feed must not regress the E7 privacy rule (anonymous =
  face-blurred only) on every new surface query.
- Video elements on store/product pages must be poster-first; eager
  loading would fail image/URL gates and kill LCP.
- The uploads folder enum is a closed zod enum — adding `shorts` touches
  existing uploads tests (update fixtures deliberately).
