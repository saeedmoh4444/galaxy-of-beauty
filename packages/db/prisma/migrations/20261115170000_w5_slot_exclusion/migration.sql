-- W5-3 — AvailabilitySlot overlap guard: one technician cannot hold two
-- overlapping slots (booked or not). tsrange is IMMUTABLE (tstzrange on
-- the timestamp columns is not — it failed the index build).
CREATE EXTENSION IF NOT EXISTS btree_gist;
ALTER TABLE "availability_slots" ADD CONSTRAINT "availability_slots_no_overlap_excl"
  EXCLUDE USING gist (
    "technicianId" WITH =,
    tsrange("startAt", "endAt", '[)') WITH &&
  );
