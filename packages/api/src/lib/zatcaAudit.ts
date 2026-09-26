/**
 * 6.1a — ZATCA audit trail: hash-chained, tamper-evident lifecycle
 * events per invoice. Rows are append-only (no update/delete API);
 * verifyChain recomputes the chain to detect tampering.
 */
import { createHash } from 'crypto';
import { Prisma } from '@galaxy/db';
import type { Prisma as PrismaTypes } from '@galaxy/db';

export type ZatcaAuditEvent =
  'GENERATED' | 'REPORT_REQUESTED' | 'REPORTED' | 'REPORT_FAILED' | 'CLEARED';

/**
 * Canonical serialization for the detail payload. JSONB does not
 * preserve key order, so a plain JSON.stringify at write time would not
 * match a re-serialization of the stored value — sort keys recursively.
 */
function stableStringify(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return `[${v.map(stableStringify).join(',')}]`;
  const obj = v as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(',')}}`;
}

export function computeEntryHash(args: {
  previousHash: string;
  invoiceId: number;
  event: string;
  actorId: number;
  createdAt: Date;
  detail?: unknown;
}): string {
  const payload = [
    args.previousHash,
    String(args.invoiceId),
    args.event,
    String(args.actorId),
    args.createdAt.toISOString(),
    stableStringify(args.detail),
  ].join('|');
  return createHash('sha256').update(payload, 'utf8').digest('hex');
}

/** Append an audit entry inside the caller's transaction. */
export async function appendAudit(
  tx: PrismaTypes.TransactionClient,
  args: { invoiceId: number; event: ZatcaAuditEvent; actorId: number; detail?: unknown },
): Promise<void> {
  const previous = await tx.zatcaAuditLog.findFirst({
    where: { invoiceId: args.invoiceId },
    orderBy: { id: 'desc' },
    select: { entryHash: true },
  });
  const previousHash = previous?.entryHash ?? '0'.repeat(64);
  const createdAt = new Date();
  const entryHash = computeEntryHash({
    previousHash,
    invoiceId: args.invoiceId,
    event: args.event,
    actorId: args.actorId,
    createdAt,
    detail: args.detail,
  });
  await tx.zatcaAuditLog.create({
    data: {
      invoiceId: args.invoiceId,
      event: args.event,
      actorId: args.actorId,
      detail: (args.detail as PrismaTypes.InputJsonValue) ?? Prisma.JsonNull,
      previousHash,
      entryHash,
      createdAt,
    },
  });
}

type ChainEntry = {
  previousHash: string;
  entryHash: string;
  invoiceId: number;
  event: string;
  actorId: number;
  createdAt: Date;
  detail: unknown;
};

/** Recompute the chain; false when any link or hash does not match. */
export function verifyChain(entries: ChainEntry[]): boolean {
  let previous = '0'.repeat(64);
  for (const e of entries) {
    if (e.previousHash !== previous) return false;
    const expected = computeEntryHash({
      previousHash: e.previousHash,
      invoiceId: e.invoiceId,
      event: e.event,
      actorId: e.actorId,
      createdAt: e.createdAt,
      detail: e.detail,
    });
    if (e.entryHash !== expected) return false;
    previous = e.entryHash;
  }
  return true;
}
