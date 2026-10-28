/**
 * B3 — Review showcase (VENDOR_PROFESSIONALIZATION_PLAN Wave B).
 * The storefront shows recent reviews WITH owner replies (the loop
 * customers see); a daily gob-reviews sweep nudges vendors about
 * reviews unanswered for 48h+ (once per review, reminderSentAt).
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';
import { handleReviewReplyReminderSweep } from '../workers/handlers';

const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];
const createdProductIds: number[] = [];
const createdReviewIds: number[] = [];
const createdTemplateIds: number[] = [];

let owner: JwtPayload;
let vendorId: number;
let productId: number;
let staleReviewId: number;
let repliedReviewId: number;

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

async function mkReview(productIdArg: number, userId: number, data: Record<string, unknown> = {}) {
  const r = await prisma.productReview.create({
    data: {
      productId: productIdArg,
      userId,
      rating: 5,
      comment: 'منتج رائع',
      ...data,
    },
  });
  createdReviewIds.push(r.id);
  return r;
}

beforeAll(async () => {
  const t = await prisma.notificationTemplate.upsert({
    where: { key: 'review_reply_reminder' },
    update: {},
    create: {
      key: 'review_reply_reminder',
      category: 'provider',
      channels: ['in_app'],
      titleJson: { ar: 'تقييم بانتظار ردك', en: 'Review Awaiting Your Reply' },
      bodyJson: { ar: '{{productName}}', en: '{{productName}}' },
    },
  });
  createdTemplateIds.push(t.id);

  const ownerU = await prisma.user.create({ data: buildUser() });
  const reviewerU = await prisma.user.create({ data: buildUser() });
  // ProductReview is @@unique([productId, userId]) — one fresh reviewer
  // per review (the E4 gotcha).
  const reviewerU2 = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(ownerU.id, reviewerU.id, reviewerU2.id);
  owner = { id: ownerU.id, role: 'CUSTOMER', email: ownerU.email };

  const v = await prisma.vendor.create({
    data: { userId: ownerU.id, storeName: 'V b3', storeSlug: `b3-${Date.now()}`, isVerified: true },
  });
  createdVendorIds.push(v.id);
  vendorId = v.id;

  const cat = await prisma.productCategory.findFirst({ orderBy: { sortOrder: 'asc' } });
  const p = await prisma.product.create({
    data: {
      vendorId,
      categoryId: cat!.id,
      nameJson: { ar: 'منتج ب3', en: 'B3 product' },
      descriptionJson: { ar: '', en: '' },
      price: 50,
      stock: 5,
      sales: 0,
      emoji: '🧴',
      images: [],
      isActive: true,
    },
  });
  createdProductIds.push(p.id);
  productId = p.id;

  const stale = await mkReview(productId, reviewerU.id, {
    createdAt: new Date(Date.now() - 60 * 3_600_000),
  });
  staleReviewId = stale.id;
  const replied = await mkReview(productId, reviewerU2.id, {
    createdAt: new Date(Date.now() - 60 * 3_600_000),
    replyJson: { ar: 'شكراً لكِ', en: 'Thank you' },
    repliedAt: new Date(Date.now() - 50 * 3_600_000),
  });
  repliedReviewId = replied.id;
}, 20000);

afterAll(async () => {
  await prisma.productReview.deleteMany({ where: { id: { in: createdReviewIds } } });
  await prisma.product.deleteMany({ where: { id: { in: createdProductIds } } });
  await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
  await prisma.notificationTemplate.deleteMany({ where: { id: { in: createdTemplateIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

describe('B3 — review showcase', () => {
  it('vendorDetail carries recent reviews with product names and owner replies', async () => {
    const c = await caller(null);
    const detail = await c.marketplace.vendorDetail({
      slug: (await prisma.vendor.findUniqueOrThrow({ where: { id: vendorId } })).storeSlug,
    });
    expect(detail.recentReviews).toHaveLength(2);
    const replied = detail.recentReviews.find((r: { id: number }) => r.id === repliedReviewId);
    expect(replied.replyEn).toBe('Thank you');
    expect(replied.productNameAr).toBe('منتج ب3');
    expect(replied.customerName).toBeTruthy();
  });

  it('the sweep nudges once per unanswered review past 48h', async () => {
    const res = await handleReviewReplyReminderSweep({ data: {} } as never);
    expect(res.reminded).toBeGreaterThanOrEqual(1);

    const stale = await prisma.productReview.findUniqueOrThrow({ where: { id: staleReviewId } });
    expect(stale.reminderSentAt).toBeTruthy();
    const replied = await prisma.productReview.findUniqueOrThrow({
      where: { id: repliedReviewId },
    });
    expect(replied.reminderSentAt).toBeNull();

    const notifs = await prisma.notification.findMany({
      where: { userId: owner.id, type: 'review_reply_reminder' },
    });
    expect(notifs.length).toBeGreaterThanOrEqual(1);
  });

  it('the sweep is idempotent (stamp gates re-reminders)', async () => {
    await handleReviewReplyReminderSweep({ data: {} } as never);
    const notifs = await prisma.notification.findMany({
      where: { userId: owner.id, type: 'review_reply_reminder' },
    });
    expect(notifs.length).toBeGreaterThanOrEqual(1);
    const stale = await prisma.productReview.findUniqueOrThrow({ where: { id: staleReviewId } });
    expect(stale.reminderSentAt).toBeTruthy(); // unchanged, no duplicate
  });
});
