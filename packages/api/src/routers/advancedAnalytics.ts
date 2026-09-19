/**
 * 4.1 Advanced Analytics — admin business-intelligence procedures.
 *
 * Each procedure fetches raw rows and delegates to the pure
 * lib/analyticsEngine functions (tested in isolation there; these tests
 * cover the fetch layer + export). All admin-gated.
 */
import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { adminProcedure, router } from '../trpc';
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

const now = new Date();
const monthAgo = new Date(now.getTime() - 30 * 86_400_000);
const yearAgo = new Date(now.getTime() - 365 * 86_400_000);

export const advancedAnalyticsRouter = router({
  revenue: adminProcedure.query(async () => {
    const [
      subs,
      plans,
      payments,
      monthPayments,
      lastMonthPayments,
      customers,
      monthCustomers,
      lastMonthCustomers,
    ] = await Promise.all([
      prisma.customerSubscription.findMany({
        select: { planId: true, status: true },
      }),
      prisma.subscriptionPlan.findMany({
        select: { id: true, price: true, interval: true },
      }),
      prisma.payment.findMany({
        where: { status: 'CAPTURED', createdAt: { gte: yearAgo } },
        select: { amount: true, createdAt: true },
      }),
      prisma.payment.findMany({
        where: { status: 'CAPTURED', createdAt: { gte: monthAgo } },
        select: { amount: true },
      }),
      prisma.payment.findMany({
        where: {
          status: 'CAPTURED',
          createdAt: { gte: new Date(now.getTime() - 60 * 86_400_000), lt: monthAgo },
        },
        select: { amount: true },
      }),
      prisma.user.findMany({ where: { role: 'CUSTOMER' }, select: { id: true } }),
      prisma.booking.findMany({
        where: { createdAt: { gte: monthAgo } },
        distinct: ['customerId'],
        select: { customerId: true },
      }),
      prisma.booking.findMany({
        where: {
          createdAt: { gte: new Date(now.getTime() - 60 * 86_400_000), lt: monthAgo },
        },
        distinct: ['customerId'],
        select: { customerId: true },
      }),
    ]);

    const monthRevenue = monthPayments.reduce((s, p) => s + Number(p.amount), 0);
    const lastMonthRevenue = lastMonthPayments.reduce((s, p) => s + Number(p.amount), 0);
    const activeCustomers = monthCustomers.length;
    const arpu = computeArpu(monthRevenue, activeCustomers);
    const churn = computeChurn(activeCustomers, lastMonthCustomers.length || 1);

    // 12-month revenue series.
    const monthlyRevenueSeries: Array<{ month: string; revenue: number }> = [];
    for (let m = 11; m >= 0; m--) {
      const start = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - m + 1, 0);
      const total = payments
        .filter((p) => p.createdAt >= start && p.createdAt <= end)
        .reduce((s, p) => s + Number(p.amount), 0);
      monthlyRevenueSeries.push({
        month: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`,
        revenue: total,
      });
    }

    const { mrr } = computeMrr(
      subs.map((s) => ({ planId: s.planId, status: s.status })),
      plans.map((p) => ({ id: p.id, price: Number(p.price), interval: p.interval })),
    );

    return {
      mrr,
      arpu,
      ltv: computeLtv(arpu, churn),
      churn,
      monthRevenue,
      lastMonthRevenue,
      monthlyRevenueSeries,
      totalCustomers: customers.length,
    };
  }),

  cohorts: adminProcedure.query(async () => {
    const [users, bookings] = await Promise.all([
      prisma.user.findMany({
        where: { role: 'CUSTOMER' },
        select: { id: true, createdAt: true },
      }),
      prisma.booking.findMany({
        where: { status: 'COMPLETED' },
        select: { customerId: true, status: true, createdAt: true },
      }),
    ]);
    return { cohorts: cohortRetention(users as never, bookings as never, 6) };
  }),

  rfm: adminProcedure.query(async () => {
    const since = new Date(now.getTime() - 180 * 86_400_000);
    const bookings = await prisma.booking.findMany({
      where: { status: { in: ['COMPLETED', 'PAID'] }, createdAt: { gte: since } },
      select: { customerId: true, totalAmount: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    const byCustomer = new Map<number, { last: Date; orders: number; spent: number }>();
    for (const b of bookings) {
      const e = byCustomer.get(b.customerId) ?? { last: b.createdAt, orders: 0, spent: 0 };
      e.orders += 1;
      e.spent += Number(b.totalAmount);
      if (b.createdAt > e.last) e.last = b.createdAt;
      byCustomer.set(b.customerId, e);
    }
    const rows = [...byCustomer.entries()].map(([customerId, e]) => ({
      customerId,
      lastOrderDaysAgo: Math.floor((now.getTime() - e.last.getTime()) / 86_400_000),
      orders: e.orders,
      spent: e.spent,
    }));
    const result = segmentRfm(rows);
    return {
      total: result.total,
      buckets: result.buckets,
      topSpenders: [...result.rows].sort((a, b) => b.spent - a.spent).slice(0, 10),
    };
  }),

  funnel: adminProcedure.query(async () => {
    const bookings = await prisma.booking.findMany({
      where: { createdAt: { gte: new Date(now.getTime() - 90 * 86_400_000) } },
      select: { status: true },
    });
    return { stages: bookingFunnel(bookings as never) };
  }),

  technicians: adminProcedure.query(async () => {
    const since = monthAgo;
    const [slots, bookings, reviews, recent] = await Promise.all([
      prisma.availabilitySlot.findMany({
        where: { startAt: { gte: since } },
        select: { id: true, technicianId: true, isBooked: true },
      }),
      prisma.booking.findMany({
        where: { startAt: { gte: since } },
        select: { technicianId: true },
      }),
      prisma.review.findMany({
        where: { createdAt: { gte: new Date(now.getTime() - 180 * 86_400_000) } },
        select: { rating: true, createdAt: true, booking: { select: { technicianId: true } } },
      }),
      prisma.booking.findMany({
        where: { startAt: { gte: since }, status: { in: ['CANCELLED', 'NO_SHOW'] } },
        select: { technicianId: true },
      }),
    ]);

    const utilization = technicianUtilization(slots as never, bookings as never);

    // Satisfaction trend — avg rating per month (last 6 months).
    const satisfactionTrend: Array<{ month: string; avgRating: number }> = [];
    for (let m = 5; m >= 0; m--) {
      const start = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - m + 1, 0);
      const inMonth = reviews.filter((r) => r.createdAt >= start && r.createdAt <= end);
      const avg =
        inMonth.length > 0 ? inMonth.reduce((s, r) => s + r.rating, 0) / inMonth.length : 0;
      satisfactionTrend.push({
        month: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`,
        avgRating: Math.round(avg * 100) / 100,
      });
    }

    // Cancellation rate per technician.
    const cancelled = new Map<number, number>();
    for (const b of recent) cancelled.set(b.technicianId, (cancelled.get(b.technicianId) ?? 0) + 1);
    const total = new Map<number, number>();
    for (const b of bookings) total.set(b.technicianId, (total.get(b.technicianId) ?? 0) + 1);
    const cancellations = [...new Set([...cancelled.keys(), ...total.keys()])].map((techId) => ({
      technicianId: techId,
      cancelled: cancelled.get(techId) ?? 0,
      total: total.get(techId) ?? 0,
      cancellationRate:
        (total.get(techId) ?? 0) === 0
          ? 0
          : Math.round(((cancelled.get(techId) ?? 0) / total.get(techId)!) * 1000) / 10,
    }));

    return { utilization, satisfactionTrend, cancellations };
  }),

  marketing: adminProcedure.query(async () => {
    const [usages, bookings, refs, completedRefs] = await Promise.all([
      prisma.promoUsage.findMany({
        select: { promoCodeId: true, bookingId: true, discountAmount: true },
      }),
      prisma.booking.findMany({ select: { id: true, totalAmount: true } }),
      prisma.referral.findMany({
        select: { referrerId: true, referredId: true, status: true, completedAt: true },
      }),
      prisma.referral.findMany({
        where: { status: 'COMPLETED' },
        select: { referredId: true },
      }),
    ]);
    const referredIds = new Set(completedRefs.map((r) => r.referredId));
    const referredBookings = await prisma.booking.findMany({
      where: { customerId: { in: [...referredIds] }, status: 'COMPLETED' },
      select: { customerId: true, status: true, totalAmount: true, createdAt: true },
    });

    const campaigns = promoRoi(usages as never, bookings as never);
    const attribution = referralAttribution(refs as never, referredBookings as never);
    return { campaigns, referrals: attribution };
  }),

  export: adminProcedure
    .input(
      z.object({
        section: z.enum(['revenue', 'cohorts', 'rfm', 'funnel', 'technicians', 'marketing']),
      }),
    )
    .query(async ({ input }) => {
      // Re-fetch via the sibling procedures (server caller-free: same router).
      // query result (duplicated fetch is acceptable for admin exports).
      switch (input.section) {
        case 'revenue': {
          const [subs, plans] = await Promise.all([
            prisma.customerSubscription.findMany({ select: { planId: true, status: true } }),
            prisma.subscriptionPlan.findMany({ select: { id: true, price: true, interval: true } }),
          ]);
          const { planBreakdown } = computeMrr(
            subs.map((s) => ({ planId: s.planId, status: s.status })),
            plans.map((p) => ({ id: p.id, price: Number(p.price), interval: p.interval })),
          );
          return {
            csv: toCsv(
              planBreakdown.map((p) => ({ planId: p.planId, count: p.count, mrr: p.mrr })),
              [
                { key: 'planId', label: 'Plan' },
                { key: 'count', label: 'Active subs' },
                { key: 'mrr', label: 'MRR' },
              ],
            ),
          };
        }
        case 'cohorts': {
          const [users, bookings] = await Promise.all([
            prisma.user.findMany({
              where: { role: 'CUSTOMER' },
              select: { id: true, createdAt: true },
            }),
            prisma.booking.findMany({
              where: { status: 'COMPLETED' },
              select: { customerId: true, status: true, createdAt: true },
            }),
          ]);
          const cohorts = cohortRetention(users as never, bookings as never, 6);
          return {
            csv: toCsv(
              cohorts.map((c) => ({
                month: c.month,
                size: c.size,
                m0: c.retentionByMonth[0] ?? 0,
                m1: c.retentionByMonth[1] ?? 0,
                m2: c.retentionByMonth[2] ?? 0,
              })),
              [
                { key: 'month', label: 'Cohort' },
                { key: 'size', label: 'Size' },
                { key: 'm0', label: 'M0%' },
                { key: 'm1', label: 'M1%' },
                { key: 'm2', label: 'M2%' },
              ],
            ),
          };
        }
        case 'rfm': {
          const since = new Date(now.getTime() - 180 * 86_400_000);
          const bookings = await prisma.booking.findMany({
            where: { status: { in: ['COMPLETED', 'PAID'] }, createdAt: { gte: since } },
            select: { customerId: true, totalAmount: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
          });
          const byCustomer = new Map<number, { last: Date; orders: number; spent: number }>();
          for (const b of bookings) {
            const e = byCustomer.get(b.customerId) ?? { last: b.createdAt, orders: 0, spent: 0 };
            e.orders += 1;
            e.spent += Number(b.totalAmount);
            if (b.createdAt > e.last) e.last = b.createdAt;
            byCustomer.set(b.customerId, e);
          }
          const result = segmentRfm(
            [...byCustomer.entries()].map(([customerId, e]) => ({
              customerId,
              lastOrderDaysAgo: Math.floor((now.getTime() - e.last.getTime()) / 86_400_000),
              orders: e.orders,
              spent: e.spent,
            })),
          );
          return {
            csv: toCsv(
              result.rows.map((r) => ({
                customerId: r.customerId,
                bucket: r.bucket,
                r: r.r,
                f: r.f,
                m: r.m,
                spent: r.spent,
              })),
              [
                { key: 'customerId', label: 'Customer' },
                { key: 'bucket', label: 'Bucket' },
                { key: 'r', label: 'R' },
                { key: 'f', label: 'F' },
                { key: 'm', label: 'M' },
                { key: 'spent', label: 'Spent' },
              ],
            ),
          };
        }
        case 'funnel': {
          const bookings = await prisma.booking.findMany({
            where: { createdAt: { gte: new Date(now.getTime() - 90 * 86_400_000) } },
            select: { status: true },
          });
          const stages = bookingFunnel(bookings as never);
          return {
            csv: toCsv(
              stages.map((s) => ({ stage: s.stage, count: s.count, dropOffPct: s.dropOffPct })),
              [
                { key: 'stage', label: 'Stage' },
                { key: 'count', label: 'Count' },
                { key: 'dropOffPct', label: 'Drop-off %' },
              ],
            ),
          };
        }
        case 'technicians': {
          const slots = await prisma.availabilitySlot.findMany({
            where: { startAt: { gte: monthAgo } },
            select: { id: true, technicianId: true, isBooked: true },
          });
          const bookings = await prisma.booking.findMany({
            where: { startAt: { gte: monthAgo } },
            select: { technicianId: true },
          });
          const utilization = technicianUtilization(slots as never, bookings as never);
          return {
            csv: toCsv(
              utilization.map((u) => ({
                technicianId: u.technicianId,
                utilizationPct: u.utilizationPct,
              })),
              [
                { key: 'technicianId', label: 'Technician' },
                { key: 'utilizationPct', label: 'Utilization %' },
              ],
            ),
          };
        }
        case 'marketing': {
          // Campaign ROI export (referral attribution lives in the UI table).
          const [usages, bookings] = await Promise.all([
            prisma.promoUsage.findMany({
              select: { promoCodeId: true, bookingId: true, discountAmount: true },
            }),
            prisma.booking.findMany({ select: { id: true, totalAmount: true } }),
          ]);
          const campaigns = promoRoi(usages as never, bookings as never);
          return {
            csv: toCsv(
              campaigns.map((c) => ({
                promoCodeId: c.promoCodeId,
                redemptions: c.redemptions,
                discountTotal: c.discountTotal,
                attributedRevenue: c.attributedRevenue,
              })),
              [
                { key: 'promoCodeId', label: 'Promo' },
                { key: 'redemptions', label: 'Redemptions' },
                { key: 'discountTotal', label: 'Discounts' },
                { key: 'attributedRevenue', label: 'Revenue' },
              ],
            ),
          };
        }
      }
      return { csv: '' };
    }),
});
