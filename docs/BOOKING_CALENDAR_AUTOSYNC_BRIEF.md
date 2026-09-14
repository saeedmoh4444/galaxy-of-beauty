# Booking Calendar Auto-Sync Brief

**Status:** v1 implemented (PR #140) · **Owner:** platform · **Date:** 2026-09-13

## Problem

Customer Google Calendar sync (E9) exists and pushes **cycle predictions**,
but the customer's **actual bookings** never land in their calendar. The
"booking auto-sync" leftover from the women's-expansion close-out.

## Scope (v1)

**Discovery at implementation time:** the auto-sync pipeline ALREADY exists —
`handleIntegrationJob` (workers/handlers.ts) pushes create/update/cancel to
BOTH the customer (`Booking.googleEventId`) and the technician
(`technicianGoogleEventId`) Google Calendars, with token refresh,
idempotency, and graceful degradation. The bookings router already enqueues
`calendar.create` (create), `calendar.update` (reschedule), `calendar.cancel`
(cancel/reject). What is actually missing is **customer-side backfill and
visibility**:

1. **`calendarSync.syncBookings`** (customer mutation) — backfill: pushes the
   caller's upcoming active bookings (ACCEPTED / CONFIRMED_OFFLINE / PAID,
   startAt ≥ now, `googleEventId IS NULL` — e.g. bookings made before the
   feature) to their connected Google Calendar. Synchronous, graceful:
   returns `{ connected, synced }`; Google failures per-event are swallowed
   and counted as unsynced.
2. **`calendarSync.upcoming` adds `synced`** (googleEventId != null) per
   booking so both screens can show which bookings already live on the
   customer's calendar.
3. **Screens** — web + mobile calendar-sync pages get a "مزامنة الحجوزات"
   (sync bookings) button + synced/unsynced badges + synced-count feedback,
   reusing the existing `status` query state.

## Out of scope (v1.1+)

- Event transparency/status sync (REQUESTED bookings currently appear on the
  calendar from creation — acceptable, the customer asked for them)
- Event attachments/location fields, reminders, webhook push channels

## Out of scope (v1.1+)

- Reschedule/update event move (delete + recreate is acceptable v1.1)
- Event attachments/location fields, reminders, recurring bookings
- Webhook-driven sync (Google push channels)

## Tests (api, TDD)

- `syncBookings`: connected → events created + ids stored; disconnected →
  `{connected:false}`; unconfigured → NOT_IMPLEMENTED path
- accept/offline-confirm transitions fire the push when the customer is
  connected (mock lib), and never fail the mutation when Google errors
- cancel deletes the event when googleEventId exists

## Verification

- typecheck green · api unit tests green · existing calendar-sync tests green
- E2E unaffected (no UI flow changes beyond the new button)
