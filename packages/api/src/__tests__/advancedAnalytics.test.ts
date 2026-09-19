/**
 * advancedAnalytics router tests — 4.1. Admin-gated procedures over the
 * pure engine; fixtures exercise the DB-fetch layer and the export CSV.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { buildUser } from './factories';
import type { JwtPayload } from '../lib/jwt';

let admin: JwtPayload;
let customer: JwtPayload;

const createdUserIds: number[] = [];
const createdPlanIds: number[] = [];
const createdSubIds: number[] = [];

async function caller(u: JwtPayload | null) {
  return (appRouter as any).createCaller({ user: u, ip: '127.0.0.1' });
}

beforeAll(async () => {
  const a = await prisma.user.create({ data: buildUser({ role: 'ADMIN' }) });
  const c = await prisma.user.create({ data: buildUser({ role: 'CUSTOMER' }) });
  createdUserIds.push(a.id, c.id);
  admin = { id: a.id, role: 'ADMIN', email: a.email };
  customer = { id: c.id, role: 'CUSTOMER', email: c.email };

  const plan = await prisma.subscriptionPlan.create({
    data: {
      nameJson: { ar: 'باقة تحليل', en: 'Analytics Plan' },
      descriptionJson: { ar: 'وصف', en: 'Desc' },
      interval: 'MONTHLY',
      price: 150,
      servicesPerMonth: 4,
      isActive: true,
    },
  });
  createdPlanIds.push(plan.id);
  const sub = await prisma.customerSubscription.create({
    data: {
      userId: c.id,
      planId: plan.id,
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 86_400_000),
      autoRenew: true,
    },
  });
  createdSubIds.push(sub.id);
}, 20000);

afterAll(async () => {
  await prisma.customerSubscription.deleteMany({ where: { id: { in: createdSubIds } } });
  await prisma.subscriptionPlan.deleteMany({ where: { id: { in: createdPlanIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

describe('advancedAnalytics', () => {
  it('rejects non-admin callers', async () => {
    await expect((await caller(customer)).advancedAnalytics.revenue()).rejects.toThrow();
    await expect((await caller(null)).advancedAnalytics.revenue()).rejects.toThrow();
  });

  it('revenue returns MRR/ARPU/LTV/churn shapes', async () => {
    const res = await (await caller(admin)).advancedAnalytics.revenue();
    expect(typeof res.mrr).toBe('number');
    expect(typeof res.arpu).toBe('number');
    expect(typeof res.ltv).toBe('number');
    expect(typeof res.churn).toBe('number');
    expect(Array.isArray(res.monthlyRevenueSeries)).toBe(true);
  });

  it('cohorts returns retention buckets', async () => {
    const res = await (await caller(admin)).advancedAnalytics.cohorts();
    expect(Array.isArray(res.cohorts)).toBe(true);
    for (const cohort of res.cohorts) {
      expect(typeof cohort.month).toBe('string');
      expect(typeof cohort.size).toBe('number');
      expect(Array.isArray(cohort.retentionByMonth)).toBe(true);
    }
  });

  it('rfm returns buckets and top spenders', async () => {
    const res = await (await caller(admin)).advancedAnalytics.rfm();
    expect(typeof res.total).toBe('number');
    expect(res.buckets).toHaveProperty('champions');
    expect(Array.isArray(res.topSpenders)).toBe(true);
  });

  it('funnel returns the four stages with drop-offs', async () => {
    const res = await (await caller(admin)).advancedAnalytics.funnel();
    expect(res.stages.map((s: { stage: string }) => s.stage)).toEqual([
      'REQUESTED',
      'ACCEPTED',
      'PAID',
      'COMPLETED',
    ]);
    for (const stage of res.stages) {
      expect(typeof stage.count).toBe('number');
      expect(typeof stage.dropOffPct).toBe('number');
    }
  });

  it('technicians returns utilization + satisfaction + cancellations', async () => {
    const res = await (await caller(admin)).advancedAnalytics.technicians();
    expect(Array.isArray(res.utilization)).toBe(true);
    expect(Array.isArray(res.satisfactionTrend)).toBe(true);
    expect(Array.isArray(res.cancellations)).toBe(true);
  });

  it('marketing returns campaign ROI + referral attribution', async () => {
    const res = await (await caller(admin)).advancedAnalytics.marketing();
    expect(Array.isArray(res.campaigns)).toBe(true);
    expect(Array.isArray(res.referrals)).toBe(true);
  });

  it('export produces CSV strings per section', async () => {
    for (const section of ['revenue', 'cohorts', 'rfm', 'funnel', 'technicians', 'marketing']) {
      const res = await (await caller(admin)).advancedAnalytics.export({ section });
      expect(typeof res.csv).toBe('string');
      expect(res.csv.length).toBeGreaterThan(0);
      expect(res.csv.split('\n')[0]).toContain(',');
    }
  });
});
