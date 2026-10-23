/**
 * D3 — store advisor rule triggers (rule-based v1). Pure unit tests on
 * computeAdvisorRules — thresholds, ordering, the 5-rule cap — plus the
 * advisor query and weekly digest handler (integration).
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Job } from 'bullmq';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';
import { computeAdvisorRules, type AdvisorInputs } from '../lib/storeAdvisor';
import { handleAdvisorDigestJob, type AdvisorDigestJob } from '../workers/handlers';

const createdUserIds: number[] = [];
let owner: JwtPayload;
let vendorId: number;

function callerFor(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

const base: AdvisorInputs = {
  products: [],
  expiredDeals: [],
  weekendShare: null,
  aov7d: null,
  aov30d: null,
};

describe('D3 — restock rule', () => {
  it('flags products at/below threshold with velocity, fastest first', () => {
    const rules = computeAdvisorRules({
      ...base,
      products: [
        { id: 1, nameAr: 'سيروم', stock: 3, threshold: 5, salesPerWeek: 10 },
        { id: 2, nameAr: 'كريم', stock: 1, threshold: 5, salesPerWeek: 20 },
        { id: 3, nameAr: 'غسول', stock: 12, threshold: 5, salesPerWeek: 30 }, // above threshold
        { id: 4, nameAr: 'تونر', stock: 0, threshold: 5, salesPerWeek: 0 }, // no velocity
      ],
    });
    expect(rules.filter((r) => r.key === 'vendorPortal.advisor.restock')).toHaveLength(2);
    expect(rules[0]!.key).toBe('vendorPortal.advisor.restock');
    expect(rules[0]!.params).toMatchObject({ name: 'كريم' }); // fastest mover leads
  });

  it('is silent when nothing needs restocking', () => {
    const rules = computeAdvisorRules({
      ...base,
      products: [{ id: 1, nameAr: 'سيروم', stock: 20, threshold: 5, salesPerWeek: 3 }],
    });
    expect(rules).toEqual([]);
  });
});

describe('D3 — expired-deal nudges', () => {
  it('flags deals whose window passed', () => {
    const rules = computeAdvisorRules({
      ...base,
      expiredDeals: [{ id: 7, titleAr: 'سيروم' }],
    });
    expect(rules).toHaveLength(1);
    expect(rules[0]!.key).toBe('vendorPortal.advisor.expired-deal');
  });
});

describe('D3 — weekend-peak hint', () => {
  it('fires at ≥50% Friday/Saturday share', () => {
    expect(computeAdvisorRules({ ...base, weekendShare: 0.5 }).map((r) => r.key)).toContain(
      'vendorPortal.advisor.weekend-peak',
    );
    expect(computeAdvisorRules({ ...base, weekendShare: 0.3 }).map((r) => r.key)).not.toContain(
      'vendorPortal.advisor.weekend-peak',
    );
  });
});

describe('D3 — AOV-drop flag', () => {
  it('fires when the 7-day AOV drops below 80% of the 30-day AOV', () => {
    const rules = computeAdvisorRules({ ...base, aov7d: 70, aov30d: 100 });
    expect(rules.map((r) => r.key)).toContain('vendorPortal.advisor.aov-drop');

    const calm = computeAdvisorRules({ ...base, aov7d: 90, aov30d: 100 });
    expect(calm.map((r) => r.key)).not.toContain('vendorPortal.advisor.aov-drop');
  });

  it('stays silent without AOV data', () => {
    expect(computeAdvisorRules({ ...base, aov7d: 70, aov30d: null })).toEqual([]);
  });
});

describe('D3 — advisor query + digest (integration)', () => {
  beforeAll(async () => {
    const ownerU = await prisma.user.create({ data: buildUser() });
    createdUserIds.push(ownerU.id);
    owner = { id: ownerU.id, role: 'CUSTOMER', email: ownerU.email };
    const vendor = await prisma.vendor.create({
      data: { userId: ownerU.id, storeName: 'D3 Store', storeSlug: `d3-${Date.now()}` },
    });
    vendorId = vendor.id;
    const cat = await prisma.productCategory.findFirstOrThrow({ orderBy: { sortOrder: 'asc' } });
    const p = await prisma.product.create({
      data: {
        vendorId: vendor.id,
        categoryId: cat.id,
        nameJson: { ar: 'سيروم', en: 'Serum' },
        descriptionJson: { ar: '', en: '' },
        price: 100,
        stock: 2,
        sales: 40,
        isActive: true,
        isDraft: false,
        lowStockThreshold: 5,
      },
    });
    await prisma.storeDeal.create({
      data: {
        productId: p.id,
        vendorId: vendor.id,
        originalPrice: 100,
        dealPrice: 50,
        startsAt: new Date(Date.now() - 10 * 86_400_000),
        endsAt: new Date(Date.now() - 86_400_000),
        isActive: true,
      },
    });
  }, 15000);

  afterAll(async () => {
    await prisma.notification.deleteMany({ where: { userId: { in: createdUserIds } } });
    await prisma.storeDeal.deleteMany({ where: { vendorId } });
    await prisma.product.deleteMany({ where: { vendorId } });
    await prisma.vendor.deleteMany({ where: { userId: { in: createdUserIds } } });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  });

  it('vendorPortal.advisor returns restock + expired-deal rules', async () => {
    const c = callerFor(owner);
    const rules = await c.vendorPortal.advisor();
    expect(rules.map((r: { key: string }) => r.key)).toContain('vendorPortal.advisor.restock');
    expect(rules.map((r: { key: string }) => r.key)).toContain('vendorPortal.advisor.expired-deal');
  });

  it('the digest handler notifies vendors with rules', async () => {
    const res = await handleAdvisorDigestJob({ data: { vendorId } } as Job<AdvisorDigestJob>);
    expect(res.notified).toBe(1);
    const notif = await prisma.notification.findFirst({
      where: { userId: owner.id, type: 'advisor_digest' },
    });
    expect(notif).not.toBeNull();
  });
});

describe('D3 — rule cap', () => {
  it('never exceeds 5 rules', () => {
    const rules = computeAdvisorRules({
      products: [1, 2, 3, 4, 5, 6].map((i) => ({
        id: i,
        nameAr: `م${i}`,
        stock: 0,
        threshold: 5,
        salesPerWeek: i,
      })),
      expiredDeals: [
        { id: 1, titleAr: 'أ' },
        { id: 2, titleAr: 'ب' },
        { id: 3, titleAr: 'ج' },
      ],
      weekendShare: 0.8,
      aov7d: 50,
      aov30d: 100,
    });
    expect(rules.length).toBeLessThanOrEqual(5);
  });
});
