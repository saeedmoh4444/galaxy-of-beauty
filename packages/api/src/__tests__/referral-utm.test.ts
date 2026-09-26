/**
 * 8.1b — referral UTM attribution.
 *
 * shareCard emits UTM-tagged share URLs, applyCode persists an optional
 * utm payload onto the referral row, and getStats exposes a per-source
 * attribution breakdown.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { buildUser } from './factories';
import type { JwtPayload } from '../lib/jwt';

const createdUserIds: number[] = [];

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

async function makeUser(overrides?: { name?: string }): Promise<JwtPayload> {
  const user = await prisma.user.create({ data: buildUser({ name: overrides?.name }) });
  createdUserIds.push(user.id);
  return { id: user.id, role: user.role as JwtPayload['role'], email: user.email };
}

let referrer: JwtPayload;
let referredA: JwtPayload;
let referredB: JwtPayload;
let code: string;

beforeAll(async () => {
  referrer = await makeUser({ name: 'UtmRef' });
  referredA = await makeUser();
  referredB = await makeUser();
  const c = await caller(referrer);
  code = (await c.referrals.getMyCode()).code;
}, 15000);

afterAll(async () => {
  try {
    await prisma.referral.deleteMany({
      where: {
        OR: [{ referrerId: { in: createdUserIds } }, { referredId: { in: createdUserIds } }],
      },
    });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  } catch {
    /* best-effort */
  }
});

describe('shareCard UTM', () => {
  it('emits a UTM-tagged share URL', async () => {
    const c = await caller(referrer);
    const card = await c.referrals.shareCard();
    expect(card.shareUrl).toContain('register');
    expect(card.shareUrl).toContain(`ref=${card.code}`);
    expect(card.shareUrl).toContain('utm_source=referral');
    expect(card.shareUrl).toContain('utm_medium=share');
    expect(card.shareUrl).toContain(`utm_campaign=${card.code}`);
  });
});

describe('applyCode UTM persistence', () => {
  it('persists the utm payload with the referral row', async () => {
    const c = await caller(referredA);
    await c.referrals.applyCode({
      code,
      utm: { source: 'instagram', medium: 'story', campaign: 'ramadan', content: 'bio-link' },
    });
    const row = await prisma.referral.findFirstOrThrow({
      where: { referrerId: referrer.id, referredId: referredA.id },
    });
    expect(row.utmSource).toBe('instagram');
    expect(row.utmMedium).toBe('story');
    expect(row.utmCampaign).toBe('ramadan');
    expect(row.utmContent).toBe('bio-link');
  });

  it('stores nulls when no utm is provided', async () => {
    const c = await caller(referredB);
    await c.referrals.applyCode({ code });
    const row = await prisma.referral.findFirstOrThrow({
      where: { referrerId: referrer.id, referredId: referredB.id },
    });
    expect(row.utmSource).toBeNull();
    expect(row.utmCampaign).toBeNull();
  });

  it('rejects oversized utm values', async () => {
    const extra = await makeUser();
    const c = await caller(extra);
    await expect(
      c.referrals.applyCode({ code, utm: { source: 'x'.repeat(101) } }),
    ).rejects.toThrow();
    const row = await prisma.referral.findFirst({ where: { referredId: extra.id } });
    expect(row).toBeNull(); // nothing persisted
  });
});

describe('getStats attribution', () => {
  it('breaks down referrals by utm source', async () => {
    const c = await caller(referrer);
    const s = await c.referrals.getStats();
    expect(s.attribution).toEqual(
      expect.arrayContaining([
        { source: 'instagram', campaign: 'ramadan', count: 1 },
        { source: null, campaign: null, count: expect.any(Number) },
      ]),
    );
    const insta = s.attribution.find((a: any) => a.source === 'instagram');
    expect(insta?.count).toBe(1);
    const none = s.attribution.find((a: any) => a.source === null);
    expect(none?.count).toBeGreaterThanOrEqual(1);
  });
});
