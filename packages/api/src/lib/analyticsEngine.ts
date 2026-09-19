/**
 * 4.1 Advanced Analytics — pure aggregation engine.
 *
 * Deterministic functions over plain row fixtures (no Prisma): the
 * advancedAnalytics router fetches rows and delegates here, tests pin exact
 * outputs. Data-honesty notes:
 *  - MRR derives from active subscription plan prices (no charge history)
 *  - the funnel is the booking-status funnel (no visit/search tracking)
 *  - referral attribution uses referred users' COMPLETED bookings after
 *    the referral completedAt
 */

const MONTH_INTERVALS: Record<string, number> = {
  MONTHLY: 1,
  YEARLY: 1 / 12,
  BIWEEKLY: 2.17,
  WEEKLY: 4.33,
};

// ── Revenue metrics ──────────────────────────────────────────

export function computeMrr(
  subscriptions: Array<{ planId: number; status: string }>,
  plans: Array<{ id: number; price: number; interval: string }>,
): { mrr: number; planBreakdown: Array<{ planId: number; count: number; mrr: number }> } {
  const planById = new Map(plans.map((p) => [p.id, p]));
  let mrr = 0;
  const counts = new Map<number, number>();
  for (const sub of subscriptions) {
    if (sub.status !== 'ACTIVE') continue;
    const plan = planById.get(sub.planId);
    if (!plan) continue;
    const monthly = plan.price * (MONTH_INTERVALS[plan.interval] ?? 1);
    mrr += monthly;
    counts.set(sub.planId, (counts.get(sub.planId) ?? 0) + 1);
  }
  const planBreakdown = [...counts.entries()].map(([planId, count]) => {
    const plan = planById.get(planId)!;
    return {
      planId,
      count,
      mrr: count * plan.price * (MONTH_INTERVALS[plan.interval] ?? 1),
    };
  });
  return { mrr: Math.round(mrr * 100) / 100, planBreakdown };
}

export function computeArpu(revenue: number, activeCustomers: number): number {
  if (activeCustomers <= 0) return 0;
  return Math.round((revenue / activeCustomers) * 100) / 100;
}

export function computeLtv(arpu: number, churnRate: number): number {
  if (churnRate <= 0) return 0;
  return Math.round((arpu / churnRate) * 100) / 100;
}

export function computeChurn(activeNow: number, activeLastMonth: number): number {
  if (activeLastMonth <= 0) return 0;
  return Math.round((1 - activeNow / activeLastMonth) * 10000) / 10000;
}

// ── Cohort retention ─────────────────────────────────────────

