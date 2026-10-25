/**
 * G3 — KYC document expiry reminders (VENDOR_DASHBOARD_ENHANCEMENT_PLAN
 * Wave 6). Vendors with a license expiry inside the 60-day window get an
 * inbox reminder (template `license_expiring`), deduped by a
 * licenseRemindedAt stamp (max one reminder per ~10 days).
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { buildUser } from './factories';
import { handleLicenseExpiryReminders } from '../workers/handlers';

const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];
const createdTemplateIds: number[] = [];

let nearId: number;
let farId: number;
let expiredId: number;
let alreadyRemindedId: number;

const DAY = 86_400_000;

async function mkVendor(ownerId: number, slug: string, data: Record<string, unknown> = {}) {
  const v = await prisma.vendor.create({
    data: { userId: ownerId, storeName: `V ${slug}`, storeSlug: slug, ...data },
  });
  createdVendorIds.push(v.id);
  return v;
}

async function notifsOf(userId: number) {
  return prisma.notification.findMany({ where: { userId, type: 'license_expiring' } });
}

beforeAll(async () => {
  const t = await prisma.notificationTemplate.upsert({
    where: { key: 'license_expiring' },
    update: {},
    create: {
      key: 'license_expiring',
      category: 'provider',
      channels: ['in_app'],
      titleJson: { ar: 'ترخيصك يقترب من الانتهاء', en: 'License Expiring' },
      bodyJson: { ar: 'ينتهي خلال {{days}} يوم', en: 'Expires in {{days}} days' },
    },
  });
  createdTemplateIds.push(t.id);

  const near = await prisma.user.create({ data: buildUser() });
  const far = await prisma.user.create({ data: buildUser() });
  const expired = await prisma.user.create({ data: buildUser() });
  const reminded = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(near.id, far.id, expired.id, reminded.id);

  const nearV = await mkVendor(near.id, `g3-near-${Date.now()}`, {
    licenseExpiryDate: new Date(Date.now() + 30 * DAY),
  });
  const farV = await mkVendor(far.id, `g3-far-${Date.now()}`, {
    licenseExpiryDate: new Date(Date.now() + 200 * DAY),
  });
  const expiredV = await mkVendor(expired.id, `g3-exp-${Date.now()}`, {
    licenseExpiryDate: new Date(Date.now() - 5 * DAY),
  });
  const remindedV = await mkVendor(reminded.id, `g3-rem-${Date.now()}`, {
    licenseExpiryDate: new Date(Date.now() + 15 * DAY),
    licenseRemindedAt: new Date(Date.now() - 2 * DAY), // reminded recently
  });
  nearId = nearV.id;
  farId = farV.id;
  expiredId = expiredV.id;
  alreadyRemindedId = remindedV.id;
}, 15000);

afterAll(async () => {
  await prisma.notification.deleteMany({ where: { userId: { in: createdUserIds } } });
  await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
  await prisma.notificationTemplate.deleteMany({ where: { id: { in: createdTemplateIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

describe('G3 — license expiry reminders', () => {
  it('reminds vendors expiring within 60 days and stamps the reminder', async () => {
    const res = await handleLicenseExpiryReminders({ data: {} } as never);
    expect(res.reminded).toBe(1);

    const nearV = await prisma.vendor.findUniqueOrThrow({ where: { id: nearId } });
    expect(nearV.licenseRemindedAt).toBeTruthy();
    const owner = await prisma.vendor.findUniqueOrThrow({
      where: { id: nearId },
      select: { userId: true },
    });
    const rows = await notifsOf(owner.userId);
    expect(rows).toHaveLength(1);
    expect((rows[0].bodyJson as { ar: string }).ar).toContain('30');
  });

  it('skips far-future, already-expired, and recently-reminded vendors', async () => {
    const res = await handleLicenseExpiryReminders({ data: {} } as never);
    // The near vendor was just stamped — the second run must not re-remind.
    expect(res.reminded).toBe(0);
    for (const id of [farId, expiredId]) {
      const v = await prisma.vendor.findUniqueOrThrow({ where: { id } });
      expect(v.licenseRemindedAt).toBeNull();
    }
    // The recently-reminded vendor keeps its existing stamp (within the
    // 10-day dedupe window) — it was never nudged again.
    const reminded = await prisma.vendor.findUniqueOrThrow({
      where: { id: alreadyRemindedId },
    });
    expect(reminded.licenseRemindedAt).toBeTruthy();
  });
});
