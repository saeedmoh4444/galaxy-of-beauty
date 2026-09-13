# ADR-004: Split @galaxy/shared into Two Packages

**Date:** 2026-08-04
**Status:** Accepted

## Context

`@galaxy/shared` exported both pure TypeScript (types, constants, i18n, theme) AND JSX components (Button, Card, Modal, etc.). This forced the API package (`@galaxy/api`) to include `jsx: preserve` and `DOM` lib in its tsconfig — just to import constants like `DEFAULT_PAGE_SIZE`.

## Decision

Split into two packages:

| Package          | Contains                                                         | JSX?   | Imported by      |
| ---------------- | ---------------------------------------------------------------- | ------ | ---------------- |
| `@galaxy/shared` | Types, constants, i18n, theme tokens, utils (cn, formatCurrency) | ❌ No  | API, web, mobile |
| `@galaxy/ui`     | 18 UI components, 3 React hooks                                  | ✅ Yes | Web, mobile      |

`@galaxy/ui` re-exports everything from `@galaxy/shared` for convenience. Most pages only need one import: `from '@galaxy/ui'`.

## Consequences

**Positive:**

- API package no longer depends on React/DOM types
- Clean separation of concerns — pure logic vs. presentation
- ~250 web files + ~150 mobile files updated to `from '@galaxy/ui'`
- Future: `@galaxy/shared` can be used by non-React consumers (CLI tools, workers)

**Negative:**

- 2 packages to maintain instead of 1
- Import change across 400+ files (one-time cost, automated)
- Storybook config needed updating

## Alternatives Considered

1. **Keep as one package** — Rejected because it forces JSX dependency on API.
2. **Three packages** (shared + ui + hooks) — Rejected as over-fragmentation. Hooks live in ui since they depend on React.
3. **Conditional exports** — Use `package.json` exports to serve different entry points. Rejected because TypeScript doesn't resolve conditional exports well with workspace packages.
