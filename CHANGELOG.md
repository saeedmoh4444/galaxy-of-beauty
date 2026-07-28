# Changelog — Galaxy of Beauty

## [2.1.0] — 2026-07-28

### New Features (30+)

**Wave 1 — Quick Wins (API-ready pages)**
- 🏆 Challenges — Customer dashboard with progress tracking and join flow
- 💬 Community Feed — Enhanced with user info, optimistic likes, pagination
- ⚡ Flash Deals — Rebuilt with live API, countdown timers, claim flow
- 👯‍♀️ Group Bookings — Create modal, member management, detail view
- 📝 Blog — Rebuilt with tag filtering, reading time, search, pagination
- 📅 Beauty Events — Rebuilt with event-type filter, countdown timers
- 💰 Price Estimator — Rebuilt with service search dropdown, promo validation
- 👰 Bridal Concierge — Smart auth-gated dashboard, progress tracker

**Wave 2 — Brand New Features**
- 🤳 Virtual Try-On AR — Camera-based makeup color simulation
- 📹 Beauty Tutorials — Video learning with category/difficulty filters
- 🗺️ Salon Map View — Interactive Leaflet/OpenStreetMap with technician markers
- 👨‍👩‍👧 Family Account — Manage family members, book on their behalf
- 🎨 Mood Board — Pinterest-style inspiration boards
- 💆‍♀️ Post-Service Care — Personalized aftercare tips by service category

**Wave 3 — Fill the Gaps**
- 🎂 Birthday Rewards — Reward claim with promo codes
- 🏅 Technician Badges — Public catalog with gradient cards
- 📢 Campaigns — Rebuilt with countdown timers, promo code copy
- 🧠 Skin Analysis Dashboard — Enhanced with stats, trend cards
- 🎫 Referral Leaderboard — Rebuilt with share card, leaderboard table
- 📊 Beauty Analytics — Spending KPIs, category breakdown, monthly trends

**Wave 4 — Next Horizons**
- 🧘 Wellness Tracker — Daily water/sleep/mood/steps/skincare check-in
- 🎟️ Event Ticketing — Browse events, reserve tickets
- 💬 Technician Q&A — Ask beauty experts by category
- 🏠 Home Service — At-home beauty booking with city-based pricing
- 🛡️ Service Warranty — Satisfaction guarantee with claims tracking

**Wave 5 — Engagement**
- 🎥 Live Stream — Live video player with real-time chat sidebar
- 📦 Box Builder — Custom monthly beauty box with product selection
- 🧠 AI Routine — Personalized AM/PM skincare by skin type
- 🎓 Beauty Courses — Multi-lesson courses with instructor info
- 💎 VIP Membership — 3-tier comparison with upgrade flow

### API Enhancements
- Blog router: added search support (JSONB title + tag matching)
- Flash Deals router: added service name/emoji enrichment + upcoming query
- Community router: added user info enrichment, myLikes query, delete mutation
- DashboardLayout: added mobile bottom navigation bar
- 11 new API routers (78 → 89 total)

### Platform Improvements
- 🔍 Search added to Blog and Tutorials pages
- 📱 Mobile bottom navigation bar with quick-access links
- 🧭 Breadcrumbs component added to deep pages
- ✨ Page fade-in animation on dashboard pages
- 📝 README updated with 50+ features across 7 categories
- 🏷️ data-testid attributes for E2E targeting
- 🧹 CardSkeleton replaces bare text loading states

### Technical Stats
- **Routers:** 78 → 89
- **Pages:** 70+ → 90+
- **Tests:** 243/243 passing (10 suites)
- **Type Check:** 10/10 workspaces
- **Build:** 5/5 tasks

---

## [2.0.0] — 2026-07-27

### Architecture
- Greenfield rebuild from Express + React/Vite → Next.js 14 + tRPC v11 + Turborepo
- Monorepo: `apps/web`, `apps/mobile`, `packages/api`, `packages/db`, `packages/shared`, `packages/config`
- 54 routers, 53 models, 69 pages at launch
- 243 tests across 10 suites

### Core Platform
- Booking management with 10-state lifecycle
- Payments via PayFort/APS with wallet + cashback
- JWT auth with rotation, 2FA TOTP, CSRF protection
- AI chatbot "Layla" (OpenAI GPT-4o-mini)
- ZATCA e-invoicing compliance
- Redis caching + rate limiting
- Docker Compose (5 services)
- PM2 + Nginx deployment

### Post-Audit Remediation
- 15/15 critical/high findings resolved
- Prisma migrations configured (dev + deploy)
- Contract tests added for all mutations
- Structured logging (Pino) replacing console.log
- ADR framework with 001 — TypeScript build strategy
- Legacy codebase archived to `_legacy/`
