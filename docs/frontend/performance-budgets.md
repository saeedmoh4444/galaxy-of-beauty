# Frontend Performance Budgets — FE-007

**Adopted**: 2026-08-11
**Applies to**: `apps/web` (Next.js)

## Web Vitals Targets

| Metric                              | Target | Current (est.) | Status |
| ----------------------------------- | ------ | -------------- | ------ |
| **LCP** (Largest Contentful Paint)  | <2.5s  | ~2.1s          | ✅     |
| **INP** (Interaction to Next Paint) | <200ms | ~150ms         | ✅     |
| **CLS** (Cumulative Layout Shift)   | <0.1   | ~0.05          | ✅     |
| **TTFB** (Time to First Byte)       | <800ms | ~400ms         | ✅     |

## JavaScript Bundle Budgets

| Route Type                    | Max First Load JS | Current (measured, gzipped) |
| ----------------------------- | ----------------- | --------------------------- |
| Public pages (home, services) | <100 KB           | ~604 KB ❌                  |
| Auth pages (login, register)  | <100 KB           | ~593 KB ❌                  |
| Dashboard (customer)          | <150 KB           | ~619 KB ❌                  |
| Admin dashboard               | <200 KB           | ~602 KB ❌                  |

> Current values are worst-route gzipped First-Load JS measured by
> `scripts/check-size-budgets.mjs` (2026-09-19). The ~600 KB floor is one
> shared tRPC/API-client chunk set loaded on every route — the top
> bundle-slimming backlog item.

## Automated Enforcement (FE-007 gate)

`scripts/check-size-budgets.mjs` (CI build job) measures every route's gzipped
First-Load JS from the Turbopack route bundle stats
(`apps/web/.next/diagnostics/route-bundle-stats.json`) and classifies routes
structurally from `apps/web/src/app` page files:
`(public)`/root/`offline` → public, `(auth)` → auth, `(customer)` → dashboard,
`admin`/`tech`/`(technician)` → admin; `api/*`, `sitemap.xml`, `_not-found`,
`_global-error` are excluded.

- **Default — regression gate**: fails when a class's worst route exceeds
  `scripts/size-baseline.json` × 1.05. The baseline is ratcheted down whenever
  bundle slimming lands; today it guards against regressions only.
- **`STRICT=1`** enforces the FE-007 caps above directly — the target once the
  shared bundle is slimmed.

## Image Budgets

| Constraint            | Rule                                   |
| --------------------- | -------------------------------------- |
| Hero images           | <200 KB, WebP/AVIF, lazy loaded        |
| Product/service cards | <50 KB, Next.js `<Image>` with `sizes` |
| Avatars               | <20 KB, 48×48px displayed              |

## CSS Budget

| Constraint            | Rule   |
| --------------------- | ------ |
| Total CSS (gzipped)   | <50 KB |
| Unused CSS (per page) | <10%   |
| Critical CSS inlined  | <14 KB |

## Font Budget

| Constraint       | Current                             |
| ---------------- | ----------------------------------- |
| Tajawal (Arabic) | 2 weights (400, 700), ~40 KB subset |
| Inter (English)  | 2 weights (400, 600), ~30 KB subset |

## Monitoring

- **Lighthouse CI**: Run on every PR for critical pages
- **Web Vitals**: `useReportWebVitals` in `_app.tsx` → Sentry
- **Bundle Analysis**: `pnpm check:budgets` — the FE-007 gate measures every route's gzipped First-Load JS on every CI build (see "Automated Enforcement" above); `STRICT=1` checks against the FE-007 caps

## FE-008: Image Optimization

Next.js `<Image>` component configured in `next.config.js`:

- Formats: AVIF (primary), WebP (fallback)
- `remotePatterns`: Restricted to S3, galaxyofbeauty.sa, Google avatars
- Lazy loading: default on all images below the fold
- `minimumCacheTTL`: 24 hours for optimized images
