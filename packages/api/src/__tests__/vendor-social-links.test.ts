/**
 * B6 — Vendor social links (VENDOR_PROFESSIONALIZATION_PLAN Wave B,
 * user-requested 2026-10-25). Snapchat / TikTok / X / Instagram /
 * Facebook handles per vendor, stored as one Json column, editable by
 * the owner, rendered on the web + mobile storefronts. Zero-link
 * hygiene: only networks that are set render.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];

let owner: JwtPayload;
let vendorId: number;

async function caller(user: JwtPayload) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

beforeAll(async () => {
  const ownerU = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(ownerU.id);
  owner = { id: ownerU.id, role: 'CUSTOMER', email: ownerU.email };
  const v = await prisma.vendor.create({
    data: { userId: ownerU.id, storeName: 'V b6', storeSlug: `b6-${Date.now()}` },
  });
  createdVendorIds.push(v.id);
  vendorId = v.id;
}, 15000);

afterAll(async () => {
  await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

describe('B6 — vendor social links', () => {
  it('owner stores links and they ride along on myStore', async () => {
    const c = await caller(owner);
    const updated = await c.vendorPortal.updateSocialLinks({
      instagram: 'https://instagram.com/galaxybeauty',
      tiktok: 'https://tiktok.com/@galaxybeauty',
      x: 'https://x.com/galaxybeauty',
    });
    expect(updated.socialLinks).toMatchObject({
      instagram: 'https://instagram.com/galaxybeauty',
      tiktok: 'https://tiktok.com/@galaxybeauty',
      x: 'https://x.com/galaxybeauty',
    });

    const store = await c.vendorPortal.myStore();
    expect(store.socialLinks).toMatchObject({ instagram: expect.any(String) });
  });

  it('rejects invalid URLs (BAD_REQUEST from the zod layer)', async () => {
    const c = await caller(owner);
    await expect(c.vendorPortal.updateSocialLinks({ snapchat: 'not-a-url' })).rejects.toMatchObject(
      { code: 'BAD_REQUEST' },
    );
  });

  it('an empty string removes the network (zero-link hygiene)', async () => {
    const c = await caller(owner);
    await c.vendorPortal.updateSocialLinks({ instagram: '', tiktok: '' });
    const store = await c.vendorPortal.myStore();
    const links = store.socialLinks as Record<string, string>;
    expect(links.instagram).toBeUndefined();
    expect(links.tiktok).toBeUndefined();
    expect(links.x).toBe('https://x.com/galaxybeauty'); // untouched
  });

  it('is ownership-guarded (non-vendors get NOT_FOUND)', async () => {
    const otherU = await prisma.user.create({ data: buildUser() });
    createdUserIds.push(otherU.id);
    const other = await caller({ id: otherU.id, role: 'CUSTOMER', email: otherU.email });
    await expect(
      other.vendorPortal.updateSocialLinks({ facebook: 'https://facebook.com/x' }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});
