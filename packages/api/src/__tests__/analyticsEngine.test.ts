/**
 * 4.1 Advanced Analytics — pure engine tests. Every function is
 * deterministic over plain row fixtures (no Prisma), so thresholds and
 * buckets pin exactly.
 */
import { describe, it, expect } from 'vitest';
import {
  bookingFunnel,
  cohortRetention,
  computeArpu,
  computeChurn,
  computeLtv,
  computeMrr,
  promoRoi,
  referralAttribution,
  segmentRfm,
  technicianUtilization,
  toCsv,
} from '../lib/analyticsEngine';

const D = (iso: string): Date => new Date(iso);

describe('computeMrr', () => {
  it('normalizes plan intervals to monthly equivalents', () => {
    const plans = [
      { id: 1, price: 100, interval: 'MONTHLY' },
      { id: 2, price: 1200, interval: 'YEARLY' },
      { id: 3, price: 50, interval: 'BIWEEKLY' },
      { id: 4, price: 25, interval: 'WEEKLY' },
    ];
    const subs = [
      { planId: 1, status: 'ACTIVE' },
      { planId: 1, status: 'ACTIVE' },
      { planId: 2, status: 'ACTIVE' },
      { planId: 3, status: 'ACTIVE' },
      { planId: 4, status: 'PAUSED' },
    ];
    // 2×100 + 1200/12 + 50×2.17 = 200 + 100 + 108.5 = 408.5
    const { mrr } = computeMrr(subs as never, plans as never);
    expect(mrr).toBeCloseTo(408.5, 1);
  });

  it('ignores non-active subscriptions', () => {
    const plans = [{ id: 1, price: 100, interval: 'MONTHLY' }];
    const subs = [{ planId: 1, status: 'CANCELLED' }];
    expect(computeMrr(subs as never, plans as never).mrr).toBe(0);
  });
});

describe('ARPU / LTV / churn', () => {
  it('computes ARPU and LTV from revenue and customers', () => {
    expect(computeArpu(5000, 100)).toBe(50);
    // LTV = ARPU / churnRate
    expect(computeLtv(50, 0.05)).toBe(1000);
  });

  it('computes monthly churn rate', () => {
    expect(computeChurn(90, 100)).toBe(0.1);
    expect(computeChurn(100, 0)).toBe(0);
  });
});

describe('cohortRetention', () => {
  it('buckets users into signup months and tracks returning bookings', () => {
    const bookings = [
      { customerId: 1, status: 'COMPLETED', createdAt: D('2026-01-05') },
      { customerId: 1, status: 'COMPLETED', createdAt: D('2026-02-10') },
      { customerId: 2, status: 'COMPLETED', createdAt: D('2026-01-15') },
      { customerId: 2, status: 'COMPLETED', createdAt: D('2026-01-20') },
      { customerId: 3, status: 'CANCELLED', createdAt: D('2026-01-10') },
    ];
    const users = [
      { id: 1, createdAt: D('2026-01-01') },
      { id: 2, createdAt: D('2026-01-02') },
      { id: 3, createdAt: D('2026-01-03') },
    ];
    const cohorts = cohortRetention(users as never, bookings as never, 2);
    expect(cohorts.length).toBe(1);
    const jan = cohorts[0]!;
    expect(jan.month).toBe('2026-01');
    expect(jan.size).toBe(3);
    // Month 0 retention: both users 1 and 2 booked in January; user 3
    // cancelled so their only booking does not count as retention.
    expect(jan.retentionByMonth[0]).toBeCloseTo((2 / 3) * 100, 1);
    // Month 1: only user 1 returned in February.
    expect(jan.retentionByMonth[1]).toBeCloseTo((1 / 3) * 100, 1);
  });
});

describe('segmentRfm', () => {
  it('scores quintiles and assigns lifecycle buckets', () => {
    const rows = [
      { customerId: 1, lastOrderDaysAgo: 1, orders: 10, spent: 500 },
      { customerId: 2, lastOrderDaysAgo: 20, orders: 2, spent: 60 },
      { customerId: 3, lastOrderDaysAgo: 120, orders: 1, spent: 20 },
      { customerId: 4, lastOrderDaysAgo: 60, orders: 1, spent: 30 },
      { customerId: 5, lastOrderDaysAgo: 45, orders: 4, spent: 200 },
    ];
    const result = segmentRfm(rows as never);
    expect(result.total).toBe(5);
    const bucketOf = Object.fromEntries(result.rows.map((r) => [r.customerId, r.bucket]));
    expect(bucketOf[1]).toBe('champions'); // recent + frequent + high spend
    expect(bucketOf[3]).toBe('lost'); // oldest + single + low spend
    expect(result.buckets.champions).toBe(1);
    expect(result.buckets.lost).toBeGreaterThanOrEqual(1);
  });
});

