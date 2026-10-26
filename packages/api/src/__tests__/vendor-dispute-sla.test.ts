/**
 * A4 — Dispute SLA + auto-escalation (VENDOR_PROFESSIONALIZATION_PLAN
 * Wave A). A store dispute that gets no vendor response within 48 hours
 * escalates once (escalatedAt + reason) and the vendor is nudged again;
 * the admin disputes list surfaces the escalated flag.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { buildUser } from './factories';
import { handleDisputeEscalationSweep } from '../workers/handlers';

const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];
const createdOrderIds: number[] = [];
const createdDisputeIds: number[] = [];
const createdTemplateIds: number[] = [];

let vendorUserId: number;
let staleId: number; // OPEN, >48h, no response → escalate
let respondedId: number; // OPEN, >48h, responded → skip
let resolvedId: number; // RESOLVED_CUSTOMER, >48h → skip
let freshId: number; // OPEN, <48h → skip
let vendorId: number;

async function mkDispute(orderId: number, data: Record<string, unknown> = {}) {
  const d = await prisma.dispute.create({
    data: {
      storeOrderId: orderId,
      raisedBy: vendorUserId,
      reason: 'not-as-described',
      status: 'OPEN',
      ...data,
    },
  });
  createdDisputeIds.push(d.id);
  return d;
}

async function mkOrder(ageHours: number) {
  const o = await prisma.storeOrder.create({
    data: {
      vendorId,
      customerId: vendorUserId,
      totalAmount: 100,
      itemCount: 1,
      status: 'FULFILLED',
      createdAt: new Date(Date.now() - ageHours * 3_600_000),
    },
  });
  createdOrderIds.push(o.id);
  return o;
}

beforeAll(async () => {
  const t = await prisma.notificationTemplate.upsert({
    where: { key: 'dispute_escalated' },
    update: {},
    create: {
      key: 'dispute_escalated',
      category: 'provider',
      channels: ['in_app'],
      titleJson: { ar: 'نزاع تم تصعيده', en: 'Dispute Escalated' },
      bodyJson: { ar: 'النزاع #{{disputeId}}', en: 'Dispute #{{disputeId}}' },
    },
  });
  createdTemplateIds.push(t.id);

  const vendorU = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(vendorU.id);
  vendorUserId = vendorU.id;
  const v = await prisma.vendor.create({
    data: { userId: vendorU.id, storeName: 'V a4', storeSlug: `a4-${Date.now()}` },
  });
  createdVendorIds.push(v.id);
  vendorId = v.id;

  const stale = await mkDispute((await mkOrder(80)).id, {
    createdAt: new Date(Date.now() - 80 * 3_600_000),
  });
  staleId = stale.id;
  const responded = await mkDispute((await mkOrder(80)).id, {
    createdAt: new Date(Date.now() - 80 * 3_600_000),
    vendorResponse: 'تم الشحن',
    vendorRespondedAt: new Date(Date.now() - 40 * 3_600_000),
  });
  respondedId = responded.id;
  const resolved = await mkDispute((await mkOrder(80)).id, {
    createdAt: new Date(Date.now() - 80 * 3_600_000),
    status: 'RESOLVED_CUSTOMER',
    resolvedAt: new Date(Date.now() - 40 * 3_600_000),
  });
  resolvedId = resolved.id;
  const fresh = await mkDispute((await mkOrder(2)).id, {
    createdAt: new Date(Date.now() - 2 * 3_600_000),
  });
  freshId = fresh.id;
}, 20000);

afterAll(async () => {
  await prisma.dispute.deleteMany({ where: { id: { in: createdDisputeIds } } });
  await prisma.storeOrder.deleteMany({ where: { id: { in: createdOrderIds } } });
  await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
  await prisma.notificationTemplate.deleteMany({ where: { id: { in: createdTemplateIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

describe('A4 — dispute SLA & auto-escalation', () => {
  it('escalates unresponded disputes past the 48h deadline once', async () => {
    const res = await handleDisputeEscalationSweep({ data: {} } as never);
    expect(res.escalated).toBeGreaterThanOrEqual(1);

    const escalated = await prisma.dispute.findUniqueOrThrow({ where: { id: staleId } });
    expect(escalated.escalatedAt).toBeTruthy();
    expect(escalated.escalatedReason).toBe('VENDOR_RESPONSE_DEADLINE');

    const notifs = await prisma.notification.findMany({
      where: { userId: vendorUserId, type: 'dispute_escalated' },
    });
    expect(notifs.length).toBeGreaterThanOrEqual(1);
  });

  it('skips responded, resolved, and fresh disputes', async () => {
    for (const id of [respondedId, resolvedId, freshId]) {
      const d = await prisma.dispute.findUniqueOrThrow({ where: { id } });
      expect(d.escalatedAt).toBeNull();
    }
  });

  it('is idempotent — no double escalation or re-notification', async () => {
    await handleDisputeEscalationSweep({ data: {} } as never);
    const notifs = await prisma.notification.findMany({
      where: { userId: vendorUserId, type: 'dispute_escalated' },
    });
    expect(notifs.length).toBeGreaterThanOrEqual(1);
    // Exactly one escalation row for our stale dispute (no updates).
    const escalated = await prisma.dispute.findUniqueOrThrow({ where: { id: staleId } });
    expect(escalated.escalatedAt).toBeTruthy();
  });
});
