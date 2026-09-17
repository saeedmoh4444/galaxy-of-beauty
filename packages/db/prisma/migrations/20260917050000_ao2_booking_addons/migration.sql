-- 1.3 Add-Ons Marketplace (ENHANCEMENT_PLAN) — AO-2: booked add-on
-- snapshot on the booking.
ALTER TABLE "bookings" ADD COLUMN "addonsJson" JSONB;
