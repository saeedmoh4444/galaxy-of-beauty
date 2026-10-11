# Starter Doc Kit — bootstrap documentation for a new platform

> One pointer for starting any new project: which docs from this repo survive as
> templates (structure yes, content no), and the order to write them in.
> Everything below was battle-tested on Galaxy of Beauty.

---

## The 12 files to copy (Tier 1)

| #   | File to copy                                                              | What survives as-is                                                                                                                                                                                                                             | How to fill it in the new project                                                                                                                    |
| --- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `brain_code.md`                                                           | The whole 4-lens framework: Paradigm (academic) → Anatomy (practical) → Industry Metaphor → Standard Term; patterns **Use / Don't Use / Must Adopt**; honest tech table with "Choose again?" column; strengths / weaknesses / next-leap verdict | Swap the stack rows, re-answer every "why" honestly. If you copy a claim, verify it first — this file exists to be doubted.                          |
| 2   | `Rules_to_make_well_archtichtrue-platform.md`                             | Section skeleton: Golden Rules → verified commands → architecture rules → DB rules → testing rules → performance rules → git/PR rules → improvement protocol → known gotchas                                                                    | Start with 5 golden rules max. Add gotchas the day they bite you, not before. Never copy another project's gotchas — they're only true for its repo. |
| 3   | `SECURITY.md`                                                             | Supported-versions table, vulnerability-reporting policy, dependency-audit log format, audit-in-CI acceptance policy, secure-practices checklist                                                                                                | Fill the audit log from your first `npm/pnpm audit`; the CI policy (criticals block merge, highs need documented acceptance) is universal.           |
| 4   | `README.md`                                                               | Structure: badge → tagline → quick start → ASCII architecture → tech-stack table → feature overview → status table → commands → docs index → security                                                                                           | Rewrite every number. The _status table with honest "readiness" line_ is the valuable part — most projects' READMEs lie; this one's structure can't. |
| 5   | `docs/architecture/context-map.md`                                        | Domain classification method + dependency rules (core / supporting / experimental tiers)                                                                                                                                                        | Reclassify for your domains; the tier taxonomy is the reusable idea.                                                                                 |
| 6   | `docs/architecture/model-ownership.md`                                    | Bounded-contexts model map + lifecycle status per model                                                                                                                                                                                         | Re-map your schema; the "Models Recommended for Archival" section is worth keeping from day one.                                                     |
| 7   | `docs/architecture/migration-standards.md`                                | Naming, squashed-baseline convention, redundant-index audit                                                                                                                                                                                     | Mostly ORM-agnostic; strip Prisma specifics.                                                                                                         |
| 8   | `docs/testing/risk-matrix.md`                                             | Tiered test-coverage strategy                                                                                                                                                                                                                   | Pure methodology — re-rank your own features.                                                                                                        |
| 9   | `docs/operations/runbooks.md`                                             | 7-scenario incident skeleton                                                                                                                                                                                                                    | Rename systems, keep the shape (diagnosis → mitigation → verification per scenario).                                                                 |
| 10  | `docs/AUDIT_PLAN.md` + `docs/AUDIT_2026-10-10.md`                         | The **audit taxonomy** (below) + the resolution-log table format                                                                                                                                                                                | Run this audit on the new platform when it reaches ~50 routes or touches money.                                                                      |
| 11  | `docs/adr/*.md`                                                           | ADR format: context → decision → consequences                                                                                                                                                                                                   | Write one per irreversible architectural choice; skip the trivial ones.                                                                              |
| 12  | `.github/` (PULL_REQUEST_TEMPLATE.md, CODEOWNERS, dependabot.yml, ci.yml) | Repo-hygiene skeletons                                                                                                                                                                                                                          | Keep the PR-template convention; CI gates will differ.                                                                                               |

## Day-1 creation order

1. `README.md` (front page — forces you to say what the thing IS)
2. `brain_code.md` (forces the first honest architecture decisions)
3. Rules file (start with 5 golden rules + commands that actually work)
4. `.github/` (PR template + CI skeleton before the first PR, not after)
5. `SECURITY.md` (before the first dependency lands)
6. ADRs — as decisions happen
7. `context-map.md` + `model-ownership.md` — when the schema passes ~10 models
8. `risk-matrix.md` + runbooks — when tests pass ~100
9. The deep audit — when routes pass ~50 or the platform touches money

## The audit taxonomy (the gem — copy verbatim)

Every gap found by a deep audit fits one of five buckets:

| Bucket             | Question it answers                                                                                                         |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| 🔴 Money-integrity | Does anything create value, balance, or state without the payment/money actually moving?                                    |
| 🟡 Functional      | Does anything render empty, dead-link, stub its way past a real flow, or hardcode a wrong default?                          |
| 🟠 Completeness    | What's missing that a user or operator would notice: error states, empty states, metadata, tests, architecture consistency? |
| ⚪ User-gated      | What's blocked on a decision or credential only the owner can provide (live tokens, accounts)? Not a bug — a queue.         |
| ⚪ Ops             | What's planned but not built: staging, backups, alerting, deploy strategy?                                                  |

And every finding ends in a **resolution log** row: `FIXED — what changed — where` or
`REVIEWED-REJECTED — why it stays as-is`. A closed audit beats an open one; an
unclosed audit rots into noise.

## What NOT to copy

- `*_PLAN.md` / `*_BRIEF.md` / roadmap / valuation / delivery reports — history of _this_ product
- ZATCA / MyFatoorah / PDPL docs — Saudi-specific
- The gotchas register — those are earned, not inherited
- CLAUDE.md / AGENTS.md — tooling config, project-specific
