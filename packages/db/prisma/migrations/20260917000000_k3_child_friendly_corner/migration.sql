-- K3 (kids plan, W9): child-friendly corner flag on venue vendors.
ALTER TABLE "vendors" ADD COLUMN "childFriendlyCorner" BOOLEAN NOT NULL DEFAULT false;
