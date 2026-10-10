# Per-Platform i18n Catalog Split — Architecture

<!-- cspell:ignore Turbopack -->

**Status**: live (PR #368 + #370), **locale split (PR #403)**. **Guarded**: CI build fails on violations.
**Last updated**: 2026-10-10

## Why

The web bundle shipped all ~8,825 catalog keys because web pages imported the legacy `t()` from the root barrel, which closed over the merged `sharedMessages` (non-tree-shakable spreads; `@galaxy/shared` has no `sideEffects` field). Mobile-only overlays are 3,557 net-new keys — 40% of the catalog riding in every web route. The split removed **~91 KB gzipped from every web route**.

## Module map

```text
packages/shared/src/i18n/
├── runtime.ts        # catalog-INDEPENDENT leaf: tFrom(key: string), isRTL, locales, localize
├── web.ts            # TYPE-ONLY domain imports → WebTranslationKey; getWebCatalog(locale)
│                     #   dynamic-imports messages/generated/{en,ar}.ts (promise cache)
├── web-server.ts     # SERVER-ONLY sync t() — statically imports BOTH generated catalogs
├── mobile.ts         # domain + 8 mobile overlays → mobileMessages (8,825 keys)
├── index.ts          # MERGED sharedMessages — reachable ONLY via @galaxy/shared/i18n-all
└── messages/
    ├── core.ts … bundles.ts   # 11 DOMAIN files — SOURCE OF TRUTH ({ ar, en } per key)
    └── generated/en.ts, ar.ts # flat per-locale catalogs (AUTO-GENERATED — do not edit)
```

| Entry (package.json exports)     | Contents                                                                                                                                 | Consumers                           |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `@galaxy/shared` (root)          | catalog-INDEPENDENT runtime (`getWebCatalog`, `tFrom`, `isRTL`, `localize`…) + **erased type-only** `TranslationKey`/`WebTranslationKey` | web app, ui barrel, any TS consumer |
| `@galaxy/shared/i18n`            | web.ts (was the merged module pre-split)                                                                                                 | RebookReminder (`localize`)         |
| `@galaxy/shared/i18n-web`        | web.ts                                                                                                                                   | opt-in strict web typing            |
| `@galaxy/shared/i18n/web-server` | web-server.ts — server-only sync `t(key, locale, vars?)`                                                                                 | web server components/pages         |
| `@galaxy/shared/i18n-mobile`     | mobile.ts                                                                                                                                | mobile LocaleProvider               |
| `@galaxy/shared/i18n-all`        | merged index.ts                                                                                                                          | api i18n regression test            |

## The invariant (do not break)

> **No web-reachable module may runtime-import `messages/mobile/**` or the merged `index.ts`.**
> Type-only imports are fine — `verbatimModuleSyntax: true` (packages/config/src/tsconfig/base.json) erases them in every toolchain (tsc, SWC, Metro, esbuild, Turbopack).

Enforced by `checkCatalogLeak()` in `scripts/check-size-budgets.mjs`: the CI Build step fails if any chunk in `apps/web/.next/static/**/*.js` contains one of the mobile-only Arabic sentinels.

## The locale split (do not break)

> **No client chunk may contain both locale catalogs.** The merged `{ ar, en }` shape exists only in the domain sources and the test-only merged module.

- Runtime web loading: `getWebCatalog(locale)` (dynamic import + promise cache, React `use()`-safe) — used by the web `LocaleProvider` (via `CatalogBridge`) and the standalone `useCatalogT()` hook (error page, ErrorBoundary, OfflineBanner, SkipLink — components that render outside the provider).
- Server-side sync strings: `import { t } from '@galaxy/shared/i18n/web-server'` — **server components only**. Importing it from a client component re-bundles both locales.
- The root barrel exports NO catalog values (`t`/`webMessages` were removed) — a client `import { t } from '@galaxy/shared'` is a compile error by design.
- Generated catalogs: `node --experimental-strip-types scripts/generate-locale-catalogs.mjs` (or `--check`). The drift test in `scripts/check-locale-catalogs.test.mjs` runs `--check` in CI.

Enforced by `checkLocaleSplit()` in `scripts/check-size-budgets.mjs`: the CI Build step fails if any chunk in `apps/web/.next/static/**/*.js` contains both the en and the ar sentinel (one distinctive sentence from the admin domain).

## Rules for adding keys

- **Web strings** → a domain catalog (`messages/*.ts`) **and then regenerate** the per-locale catalogs (`generate-locale-catalogs.mjs`). A `mobile.*` key passed to the web server `t()` is a **compile error** (`WebTranslationKey`).
- **Mobile strings** → append to `messages/mobile/customerB.ts` at the END, before `} as const satisfies …`. Prefix: `mobile.<area>.<…>`.
- **Values**: no leading/trailing spaces (catalog.test.ts trim gate). Separators stored trimmed (`'،'`); the space is applied at the join site.
- **Reuse before adding**: if an existing key already has the verbatim ar value, reuse it — never duplicate.
- **Never** re-export `sharedMessages`/`mobileMessages` as runtime values from the root barrel (this silently re-pulls the merged catalog; the leak guard exists to catch it).

## Type unions

- `TranslationKey` (root, type-only) = global union — used by mobile files and dynamic-key call sites; costs zero runtime bytes.
- `WebTranslationKey` = union of `keyof` across the 11 domain files (type-only imports in web.ts) — the strict union the web server `t()` enforces.
- `mobile.ts` `TranslationKey` ≡ the global union structurally (mobile includes every domain key).

## Tests that pin this

- `packages/shared/src/catalog.test.ts` — split invariants: no `mobile.*` in web; web ⊆ mobile; merged ≡ mobile; web < mobile − 3000.
- `packages/api/src/__tests__/i18n-catalog.test.ts` — per-platform §2d values; every mobile key exists in the merged union.
- `scripts/check-size-budgets.test.mjs` — leak-guard fixtures (clean tree → no hits; sentinel chunk → hit).
