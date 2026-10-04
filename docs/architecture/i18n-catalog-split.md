# Per-Platform i18n Catalog Split — Architecture

<!-- cspell:ignore Turbopack -->

**Status**: live (PR #368 + #370). **Guarded**: CI build fails on violations.
**Last updated**: 2026-10-04

## Why

The web bundle shipped all ~8,825 catalog keys because web pages imported the legacy `t()` from the root barrel, which closed over the merged `sharedMessages` (non-tree-shakable spreads; `@galaxy/shared` has no `sideEffects` field). Mobile-only overlays are 3,557 net-new keys — 40% of the catalog riding in every web route. The split removed **~91 KB gzipped from every web route**.

## Module map

```text
packages/shared/src/i18n/
├── runtime.ts        # catalog-INDEPENDENT leaf: tFrom(key: string), isRTL, locales, localize
├── web.ts            # 11 DOMAIN files only → webMessages (5,268 keys)
│                     #   t() accepts WebTranslationKey only (strict)
├── mobile.ts         # domain + 8 mobile overlays → mobileMessages (8,825 keys)
└── index.ts          # MERGED sharedMessages — reachable ONLY via @galaxy/shared/i18n-all
```

| Entry (package.json exports) | Contents                                                                                 | Consumers                           |
| ---------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------- |
| `@galaxy/shared` (root)      | web VALUES (`t`, `webMessages`, `tFrom`…) + **erased type-only** global `TranslationKey` | web app, ui barrel, any TS consumer |
| `@galaxy/shared/i18n`        | web.ts (was the merged module pre-split)                                                 | RebookReminder (`localize`)         |
| `@galaxy/shared/i18n-web`    | web.ts                                                                                   | opt-in strict web typing            |
| `@galaxy/shared/i18n-mobile` | mobile.ts                                                                                | mobile LocaleProvider               |
| `@galaxy/shared/i18n-all`    | merged index.ts                                                                          | api i18n regression test            |

## The invariant (do not break)

> **No web-reachable module may runtime-import `messages/mobile/**` or the merged `index.ts`.**
> Type-only imports are fine — `verbatimModuleSyntax: true` (packages/config/src/tsconfig/base.json) erases them in every toolchain (tsc, SWC, Metro, esbuild, Turbopack).

Enforced by `checkCatalogLeak()` in `scripts/check-size-budgets.mjs`: the CI Build step fails if any chunk in `apps/web/.next/static/**/*.js` contains one of the mobile-only Arabic sentinels.

## Rules for adding keys

- **Web strings** → a domain catalog (`messages/*.ts`). A `mobile.*` key passed to web `t()` is a **compile error** (`WebTranslationKey`).
- **Mobile strings** → append to `messages/mobile/customerB.ts` at the END, before `} as const satisfies …`. Prefix: `mobile.<area>.<…>`.
- **Values**: no leading/trailing spaces (catalog.test.ts trim gate). Separators stored trimmed (`'،'`); the space is applied at the join site.
- **Reuse before adding**: if an existing key already has the verbatim ar value, reuse it — never duplicate.
- **Never** re-export `sharedMessages`/`mobileMessages` as runtime values from the root barrel (this silently re-pulls the merged catalog; the leak guard exists to catch it).

## Type unions

- `TranslationKey` (root, type-only) = global union — used by mobile files and dynamic-key call sites; costs zero runtime bytes.
- `WebTranslationKey` = `keyof typeof webMessages` — the strict union web `t()` enforces.
- `mobile.ts` `TranslationKey` ≡ the global union structurally (mobile includes every domain key).

## Tests that pin this

- `packages/shared/src/catalog.test.ts` — split invariants: no `mobile.*` in web; web ⊆ mobile; merged ≡ mobile; web < mobile − 3000.
- `packages/api/src/__tests__/i18n-catalog.test.ts` — per-platform §2d values; every mobile key exists in the merged union.
- `scripts/check-size-budgets.test.mjs` — leak-guard fixtures (clean tree → no hits; sentinel chunk → hit).