export function cohortRetention(
  users: Array<{ id: number; createdAt: Date }>,
  bookings: Array<{ customerId: number; status: string; createdAt: Date }>,
  months = 6,
): Array<{ month: string; size: number; retentionByMonth: number[] }> {
  const monthOf = (d: Date): string => d.toISOString().slice(0, 7);
  const addMonths = (iso: string, n: number): string => {
    const [y, m] = iso.split('-').map(Number);
    const total = y! * 12 + (m! - 1) + n;
    return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}`;
  };

  const validByUser = new Map<number, string[]>();
  for (const b of bookings) {
    if (b.status !== 'COMPLETED') continue;
    const arr = validByUser.get(b.customerId) ?? [];
    arr.push(monthOf(b.createdAt));
    validByUser.set(b.customerId, arr);
  }

  const cohortMap = new Map<string, { size: number; returned: number[] }>();
  for (const u of users) {
    const signupMonth = monthOf(u.createdAt);
    const entry = cohortMap.get(signupMonth) ?? {
      size: 0,
      returned: Array.from({ length: months }, () => 0),
    };
    entry.size += 1;
    const booked = validByUser.get(u.id) ?? [];
    for (let m = 0; m < months; m++) {
      if (booked.includes(addMonths(signupMonth, m))) entry.returned[m]! += 1;
    }
    cohortMap.set(signupMonth, entry);
  }

  return [...cohortMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, { size, returned }]) => ({
      month,
      size,
      retentionByMonth: returned.map((r) => Math.round((r / size) * 1000) / 10),
    }));
}

// ── RFM segmentation ─────────────────────────────────────────

export interface RfmRow {
  customerId: number;
  lastOrderDaysAgo: number;
  orders: number;
  spent: number;
}

const quintile = (values: number[], value: number): number => {
  const sorted = [...values].sort((a, b) => a - b);
  const idx = sorted.filter((v) => v <= value).length;
  return Math.max(1, Math.min(5, Math.ceil((idx / Math.max(1, sorted.length)) * 5)));
};

export function segmentRfm(rows: RfmRow[]): {
  total: number;
  buckets: Record<string, number>;
  rows: Array<RfmRow & { r: number; f: number; m: number; bucket: string }>;
} {
  if (rows.length === 0) {
    return {
      total: 0,
      buckets: { champions: 0, loyal: 0, promising: 0, at_risk: 0, lost: 0 },
      rows: [],
    };
  }
  const recency = rows.map((r) => -r.lastOrderDaysAgo); // higher = more recent
  const frequency = rows.map((r) => r.orders);
  const monetary = rows.map((r) => r.spent);

  const scored = rows.map((row) => {
    const r = quintile(recency, -row.lastOrderDaysAgo);
    const f = quintile(frequency, row.orders);
    const m = quintile(monetary, row.spent);
    let bucket = 'promising';
    if (r >= 4 && f >= 4 && m >= 4) bucket = 'champions';
    else if (f >= 3 || m >= 3) bucket = 'loyal';
    else if (r <= 2) bucket = 'lost';
    else if (r <= 3 && f <= 2) bucket = 'at_risk';
    return { ...row, r, f, m, bucket };
  });

  const buckets = { champions: 0, loyal: 0, promising: 0, at_risk: 0, lost: 0 };
  for (const s of scored) buckets[s.bucket as keyof typeof buckets] += 1;
  return { total: rows.length, buckets, rows: scored };
}

// ── Booking funnel ───────────────────────────────────────────

export function bookingFunnel(bookings: Array<{ status: string }>): Array<{
  stage: string;
  count: number;
  dropOffPct: number;
}> {
  const order = ['REQUESTED', 'ACCEPTED', 'PAID', 'COMPLETED'];
  const counts = new Map<string, number>();
  for (const b of bookings) counts.set(b.status, (counts.get(b.status) ?? 0) + 1);
  const stages: Array<{ stage: string; count: number; dropOffPct: number }> = [];
  let prev = 0;
  for (const stage of order) {
    const count = counts.get(stage) ?? 0;
    stages.push({
      stage,
      count,
      dropOffPct: prev === 0 ? 0 : Math.round(((prev - count) / prev) * 1000) / 10,
    });
    prev = count;
  }
  return stages;
}

// ── Technician utilization ───────────────────────────────────

export function technicianUtilization(
  slots: Array<{ id: number; technicianId: number; isBooked: boolean }>,
  bookings: Array<{ technicianId: number }>,
): Array<{
  technicianId: number;
  bookedSlots: number;
  totalSlots: number;
  utilizationPct: number;
}> {
  const byTech = new Map<number, { booked: number; total: number }>();
  for (const s of slots) {
    const e = byTech.get(s.technicianId) ?? { booked: 0, total: 0 };
    e.total += 1;
    if (s.isBooked) e.booked += 1;
    byTech.set(s.technicianId, e);
  }
  // Bookings may reference technicians with NO slot rows — count them as
  // capacity, but never double-count techs whose slots already carry the
  // isBooked occupancy.
  for (const b of bookings) {
    if (byTech.has(b.technicianId)) continue;
    byTech.set(b.technicianId, { booked: 1, total: 1 });
  }
  return [...byTech.entries()].map(([technicianId, { booked, total }]) => ({
    technicianId,
    bookedSlots: booked,
    totalSlots: total,
    utilizationPct: total === 0 ? 0 : Math.round((booked / total) * 1000) / 10,
  }));
}

// ── Marketing ROI ────────────────────────────────────────────

export function promoRoi(
  usages: Array<{ promoCodeId: number; bookingId: number | null; discountAmount: number }>,
  bookings: Array<{ id: number; totalAmount: number }>,
): Array<{
  promoCodeId: number;
  redemptions: number;
  discountTotal: number;
  attributedRevenue: number;
}> {
  const bookingById = new Map(bookings.map((b) => [b.id, b.totalAmount]));
  const byPromo = new Map<
    number,
    { redemptions: number; discountTotal: number; attributedRevenue: number }
  >();
  for (const u of usages) {
    const e = byPromo.get(u.promoCodeId) ?? {
      redemptions: 0,
      discountTotal: 0,
      attributedRevenue: 0,
    };
    e.redemptions += 1;
    e.discountTotal += Number(u.discountAmount ?? 0);
    if (u.bookingId != null) e.attributedRevenue += Number(bookingById.get(u.bookingId) ?? 0);
    byPromo.set(u.promoCodeId, e);
  }
  return [...byPromo.entries()].map(([promoCodeId, v]) => ({ promoCodeId, ...v }));
}

export function referralAttribution(
  referrals: Array<{
    referrerId: number;
    referredId: number;
    status: string;
    completedAt: Date | null;
  }>,
  bookings: Array<{ customerId: number; status: string; totalAmount: number; createdAt: Date }>,
): Array<{ referrerId: number; referred: number; revenue: number }> {
  const completedRefs = referrals.filter((r) => r.status === 'COMPLETED' && r.completedAt);
  const byReferrer = new Map<number, { referred: Set<number>; revenue: number }>();
  for (const ref of completedRefs) {
    const e = byReferrer.get(ref.referrerId) ?? { referred: new Set<number>(), revenue: 0 };
    e.referred.add(ref.referredId);
    // Attribute COMPLETED bookings after the referral completedAt.
    for (const b of bookings) {
      if (
        b.customerId === ref.referredId &&
        b.status === 'COMPLETED' &&
        b.createdAt >= ref.completedAt!
      ) {
        e.revenue += Number(b.totalAmount);
      }
    }
    byReferrer.set(ref.referrerId, e);
  }
  return [...byReferrer.entries()].map(([referrerId, { referred, revenue }]) => ({
    referrerId,
    referred: referred.size,
    revenue,
  }));
}

// ── CSV export ───────────────────────────────────────────────

export function toCsv(
  rows: Array<Record<string, unknown>>,
  columns: Array<{ key: string; label: string }>,
): string {
  const escape = (v: unknown): string => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = columns.map((c) => escape(c.label)).join(',');
  const body = rows.map((r) => columns.map((c) => escape(r[c.key])).join(','));
  return [header, ...body].join('\n');
}
