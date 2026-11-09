# OTA Cadence Policy (E2)

How Galaxy of Beauty ships mobile updates — when an over-the-air JS update is
right, when a full store build is required, and what happens when an update
goes wrong. The pipeline (EAS build + expo-updates auto-publish) exists; this
document pins the operating rules.

## 1. Two channels, one rule each

| Channel   | Purpose                         | Who receives it                     |
| --------- | ------------------------------- | ----------------------------------- |
| `preview` | Candidate updates + internal QA | Team devices (development builds)   |
| `prod`    | Public release channel          | App-store installs (production APK) |

- Every change ships to `preview` first and sits there for **≥ 24h** (or one
  full QA pass of the affected flow) before the same commit ships to `prod`.
- `prod` updates are **never** published from an unreviewed commit. The commit
  must exist on `master` (all CI gates green) — EAS Update publishes from the
  merged tree.

## 2. OTA vs full store build

**OTA (`eas update`)** — safe for changes fully contained in the JS bundle:

- UI copy/translations, layout/tailwind styling, screen logic, API-call shape
  changes that stay compatible with the published API, analytics/bugfixes in
  JS-only paths.

**Full store build (`eas build`)** — REQUIRED when:

- `app.json` native config changes (permissions, plugins, splash, icons),
- any native dependency changes in `apps/mobile/package.json`
  (new/changed versions of packages with native code),
- SDK/Expo major or minor upgrades,
- notification/update-channel config changes.

**Hard rule:** if a PR touches `app.json`, `android/`, `ios/`, or adds/updates
a native dependency, it ships as a **store build**, and the OTA for that
change is skipped. The EAS jobs already branch on this (config-plugin and
dependency detection in CI); do not override.

## 3. Cadence (the rhythm)

| Event             | Action                                                                                           |
| ----------------- | ------------------------------------------------------------------------------------------------ |
| Merge to `master` | CI publishes an OTA to `preview` automatically (current pipeline)                                |
| QA sign-off       | Publish the same update to `prod` (manual step, operator-triggered)                              |
| Native change     | `eas build` → store submission (Apple gate for iOS: Apple account)                               |
| Emergency fix     | Allowed to skip the 24h preview window; **must** be recorded in the incident doc with the reason |

No unscheduled `prod` publishes outside this table. Scheduled content drops
(promos, seasonal catalog) ride the normal merge → preview → prod flow.

## 4. Rollback & incident response

- A bad `prod` OTA rolls back with `eas update:rollback` (or the Expo console)
  within **15 minutes** of detection — the previous update bundle remains
  cached on devices, so rollback is instant on next check.
- A bad store build cannot be rolled back remotely — it needs a new build.
  This is why §2's split matters: anything risky goes through OTA, anything
  native gets extra QA before submission.
- Every rollback is logged in the audit log with the update ID that was
  reverted and the reason.

## 5. Versioning & compatibility

- OTA updates run on the installed native shell; they must never call APIs or
  native modules that the oldest supported store build doesn't have. Breaking
  API changes ship behind the app's native version floor (bump the shell
  first, wait for install base, then flip the JS).
- The API maintains backwards compatibility for one store-build generation
  (the previous store version must keep working against the current API).

## 6. Observability

- Every `prod` publish is announced in the team channel with the update ID.
- Expo update events (download success/failure) surface via the existing
  analytics pipeline; a spike in update-fetch failures after a publish
  triggers the §4 rollback path.
