# Changelog

All notable changes to Galaxy of Beauty.

## [2.0.0] — 2026-07-26

### Added
- **Greenfield rebuild** to Next.js 14 + tRPC + Turborepo + pnpm monorepo
- 46 tRPC routers (170+ procedures) with end-to-end type safety
- 11 shared UI components in `@galaxy/shared` (Button, Card, Modal, Toast, etc.)
- Rate limiting middleware (Redis-backed, per-tier: 20/60/300 req/min)
- CSRF protection on all mutations (double-submit cookie pattern)
- `tailwind-merge` + `clsx` for proper class conflict resolution in `cn()`
- 36 integration tests exercising full tRPC pipeline
- Shared API types: `PaginatedResponse<T>`, `ApiError`, `BilingualContent`
- `.editorconfig` for cross-IDE consistency
- `CONTRIBUTING.md` with coding standards and workflow

### Changed
- Archived legacy codebase (`backend/`, `frontend/`, `mobileapp/`) → `_legacy/`
- Eliminated 81 `as never`/`as any` type casts across 37 web pages
- Reduced eslint-disables from 31 to 3 (legitimate ErrorBoundary only)
- PM2 config now supports `APP_ROOT` env var (no longer Docker-only)
- `ErrorAlert` now imports real `Button` component (no inline duplication)
- Renamed `DataView` → `FeatureDataView` to avoid native API conflict

### Fixed
- Variant form: field names `price`/`durationMin` → `priceDelta`/`durationDelta`
- KYC submission: `technicianId`/`adminNote` → `userId`/`notes`
- Dispute resolution: `resolutionNote` → `resolution`
- Payout procedures: `list` → `listForAdmin`, `processPayout` → `process`
- Gallery caption: `captionAr` → `captionJson.ar`
- Loyalty fields: `pointsToNextTier` → `nextTier.pointsNeeded`
- Admin API: missing `kycDocuments` in technician list response
- Booking creation: `idempotencyKey` now uses `crypto.randomUUID()`

## [1.0.0] — 2026-06-10

### Added
- Initial Express.js REST API (27 route modules, 22 services)
- React 18 + Vite SPA frontend
- Expo SDK 54 mobile app
- Prisma ORM with PostgreSQL 15
- PayFort/Amazon Payment Services integration
- OpenAI "Layla" chatbot
- ZATCA e-invoicing compliance
- JWT authentication with refresh token rotation
- Real-time updates via Socket.IO
- Docker Compose (4 services)
- GitHub Actions CI pipeline
