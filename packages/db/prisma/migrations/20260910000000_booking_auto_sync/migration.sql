-- Booking auto-sync (E9 follow-up): track the technician's Google
-- Calendar event id per booking. The customer's event already lives in
-- googleEventId.
ALTER TABLE "bookings" ADD COLUMN "technicianGoogleEventId" TEXT;
