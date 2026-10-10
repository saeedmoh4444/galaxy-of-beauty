# Web SEO & Metadata — Architecture

**Status**: live (PR #406). **Guarded**: CI fails on sitemap violations.
**Last updated**: 2026-10-10

## Why

Of 320 web pages, 319 relied on the root layout's default metadata — every
page advertised the same title/description/OG, and the sitemap listed 11
auth-gated routes (9 customer-group pages + login/register) that crawlers
hit as redirects. Per-page, locale-aware metadata is the highest-leverage
Arabic/English SEO work this platform can do without content rewrites.

## The system

### `apps/web/src/lib/seo.ts` — `pageMeta()`

Single builder for per-page metadata:

- **Locale-aware title/description** — the active locale (cookie) picks ar or en strings from the i18n catalog (`t(key, 'ar'|'en')` at build/render time).
- **Canonical** — `NEXT_PUBLIC_APP_URL + path`.
- **OpenGraph** — `locale: ar_SA | en_US`, site name, optional image.
- **Twitter card** — summary + title/description.
- **`noIndex` option** — for pages that must stay out of the index.

### The page pattern

```ts
// server page
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.x.title', 'ar'),
    titleEn: t('marketing.x.title', 'en'),
    descriptionAr: t('marketing.x.subtitle', 'ar'),
    descriptionEn: t('marketing.x.subtitle', 'en'),
    path: '/x',
  });
}
```

Rules:

- `generateMetadata` is **server-only**. A `'use client'` page that needs it gets a thin server wrapper (`page.tsx` → `XClient.tsx`) — exporting it from a client component fails the build.
- Titles/descriptions come from the **i18n catalogs** (never hardcoded) — this keeps ar/en parity and feeds the drift guard.
- Covered pages (16): home, services, stores, clinics, gyms, nail-bars, trainers, blog, beauty-packages, flash-deals, subscription-boxes, rewards, shop-the-look, barberettes, mommy-and-me, whatsapp-bot.

## Sitemap — the gate

`scripts/check-sitemap.test.mjs` (runs in the CI Architecture Gates job):

1. Every sitemap URL must map to a page file **outside** `(customer)`/`(auth)`/`(technician)`/`(store)`.
2. Auth-gated routes must never appear — crawlers were being sent to login redirects.

Adding a route to the sitemap = adding it to `apps/web/src/app/sitemap.ts`; the gate verifies it's public.

## Deliberately deferred (honest list)

| Item                     | Why deferred                                                                                     | Unblocked by                                                                               |
| ------------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| **hreflang alternates**  | Locale is cookie-based — there is no URL variant to link; emitting same-URL hreflang is invalid. | URL-based locales (e.g. `/ar/` + `/en/` prefixes) — a project-level decision.              |
| **CWV measurement pass** | Dev-mode Lighthouse is noise (NO_FCP on background tabs, unminified builds).                     | A production build + serve, then audit LCP/CLS/INP on the top pages and fix what it shows. |
| **Long-tail metadata**   | ~300 pages remain on layout defaults.                                                            | Continue the sweep page-by-page (the 16 cover the SEO-critical surface first).             |
