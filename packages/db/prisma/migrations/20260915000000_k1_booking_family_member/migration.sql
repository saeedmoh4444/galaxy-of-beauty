-- K1 (kids plan): optional "book on behalf of" family member link on bookings
ALTER TABLE "bookings" ADD COLUMN "familyMemberId" integer;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_familyMemberId_fkey"
  FOREIGN KEY ("familyMemberId") REFERENCES "family_members"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "bookings_familyMemberId_idx" ON "bookings"("familyMemberId");
