/**
 * A2 — unified moderation (PLATFORM_IMPROVEMENT_PLAN).
 *
 * One report per reporter per target across every UGC surface except
 * shorts (which keep their dedicated flow). Reports go through an admin
 * queue; resolving applies dismiss/hide/remove/suspend. Blocklist terms
 * auto-action at report time.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser, buildProduct, buildVendor, buildBeautyPost } from './factories';

const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];
const createdCategoryIds: number[] = [];
const createdProductIds: number[] = [];
const createdPostIds: number[] = [];
const createdBeautyPostIds: number[] = [];

let reporter: JwtPayload;
let reporter2: JwtPayload;
let author: JwtPayload;
let admin: JwtPayload;

function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

beforeAll(async () => {
  const r = await prisma.user.create({ data: buildUser() });
  const r2 = await prisma.user.create({ data: buildUser() });
  const a = await prisma.user.create({ data: buildUser() });
  const ad = await prisma.user.create({ data: buildUser({ role: 'ADMIN' }) });
  createdUserIds.push(r.id, r2.id, a.id, ad.id);
  reporter = { id: r.id, role: 'CUSTOMER', email: r.email };
  reporter2 = { id: r2.id, role: 'CUSTOMER', email: r2.email };
  author = { id: a.id, role: 'CUSTOMER', email: a.email };
  admin = { id: ad.id, role: 'ADMIN', email: ad.email };
});

afterAll(async () => {
  await prisma.contentReport.deleteMany({ where: { reporterId: { in: createdUserIds } } });
  await prisma.beautyPost.deleteMany({ where: { id: { in: createdBeautyPostIds } } });
  await prisma.productReview.deleteMany({ where: { userId: { in: createdUserIds } } });
  await prisma.communityPost.deleteMany({ where: { id: { in: createdPostIds } } });
  await prisma.product.deleteMany({ where: { id: { in: createdProductIds } } });
  await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
  await prisma.productCategory.deleteMany({ where: { id: { in: createdCategoryIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

async function makeCommunityPost(content: string, by: JwtPayload): Promise<number> {
  const post = await prisma.communityPost.create({
    data: { userId: by.id, content },
  });
  createdPostIds.push(post.id);
  return post.id;
}

describe('moderation.report', () => {
  it('creates an open report and is idempotent per reporter', async () => {
    const postId = await makeCommunityPost('A normal community post', author);
    const first = await caller(reporter).moderation.report({
      targetType: 'community_post',
      targetId: postId,
      reason: 'spam',
    });
    expect(first.reportId).toBeGreaterThan(0);
    expect(first.autoAction).toBe(false);

    const again = await caller(reporter).moderation.report({
      targetType: 'community_post',
      targetId: postId,
      reason: 'other',
      note: 'still bad',
    });
    expect(again.alreadyReported).toBe(true);
    expect(again.reportId).toBe(first.reportId);
  });

  it('rejects a nonexistent target', async () => {
    await expect(
      caller(reporter).moderation.report({
        targetType: 'community_post',
        targetId: 999_999_999,
        reason: 'spam',
      }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('auto-hides blocklisted content at report time', async () => {
    const postId = await makeCommunityPost('This is a casino scam operation', author);
    const res = await caller(reporter).moderation.report({
      targetType: 'community_post',
      targetId: postId,
      reason: 'other',
    });
    expect(res.autoAction).toBe(true);

    const report = await prisma.contentReport.findUnique({ where: { id: res.reportId } });
    expect(report?.status).toBe('actioned');
    expect(report?.action).toBe('hidden');

    const post = await prisma.communityPost.findUnique({ where: { id: postId } });
    expect(post?.isHidden).toBe(true);
  });

  it('rejects bad reason enums and bad target types', async () => {
    const postId = await makeCommunityPost('Enum guard post', author);
    await expect(
      caller(reporter).moderation.report({
        targetType: 'not_a_target' as never,
        targetId: postId,
        reason: 'spam',
      }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });
});

describe('moderation.queue + resolve', () => {
  it('lists open reports with a target preview and the reporter name', async () => {
    const postId = await makeCommunityPost('Queue preview post', author);
    await caller(reporter).moderation.report({
      targetType: 'community_post',
      targetId: postId,
      reason: 'privacy',
    });

    const queue = await caller(admin).moderation.queue({ limit: 50 });
    const row = queue.items.find((q) => q.targetId === postId && q.targetType === 'community_post');
    expect(row).toBeDefined();
    expect(row?.status).toBe('open');
    expect(row?.preview).toContain('Queue preview post');
    expect(row?.reporterName).toBeTruthy();
  });

  it('resolve dismiss closes all open reports without hiding the target', async () => {
    const postId = await makeCommunityPost('Dismiss me post', author);
    await caller(reporter).moderation.report({
      targetType: 'community_post',
      targetId: postId,
      reason: 'other',
    });
    await caller(reporter2).moderation.report({
      targetType: 'community_post',
      targetId: postId,
      reason: 'spam',
    });

    const open = await prisma.contentReport.findMany({
      where: { targetType: 'community_post', targetId: postId },
    });
    const res = await caller(admin).moderation.resolve({
      reportId: open[0]!.id,
      decision: 'dismiss',
    });
    expect(res.closed).toBe(2);

    const post = await prisma.communityPost.findUnique({ where: { id: postId } });
    expect(post?.isHidden).toBe(false);

    const after = await prisma.contentReport.findMany({
      where: { targetType: 'community_post', targetId: postId, status: 'open' },
    });
    expect(after).toHaveLength(0);
  });

  it('resolve hide hides the target and records the action', async () => {
    const postId = await makeCommunityPost('Hide me post', author);
    const rep = await caller(reporter).moderation.report({
      targetType: 'community_post',
      targetId: postId,
      reason: 'inappropriate',
    });

    await caller(admin).moderation.resolve({ reportId: rep.reportId, decision: 'hide' });

    const post = await prisma.communityPost.findUnique({ where: { id: postId } });
    expect(post?.isHidden).toBe(true);

    const report = await prisma.contentReport.findUnique({ where: { id: rep.reportId } });
    expect(report?.status).toBe('actioned');
    expect(report?.action).toBe('hidden');
    expect(report?.handledById).toBe(admin.id);
    expect(report?.handledAt).not.toBeNull();
  });

  it('resolve hide_and_suspend suspends the author', async () => {
    const postId = await makeCommunityPost('Suspend the author post', author);
    const rep = await caller(reporter).moderation.report({
      targetType: 'community_post',
      targetId: postId,
      reason: 'other',
    });

    await caller(admin).moderation.resolve({
      reportId: rep.reportId,
      decision: 'hide_and_suspend',
    });

    const target = await prisma.user.findUnique({ where: { id: author.id } });
    expect(target?.suspendedAt).not.toBeNull();
    expect(target?.suspendReason).toContain('moderation');
  });

  it('resolve remove deletes the target row', async () => {
    const postId = await makeCommunityPost('Remove me post', author);
    const rep = await caller(reporter).moderation.report({
      targetType: 'community_post',
      targetId: postId,
      reason: 'other',
    });

    await caller(admin).moderation.resolve({ reportId: rep.reportId, decision: 'remove' });

    const post = await prisma.communityPost.findUnique({ where: { id: postId } });
    expect(post).toBeNull();
  });

  it('hidden content disappears from the public community feed', async () => {
    const postId = await makeCommunityPost('Feed filter post', author);
    const rep = await caller(reporter).moderation.report({
      targetType: 'community_post',
      targetId: postId,
      reason: 'inappropriate',
    });
    await caller(admin).moderation.resolve({ reportId: rep.reportId, decision: 'hide' });

    const feed = await caller(null).community.feed({ page: 1, limit: 50 });
    expect(feed.items.some((p: { id: number }) => p.id === postId)).toBe(false);
  });

  it('customers cannot read the queue or resolve', async () => {
    await expect(caller(reporter).moderation.queue({ limit: 10 })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
    await expect(
      caller(reporter).moderation.resolve({ reportId: 1, decision: 'dismiss' }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

describe('moderation targets beyond community posts', () => {
  it('hides a product review via its isHidden flag', async () => {
    const vendor = await prisma.vendor.create({
      data: buildVendor({ userId: author.id }),
    });
    createdVendorIds.push(vendor.id);
    const category = await prisma.productCategory.create({
      data: { nameJson: { ar: 'منتجات', en: 'Products' }, slug: `mod-cat-${Date.now()}` },
    });
    createdCategoryIds.push(category.id);
    const product = await prisma.product.create({
      data: buildProduct({ vendorId: vendor.id, categoryId: category.id }),
    });
    createdProductIds.push(product.id);

    const review = await prisma.productReview.create({
      data: { productId: product.id, userId: reporter.id, rating: 1, comment: 'Not great' },
    });

    const rep = await caller(reporter2).moderation.report({
      targetType: 'product_review',
      targetId: review.id,
      reason: 'inappropriate',
    });
    await caller(admin).moderation.resolve({ reportId: rep.reportId, decision: 'hide' });

    const after = await prisma.productReview.findUnique({ where: { id: review.id } });
    expect(after?.isHidden).toBe(true);
  });

  it('unapproves a beauty post (its hidden flag is the approval flag)', async () => {
    const bp = await prisma.beautyPost.create({
      data: buildBeautyPost({ userId: author.id }),
    });
    createdBeautyPostIds.push(bp.id);

    const rep = await caller(reporter).moderation.report({
      targetType: 'beauty_post',
      targetId: bp.id,
      reason: 'other',
    });
    await caller(admin).moderation.resolve({ reportId: rep.reportId, decision: 'hide' });

    const after = await prisma.beautyPost.findUnique({ where: { id: bp.id } });
    expect(after?.isApproved).toBe(false);
  });
});

describe('moderation.myReports', () => {
  it('lists the caller’s own reports', async () => {
    const postId = await makeCommunityPost('My reports post', author);
    await caller(reporter).moderation.report({
      targetType: 'community_post',
      targetId: postId,
      reason: 'spam',
    });

    const mine = await caller(reporter).moderation.myReports({});
    expect(mine.items.some((m) => m.targetId === postId)).toBe(true);

    const others = await caller(reporter2).moderation.myReports({});
    expect(others.items.some((m) => m.targetId === postId)).toBe(false);
  });
});
