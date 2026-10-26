-- A1 — store staff accounts (VENDOR_PROFESSIONALIZATION_PLAN Wave A).
-- VendorStaff links a CUSTOMER-role user to a vendor with a capability
-- list (no UserRole change — the role-less ownership invariant governs);
-- StaffActivityLog is the vendor-scoped audit feed.

-- CreateTable
CREATE TABLE "vendor_staff" (
    "id" SERIAL NOT NULL,
    "vendorId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STAFF',
    "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "invitedBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_activity_logs" (
    "id" SERIAL NOT NULL,
    "vendorId" INTEGER NOT NULL,
    "actorUserId" INTEGER,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staff_activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vendor_staff_userId_key" ON "vendor_staff"("userId");
CREATE INDEX "vendor_staff_vendorId_idx" ON "vendor_staff"("vendorId");
CREATE INDEX "staff_activity_logs_vendorId_createdAt_idx" ON "staff_activity_logs"("vendorId", "createdAt");

-- AddForeignKey
ALTER TABLE "vendor_staff" ADD CONSTRAINT "vendor_staff_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vendor_staff" ADD CONSTRAINT "vendor_staff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "staff_activity_logs" ADD CONSTRAINT "staff_activity_logs_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "staff_activity_logs" ADD CONSTRAINT "staff_activity_logs_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
