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

| Route Type                    | Max First Load JS | Current    |
| ----------------------------- | ----------------- | ---------- |
| Public pages (home, services) | <100 KB           | ~87 KB ✅  |
| Auth pages (login, register)  | <100 KB           | ~87 KB ✅  |
| Dashboard (customer)          | <150 KB           | ~90 KB ✅  |
| Admin dashboard               | <200 KB           | ~120 KB ✅ |

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
- **Bundle Analysis**: `ANALYZE=true pnpm build` for periodic review

## FE-008: Image Optimization

Next.js `<Image>` component configured in `next.config.js`:

- Formats: AVIF (primary), WebP (fallback)
- `remotePatterns`: Restricted to S3, galaxyofbeauty.sa, Google avatars
- Lazy loading: default on all images below the fold
- `minimumCacheTTL`: 24 hours for optimized images
