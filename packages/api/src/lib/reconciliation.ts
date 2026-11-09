import { prisma } from '@galaxy/db';
import { getPaymentStatus, isFatoorahConfigured } from './fatoorah';

/**
 * C1 (PLATFORM_IMPROVEMENT_PLAN) — payment reconciliation.
 *
 * Compares recent local payment rows against the gateway's authoritative
 * status. Safe everywhere: with Fatoorah unconfigured (CI, dev without a
 * token) it reports `configured: false`; in simulate mode the gateway
 * always answers Paid, so the scan exercises the full path without a
 * live token.
 */

export type ReconciliationMismatchKind = 'status_mismatch' | 'gateway_unreachable';

export interface ReconciliationMismatch {
  paymentId: number;
  gatewayRef: string;
  localStatus: string;
  gatewayStatus: string | null;
  kind: ReconciliationMismatchKind;
}

export interface ReconciliationResult {
  configured: boolean;
  checked: number;
  mismatches: ReconciliationMismatch[];
}

/** Local CAPTURED is the "money moved" state — the gateway says Paid. */
const LOCAL_PAID_STATUSES = new Set(['CAPTURED', 'REFUNDED']);

/** Mirrors fatoorah.simulateActive — the scan must run in dev too. */
function simulateActive(): boolean {
  return process.env['FATOORAH_SIMULATE'] === 'true' && process.env['NODE_ENV'] !== 'production';
}

export async function reconcileRecentPayments(sinceHours = 36): Promise<ReconciliationResult> {
  if (!isFatoorahConfigured() && !simulateActive()) {
    return { configured: false, checked: 0, mismatches: [] };
  }

  const payments = await prisma.payment.findMany({
    where: {
      createdAt: { gte: new Date(Date.now() - sinceHours * 3_600_000) },
      gatewayRef: { not: null },
    },
    select: { id: true, gatewayRef: true, status: true },
    orderBy: { createdAt: 'asc' },
  });

  const mismatches: ReconciliationMismatch[] = [];
  for (const payment of payments) {
    try {
      const gateway = await getPaymentStatus({ invoiceId: payment.gatewayRef! });
      const localSettled = LOCAL_PAID_STATUSES.has(payment.status);
      const gatewaySettled = gateway.invoiceStatus === 'Paid';
      if (localSettled !== gatewaySettled) {
        mismatches.push({
          paymentId: payment.id,
          gatewayRef: payment.gatewayRef!,
          localStatus: payment.status,
          gatewayStatus: gateway.invoiceStatus,
          kind: 'status_mismatch',
        });
      }
    } catch {
      mismatches.push({
        paymentId: payment.id,
        gatewayRef: payment.gatewayRef!,
        localStatus: payment.status,
        gatewayStatus: null,
        kind: 'gateway_unreachable',
      });
    }
  }

  return { configured: true, checked: payments.length, mismatches };
}
