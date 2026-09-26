/**
 * 4.2 A/B testing — deterministic assignment + event tracking.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';
import type { JwtPayload } from '../lib/jwt';
import { assignVariant } from '../lib/abTest';

const CSRF = 'a'.repeat(64);

async function callerFor(user?: JwtPayload) {
  const ctx = await createTRPCContext({ user, csrfCookie: CSRF, csrfHeader: CSRF });
  return (appRouter as any).createCaller(ctx);
}

let customer: JwtPayload;
let admin: JwtPayload;
const TEST_KEY = `perf_test_${Date.now()}`;

beforeAll(async () => {
  const anon = await callerFor();
  const login = await anon.auth.login({ email: 'customer@test.com', password: 'Admin@123456' });
  customer = { id: login.user.id, role: login.user.role, email: login.user.email };
  const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  admin = { id: adminUser!.id, role: adminUser!.role, email: adminUser!.email };

  await prisma.platformConfig.create({
    data: {
      key: `ab_test:${TEST_KEY}`,
      value: JSON.stringify({ variantA: 'original', variantB: 'new', trafficSplit: 50 }),
      updatedBy: admin.id,
    },
  });
}, 15000);

afterAll(async () => {
  await prisma.abTestEvent.deleteMany({ where: { testKey: TEST_KEY } });
  await prisma.platformConfig.deleteMany({ where: { key: `ab_test:${TEST_KEY}` } });
});

describe('assignVariant (pure)', () => {
  it('is deterministic per user + test', () => {
    const first = assignVariant(123, 'hero_copy', 50);
    const second = assignVariant(123, 'hero_copy', 50);
    expect(first).toBe(second);
  });

  it('respects traffic split boundaries', () => {
    // 0% sends everyone to A; 99% sends (almost) everyone to B.
    expect(assignVariant(1, 't1', 0)).toBe('A');
    expect(assignVariant(1, 't1', 99)).toBe('B');
  });

  it('spreads users across both variants at 50%', () => {
    const buckets = new Set<string>();
    for (let id = 1; id <= 200; id++) buckets.add(assignVariant(id, 'spread', 50));
    expect(buckets.size).toBe(2);
  });
});

describe('abTest router', () => {
  it('assigns the same variant on repeated calls and labels it from config', async () => {
    const caller = await callerFor(customer);
    const first = await caller.abTest.variant({ testKey: TEST_KEY });
    const second = await caller.abTest.variant({ testKey: TEST_KEY });
    expect(first.variant).toBe(second.variant);
    expect(['original', 'new']).toContain(first.variantLabel);
  });

  it('records impressions and conversions for admin results', async () => {
    const caller = await callerFor(customer);
    const assignment = await caller.abTest.variant({ testKey: TEST_KEY });
    await caller.abTest.convert({ testKey: TEST_KEY, variant: assignment.variant });

    const adminCaller = await callerFor(admin);
    const results = await adminCaller.abTest.results({ testKey: TEST_KEY });
    const bucket = results.variants.find(
      (v: { variant: string }) => v.variant === assignment.variant,
    );
    expect(bucket.impressions).toBeGreaterThanOrEqual(1);
    expect(bucket.conversions).toBeGreaterThanOrEqual(1);
    expect(bucket.conversionRate).toBeGreaterThan(0);
  });

  it('blocks non-admin access to results', async () => {
    const caller = await callerFor(customer);
    await expect(caller.abTest.results({ testKey: TEST_KEY })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });
});
