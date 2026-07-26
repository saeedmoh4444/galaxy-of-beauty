# Contributing to Galaxy of Beauty

شكراً لمساهمتك! This guide helps you get started.

## Project Structure

This is a **pnpm monorepo** managed by **Turborepo**:

```
apps/web/        Next.js 14 App Router (customer/technician/admin portal)
apps/mobile/     Expo SDK 54 + Expo Router (iOS / Android)
packages/api/    tRPC v11 — 45 routers, all business logic
packages/db/     Prisma schema + client (42 models, PostgreSQL)
packages/shared/  UI kit, hooks, i18n, theme, shared types
packages/config/ TSConfig, ESLint, Prettier, Tailwind presets
```

## Quick Start

```bash
pnpm install
pnpm db:generate
pnpm db:push
pnpm dev                # Starts all dev servers
```

## Development Workflow

1. **Create a branch** from `master`
2. **Write tests first** (TDD — every feature needs tests)
3. **Run verification** before committing:
   ```bash
   pnpm type-check       # All 8 workspaces
   pnpm lint             # Zero warnings
   pnpm --filter @galaxy/api test   # 189+ tests
   ```
4. **Commit** with descriptive messages

## Coding Standards

### TypeScript
- Strict mode everywhere (`strict: true`)
- No `as any` / `as never` casts — use `RouterOutput` types from `@galaxy/api/client`
- Zod validation on every tRPC procedure input

### Components
- Every data-fetching component exports: `Skeleton | Error | Empty | FeatureDataView`
- Use `@galaxy/shared` UI components (Button, Card, Modal, etc.)
- Arabic-first RTL, English LTR

### API
- tRPC procedures use layered middleware:
  ```
  publicProcedure → protectedProcedure → customerProcedure / techProcedure / adminProcedure
  ```
- Mutations always require CSRF (double-submit cookie pattern)
- Rate limiting is applied globally

### No Hardcoding
- All configurable values go in environment variables (see `.env.example`)
- No API keys, URLs, or secrets in source code
- See `no_hardcoding_rules.md` for full rules

## Commit Convention

```
type: Brief description in English

- Bullet points for details
- Reference issue numbers if applicable

Co-Authored-By: Your Name <email>
```

Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`

## Testing

| Layer | Command | Framework |
|-------|---------|-----------|
| API Unit | `pnpm --filter @galaxy/api test` | Vitest |
| API Integration | (same) | Vitest + tRPC caller |
| Web E2E | `pnpm --filter @galaxy/web exec playwright test` | Playwright |
| Mobile E2E | Detox | `apps/mobile/e2e/` |

## Need Help?

- Check `README.md` for architecture overview
- Check `FULL_AUDIT.md` for known issues and recommendations
- Check `PLAN.md` for feature map and migration status