describe('bookingFunnel', () => {
  it('computes stage counts and drop-off percentages', () => {
    const bookings = [
      { status: 'REQUESTED' },
      { status: 'REQUESTED' },
      { status: 'REQUESTED' },
      { status: 'ACCEPTED' },
      { status: 'ACCEPTED' },
      { status: 'PAID' },
      { status: 'COMPLETED' },
      { status: 'REJECTED' },
    ];
    const stages = bookingFunnel(bookings as never);
    const byStage = Object.fromEntries(stages.map((s) => [s.stage, s]));
    expect(byStage['REQUESTED']!.count).toBe(3);
    expect(byStage['ACCEPTED']!.dropOffPct).toBeCloseTo((1 / 3) * 100, 1); // 1 lost of 3
    expect(byStage['PAID']!.dropOffPct).toBe(50); // 1 of 2 lost
  });
});

describe('technicianUtilization', () => {
  it('computes booked slots over available slots per technician', () => {
    const slots = [
      { technicianId: 1, id: 1, isBooked: false },
      { technicianId: 1, id: 2, isBooked: true },
      { technicianId: 2, id: 3, isBooked: true },
      { technicianId: 2, id: 4, isBooked: true },
    ];
    const bookings = [{ technicianId: 1 }, { technicianId: 2 }, { technicianId: 2 }];
    const rows = technicianUtilization(slots as never, bookings as never);
    const byTech = Object.fromEntries(rows.map((r) => [r.technicianId, r]));
    expect(byTech[1]!.utilizationPct).toBe(50);
    expect(byTech[2]!.utilizationPct).toBe(100);
  });
});

describe('promoRoi', () => {
  it('attributes revenue via PromoUsage.bookingId', () => {
    const usages = [
      { promoCodeId: 1, bookingId: 11, discountAmount: 10 },
      { promoCodeId: 1, bookingId: 12, discountAmount: 5 },
      { promoCodeId: 2, bookingId: null, discountAmount: 0 },
    ];
    const bookings = [
      { id: 11, totalAmount: 100 },
      { id: 12, totalAmount: 60 },
    ];
    const rows = promoRoi(usages as never, bookings as never);
    expect(rows.length).toBe(2);
    const promo1 = rows.find((r) => r.promoCodeId === 1)!;
    expect(promo1.redemptions).toBe(2);
    expect(promo1.discountTotal).toBe(15);
    expect(promo1.attributedRevenue).toBe(160);
  });
});

describe('referralAttribution', () => {
  it('attributes referred users revenue after referral completion', () => {
    const referrals = [
      { referrerId: 1, referredId: 10, status: 'COMPLETED', completedAt: D('2026-02-01') },
      { referrerId: 1, referredId: 11, status: 'PENDING', completedAt: null },
    ];
    const bookings = [
      { customerId: 10, status: 'COMPLETED', totalAmount: 100, createdAt: D('2026-02-15') },
      { customerId: 10, status: 'COMPLETED', totalAmount: 50, createdAt: D('2026-01-10') },
      { customerId: 11, status: 'COMPLETED', totalAmount: 999, createdAt: D('2026-03-01') },
    ];
    const rows = referralAttribution(referrals as never, bookings as never);
    expect(rows.length).toBe(1);
    // Only the post-completion booking counts; PENDING referral excluded.
    expect(rows[0]!.referrerId).toBe(1);
    expect(rows[0]!.referred).toBe(1);
    expect(rows[0]!.revenue).toBe(100);
  });
});

describe('toCsv', () => {
  it('emits a header row and quotes values containing commas', () => {
    const csv = toCsv(
      [
        { name: 'قص الشعر', total: 100 },
        { name: 'A, B', total: 5 },
      ],
      [
        { key: 'name', label: 'Name' },
        { key: 'total', label: 'Total' },
      ],
    );
    const lines = csv.split('\n');
    expect(lines[0]).toBe('Name,Total');
    expect(lines[1]).toBe('قص الشعر,100');
    expect(lines[2]).toBe('"A, B",5');
  });
});
