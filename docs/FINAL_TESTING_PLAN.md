# Galaxy of Beauty — Final Testing & Verification Plan

> **Date:** 2026-08-08 | **Estimated:** 16-24 hours (2-3 days full-time)
> **Scope:** Web, Mobile, API, Database, UI/UX, Dark Mode, RTL, Error States

---

## Phase 1: Seed & Database (2 hours)

### 1.1 Seed Data Verification

- [ ] Run `pnpm db:seed` — verify no errors
- [ ] Run `pnpm db:seed:enrich` — verify 500+ bookings, 30+ customers created
- [ ] Verify all 202 Prisma models have at least 1 seed record
- [ ] Check for orphan data (records with broken foreign keys)

```bash
pnpm db:seed
pnpm db:seed:enrich
# Verify counts
pnpm --filter @galaxy/api exec ts-node scripts/verify-seed.ts
```

### 1.2 Database Health

- [ ] Run migrations check: `pnpm db:migrate:dev` — no pending migrations
- [ ] Verify all indexes exist (check `@@index` annotations match DB)
- [ ] Check for N+1 query patterns in any router

---

## Phase 2: API Health (3 hours)

### 2.1 All Routers Test

- [ ] Run `pnpm test` — all 334 tests must pass
- [ ] Test 10 most critical routers manually via curl/tRPC panel
- [ ] Verify auth flow: register → login → get token → access protected route
- [ ] Verify rate limiting works on public endpoints
- [ ] Verify CSRF protection on mutations

### 2.2 Missing Test Coverage (CRITICAL)

- [ ] 227 routers have ZERO tests — write at least 10 new test files for:
  - [ ] `skincare.ts` — skincare guide data
  - [ ] `beautyDashboard.ts` — dashboard stats
  - [ ] `loyalty.ts` — loyalty points
  - [ ] `marketplace.ts` — product listings
  - [ ] `beautyEvents.ts` — event CRUD
  - [ ] `technicianRatings.ts` — rating system
  - [ ] `beautyBudget.ts` — budget tracking
  - [ ] `subscriptions.ts` — subscription management
  - [ ] `giftCards.ts` — gift card system
  - [ ] `referrals.ts` — referral system

---

## Phase 3: Web — All Pages (4 hours)

### 3.1 Customer Pages (155 pages)

- [ ] Test all 155 customer pages return 200 (not 500)
- [ ] Verify 4-state pattern on all data-fetching pages:
  - [ ] Loading → shows skeleton (not blank)
  - [ ] Error → shows ErrorAlert with retry button
  - [ ] Empty → shows EmptyState with CTA
  - [ ] Data → shows actual content
- [ ] Check browser console for JS errors on each page
- [ ] Verify no React hydration mismatches

### 3.2 Admin Pages (35 pages)

- [ ] Test all admin pages load with admin auth
- [ ] Verify CRUD operations work (create, read, update, delete)

### 3.3 Tech Pages (10 pages)

- [ ] Test technician dashboard, bookings, earnings, calendar

### 3.4 Auth Pages

- [ ] Login, register, forgot password, reset password, 2FA, verify email

### 3.5 Public Pages

- [ ] Blog, events, beauty-quiz, gallery, lookbook, etc.

---

## Phase 4: UI/UX Audit (2 hours)

### 4.1 Dark Mode

- [ ] Toggle dark mode on 20 representative pages
- [ ] Verify all text is readable (no black-on-black or white-on-white)
- [ ] Verify all 548 Beauty components render correctly in dark mode

### 4.2 Arabic/RTL

- [ ] Verify all text renders right-to-left
- [ ] Check for English-only strings in Arabic pages
- [ ] Verify no LTR/RTL layout issues

### 4.3 Responsive Design

- [ ] Test 10 key pages at mobile (375px), tablet (768px), desktop (1280px)
- [ ] Verify touch targets ≥ 44px (WCAG 2.2)
- [ ] Verify no horizontal scroll on any page

### 4.4 Accessibility

- [ ] Run axe-core on 10 key pages
- [ ] Verify all images have alt text
- [ ] Verify all form inputs have labels
- [ ] Verify keyboard navigation works on modals

### 4.5 Performance

- [ ] Run Lighthouse on homepage, skincare-guide, dashboard
- [ ] Target: ≥ 90 Performance, ≥ 90 Accessibility, ≥ 80 SEO

---

## Phase 5: Mobile (2 hours)

### 5.1 Compilation

- [ ] `cd apps/mobile && npx tsc --noEmit` — 0 errors ✅
- [ ] `npx expo export --platform ios` — verify builds
- [ ] `npx expo export --platform android` — verify builds

### 5.2 Screen Verification

- [ ] Test 50 most-used mobile screens render correctly
- [ ] Verify 4-state pattern on mobile screens
- [ ] Verify no React Native-specific errors (raw text in View, etc.)

---

## Phase 6: Integration Flows (2 hours)

### 6.1 End-to-End User Journey

- [ ] Register → Login → Browse services → Book → Pay → Review
- [ ] Loyalty: Earn points → Redeem reward
- [ ] Referral: Share link → Friend registers → Earn bonus
- [ ] Subscription: Subscribe → Get benefits → Renew/Cancel
- [ ] Emergency: Trigger SOS → Verify notification → Resolve

### 6.2 Error Recovery

- [ ] Disconnect database → verify graceful error messages
- [ ] Submit invalid form data → verify validation errors
- [ ] Hit rate limit → verify 429 response with retry-after
- [ ] Expired token → verify auto-refresh or redirect to login

---

## Phase 7: Final Check (1 hour)

### 7.1 Build

- [ ] `pnpm build` — all workspaces build successfully
- [ ] `pnpm type-check` — all 6 packages pass
- [ ] `pnpm test` — all 334+ tests pass
- [ ] `pnpm lint` — 0 warnings, 0 errors

### 7.2 Documentation

- [ ] Update CLAUDE.md with new components
- [ ] Document any known issues found during testing
- [ ] Create release notes

---

## Summary

| Phase     | Task                      | Time         |
| --------- | ------------------------- | ------------ |
| 1         | Seed & Database           | 2h           |
| 2         | API Health + 10 new tests | 3h           |
| 3         | Web — all 272 pages       | 4h           |
| 4         | UI/UX audit               | 2h           |
| 5         | Mobile                    | 2h           |
| 6         | Integration flows         | 2h           |
| 7         | Final check               | 1h           |
| **Total** |                           | **16 hours** |

### Risk Factors

- First cold-compile takes 5+ minutes for 272 pages
- Some pages may need data setup to render correctly
- Mobile requires emulator/device for full test
- Seed data may need enhancement for new models

### Honest Verdict

**Yes, this is achievable.** The platform is in good shape — 0 type errors, all guide pages working. The main work is systematic verification and filling the 227-router test gap. I recommend starting immediately and completing Phase 1-3 today, Phases 4-7 tomorrow.
