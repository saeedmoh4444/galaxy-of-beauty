# 6.1 ZATCA Phase 2 — Delivery Brief

Phase 1 shipped invoice generation (hash-chain, TLV QR, cryptographic
stamp), reporting, and listing. Phase 2 closes the remaining plan items:

| Slice | Scope                                                   | Plan item                         |
| ----- | ------------------------------------------------------- | --------------------------------- |
| 6.1a  | Tamper-evident audit trail + admin compliance dashboard | Audit trail, compliance dashboard |
| 6.1b  | Monthly/quarterly VAT reports + CSV export              | Automated VAT reports             |
| 6.1c  | Clearance flow, REJECTED retries, env-gated auto-report | Real-time reporting lifecycle     |

## 6.1a — Audit trail + compliance dashboard

- `ZatcaAuditLog` model: `invoiceId`, `event` (`GENERATED`,
  `REPORT_REQUESTED`, `REPORTED`, `REPORT_FAILED`, `CLEARED`), `actorId`,
  `detail Json?`, `previousHash`, `entryHash`, `createdAt`. Hash-chained:
  `entryHash = sha256(previousHash|invoiceId|event|actorId|createdAt|detail)`.
  **Immutable** — no update/delete procedures; appended inside the
  invoice mutations' transactions.
- `zatca.dashboard` (admin): totals — invoices by status, VAT collected
  (REPORTED+CLEARED), pending/rejected counts, clearance rate, recent
  activity.
- `zatca.auditTrail` (admin): paginated entries for an invoice.
- `zatca.verifyChain` (admin): recomputes the chain for an invoice and
  reports tampering.
- Admin UI: compliance stat cards + audit table on `/admin/zatca`.

## 6.1b — VAT reports (next slice)

- `zatca.vatReport` (admin): `{ year, period: monthly|quarterly, index }`
  → per-invoice rows + totals (subtotal/VAT/total).
- `zatca.vatReportCsv` (admin): same window as UTF-8 CSV (BOM for Excel).

## 6.1c — Clearance + retries (next slice)

- `zatca.clearInvoice` (admin): REPORTED (or simplified PENDING) →
  CLEARED with optional `clearanceId`.
- `reportInvoice` accepts REJECTED retries (error surfaces, status is
  preserved on failure).
- `generateInvoice` auto-reports when `ZATCA_AUTO_REPORT=true`
  (default off).
