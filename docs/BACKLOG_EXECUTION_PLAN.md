# Backlog Execution Plan

Created 2026-09-14 after the dependabot wave + RN 0.87 migration (master `642c925e`, all green).
User granted **full merge permissions** for this backlog — proceed without per-PR approval.

## Phase A — quick wins (small, low risk)

- **A1. EAS workflow Node fix** — `mobile-eas-build.yml` installs eas-cli 24.3.0 under Node 20;
  eas-cli now requires Node ≥22 (@oclif/plugin-autocomplete engine). Fails only on manual
  dispatch (skipped on pushes). Fix: bump `actions/setup-node` to 22/24 in that workflow,
  or pin eas-cli. Verify: dispatch the workflow and confirm the Verify job + EAS steps.
- **A2. react-native-worklets peer range** — 0.11.4 declares RN `0.83–0.86`, we're on 0.87.1.
  Bump to a version supporting RN 0.87 (check npm). Verify: `pnpm install` clean + export.
- **A3. Live bug: ai.chat duplicate** — investigate the duplicate message/room behavior.
- **A4. Live bug: video room no WebRTC** — investigate and wire actual WebRTC signaling.

## Phase B — parked dependabot majors (each: refresh branch, fix breakages, local type-check, CI, merge)

Order chosen by blast radius (small → large):

- **B1. #35 zod 3→4** — shared validators across all packages. Mechanical in most places.
- **B2. #40+#32 next 15→16 + next-eslint** — web app infra; async params, cache changes.
- **B3. #39 tailwind 3→4** — web styling; config migration (CSS-first config), class renames.
- **B4. #41 prisma 5→7** — client codegen + schema review; `prisma migrate dev` is already
  broken locally (hand-write SQL + `db execute` + `resolve --applied` per memory).

Each phase ends with: `pnpm type-check` 6/6, prettier clean, CI green, REST squash-merge,
master CI verified. Strict-protection recipe (temp strict-off via full protection PUT with
`checks[]` only) is documented in session-2026-09-14 memory if a merge wave is needed.

## Phase C — product backlog (from plan docs)

- **C1. PROTECTED_PATHS gating** — ~140 routes + 34-file gating sweep (MOBILE_FIX_PLAN §2c).
- **C2. §2d catalog conflicts** — mobile overrides web: 49 Arabic conflicts + ~13 English-in-AR.
- **C3. Women's expansion leftovers** — remaining parked items from the E1–E9 sprints.
- **C4. Kids/babysitting** — deferred feature (needs scope discussion).
- **C5. Design system Phases 2–4** — UI_DESIGN_SYSTEM_PLAN.md (Phase 1 shipped).

## Blocked on user

- **Brand naming** (decision) — legacy "Galaxy of Beauty" text stays next to logo meanwhile.

## Definition of done per item

Merged to master + the relevant CI jobs green on the merged commit.
