# ART-006 — Making a Codebase Approachable

## The Question

"How do you make a codebase approachable for new team members?"

## Answer

A codebase is approachable when a new hire can ship their first bug fix within their first day — without asking "where does this code live?" more than twice.

### 1. Architecture Documentation That Actually Ships

Not a 50-page wiki written at project inception and never updated. I maintain these living documents at the repo root:

| Document                           | Purpose                                       | Updated                     |
| ---------------------------------- | --------------------------------------------- | --------------------------- |
| `README.md`                        | One command to start. Verified commands only. | Every PR that changes setup |
| `docs/architecture/context-map.md` | What lives where, what depends on what        | Every new service/module    |
| `docs/adr/`                        | Why we made each major decision               | Before implementation       |

### 2. Consistent, Discoverable Structure

Galaxy of Beauty follows Feature-Driven Design. A new developer can predict where code lives:

```
packages/api/src/routers/bookings.ts   ← Booking logic
packages/api/src/validators/booking.ts ← Booking validation
apps/web/src/app/(customer)/bookings/  ← Booking UI
```

No `utils/helpers.ts`, no `common/misc.ts`. Every file has a clear owner.

### 3. The Onboarding Task

Every new team member's first task is the same: **"Add a `health` field to the `/me` response and display it in the profile page."**

This touches:

- Prisma schema → teaches DB layer
- tRPC router → teaches API layer
- Next.js page → teaches web layer
- TypeScript types → teaches shared types
- Test file → teaches testing patterns

It's small enough to complete in a day, touches every layer, and produces visible output. By the time they submit the PR, they understand the full stack.

### 4. PR Templates That Teach

Our [PR template](../.github/PULL_REQUEST_TEMPLATE.md) asks for: scope, design notes, test evidence, risk assessment, and a pre-merge checklist. This isn't bureaucracy — it teaches new developers what "done" looks like. After three PRs, they internalize the checklist.

### 5. CI as the First Reviewer

Before a human looks at the code, CI checks: format, type-safety, lint, test coverage, build. New developers get fast, impersonal feedback on mechanical issues. The human reviewer focuses on design, security, and architecture — the things that require judgment.

### 6. Debt Is Visible and Owned

Our [technical-debt register](../TECHNICAL_DEBT.md) lists every known issue with severity, owner, and target date. A new developer seeing `P0-02: womensServices.ts router split (3,626 lines)` understands both the problem and that it's being tracked — they don't need to wonder "does anyone know this file is too big?"

### 7. Code Review as Coaching

When I review a PR from a junior developer, I separate feedback into three categories:

1. **🔴 Must fix** (security, data loss, crashes) — with exact code to use
2. **🟡 Should fix** (perf, maintainability, patterns) — with the principle explained
3. **🟢 Nice to have** (naming, style, alternative approach) — marked as optional

This prevents the "reviewer rewrote my entire PR" experience that kills confidence. Every comment teaches a principle, not just points out a mistake.
