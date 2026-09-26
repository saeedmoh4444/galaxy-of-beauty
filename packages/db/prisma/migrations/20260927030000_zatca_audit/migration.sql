-- 6.1a — ZATCA audit trail.
CREATE TABLE "zatca_audit_logs" (
    "id" SERIAL NOT NULL,
    "invoiceId" INTEGER NOT NULL,
    "event" TEXT NOT NULL,
    "actorId" INTEGER NOT NULL,
    "detail" JSONB,
    "previousHash" TEXT NOT NULL,
    "entryHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "zatca_audit_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "zatca_audit_logs_invoiceId_idx" ON "zatca_audit_logs"("invoiceId");
ALTER TABLE "zatca_audit_logs" ADD CONSTRAINT "zatca_audit_logs_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "zatca_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
