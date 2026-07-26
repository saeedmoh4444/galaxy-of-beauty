# ⚠️ Legacy Codebase — Archived

> **Archived:** 2026-07-26  
> **Reason:** Replaced by the modern Turborepo + pnpm monorepo stack  
> **Canonical code:** `apps/` + `packages/` (root-level pnpm workspace)

## What's Here

These directories were the **original v1.0 implementation** of Galaxy of Beauty, built as three separate npm projects:

| Directory | Stack | Replaced By |
|-----------|-------|-------------|
| `backend/` | Express.js REST API + Prisma (27 routes, 22 services) | `packages/api/` — tRPC v11 (46 routers, 170+ procedures) |
| `frontend/` | React 18 + Vite SPA + React Router + Zustand | `apps/web/` — Next.js 14 App Router + tRPC |
| `mobileapp/` | Expo SDK 54 + React Navigation + Zustand | `apps/mobile/` — Expo SDK 54 + Expo Router + tRPC |
| `Report_of_your_system.md` | Original static analysis report (v1.0) | `FULL_AUDIT.md` (root) — updated audit |
| `k6-load-tests.js` | Original load test script | Needs updating for new tRPC API |

## Why Archived

The project was rebuilt from scratch as a **monorepo** with:
- **Turborepo** for build orchestration
- **pnpm workspaces** for dependency management  
- **tRPC v11** for end-to-end type-safe API
- **Next.js 14 App Router** for SSR-capable web frontend
- **Expo Router** for file-based mobile routing
- **Shared packages** (`@galaxy/api`, `@galaxy/db`, `@galaxy/shared`, `@galaxy/config`)

All 41 features from the legacy stack were ported, plus 17+ new features (marketplace, video consultations, skin analysis, loyalty program, subscription boxes, etc.).

## Key Features NOT Yet Ported from Legacy

If resurrecting these directories for reference, these features have no equivalent in the modern stack yet:

- **BullMQ job queues + cron scheduler** (`backend/src/jobs/`)
- **MJML email templates** (`backend/src/templates/emails/`)
- **ICS calendar file generation** (`backend/src/services/icsService.js`)
- **Hijri calendar conversions** (`backend/src/utils/hijriCalendar.js`)
- **Data encryption utility** (`backend/src/utils/encryption.js`)
- **Circuit breaker / degradation** (`backend/src/middleware/degradation.js`)
- **Offline action queue** (`mobileapp/src/utils/offlineQueue.js`)
- **Full i18n translation files** (`frontend/src/i18n/config.js`)

## Git History Preserved

The `git mv` command was used to move these directories, preserving full file history. Use:
```bash
git log --follow _legacy/backend/src/app.js
```

---

**Do not modify code in this directory.** It is kept for reference only. All active development happens in `apps/`, `packages/`, and root-level config files.
