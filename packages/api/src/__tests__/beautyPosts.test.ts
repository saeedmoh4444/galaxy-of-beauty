/**
 * beautyPosts router tests — 2.5 Social Commerce. Shoppable posts: create
 * with validated tags, feed enrichment (author kycStatus = verified badge,
 * likedByMe, tag summaries), like toggle with denormalized counter,
 * comments, engagement rows, admin curation.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { buildUser, buildVendor, buildProduct, buildBeautyPost } from './factories';
import type { JwtPayload } from '../lib/jwt';

let customer: JwtPayload;
let admin: JwtPayload;
let verifiedTech: JwtPayload;
let productId: number;
let serviceId: number;
let postId: number;

const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];
const createdProductIds: number[] = [];
const createdCategoryIds: number[] = [];
const createdServiceIds: number[] = [];
const createdPostIds: number[] = [];

async function caller(u: JwtPayload | null) {
  return (appRouter as any).createCaller({ user: u, ip: '127.0.0.1' });
}

beforeAll(async () => {
  const c = await prisma.user.create({ data: buildUser({ role: 'CUSTOMER' }) });
  const a = await prisma.user.create({ data: buildUser({ role: 'ADMIN' }) });
  const t = await prisma.user.create({ data: buildUser({ role: 'TECHNICIAN' }) });
  createdUserIds.push(c.id, a.id, t.id);
  customer = { id: c.id, role: 'CUSTOMER', email: c.email };
  admin = { id: a.id, role: 'ADMIN', email: a.email };
  verifiedTech = { id: t.id, role: 'TECHNICIAN', email: t.email };
  await prisma.technician.create({ data: { userId: t.id, city: 'الرياض', kycStatus: 'VERIFIED' } });

  // Product under the seeded makeup category (fallback-create).
  let cat = await prisma.productCategory.findUnique({ where: { slug: 'product-makeup' } });
  let makeupCatId = cat?.id;
  if (!cat) {
    const created = await prisma.productCategory.create({
      data: { nameJson: { ar: 'المكياج', en: 'Makeup' }, slug: 'product-makeup' },
    });
    createdCategoryIds.push(created.id);
    makeupCatId = created.id;
  }
  const vendor = await prisma.vendor.create({ data: buildVendor({ userId: c.id }) });
  createdVendorIds.push(vendor.id);
  const product = await prisma.product.create({
    data: buildProduct({
      vendorId: vendor.id,
      categoryId: makeupCatId!,
      nameJson: { ar: 'أساس سيلك', en: 'Silk Foundation' },
    }),
  });
  productId = product.id;
  createdProductIds.push(product.id);

  // Service under a fresh category (unique slug).
  const svcCat = await prisma.category.create({
    data: {
      nameJson: { ar: 'مكياج الاختبار', en: 'Test Makeup' },
      slug: `beauty-posts-test-${Date.now()}`,
      iconUrl: '',
    },
  });
  createdCategoryIds.push(svcCat.id);
  const svc = await prisma.service.create({
    data: {
      categoryId: svcCat.id,
      titleJson: { ar: 'مكياج سهرة', en: 'Evening Makeup' },
      descriptionJson: { ar: 'وصف', en: 'Desc' },
      basePrice: 250,
      durationMin: 90,
      isActive: true,
    },
  });
  serviceId = svc.id;
  createdServiceIds.push(svc.id);
}, 20000);

afterAll(async () => {
  await prisma.beautyPostEngagement.deleteMany({ where: { postId: { in: createdPostIds } } });
  await prisma.beautyPostComment.deleteMany({ where: { postId: { in: createdPostIds } } });
  await prisma.beautyPostLike.deleteMany({ where: { postId: { in: createdPostIds } } });
  await prisma.beautyPost.deleteMany({ where: { id: { in: createdPostIds } } });
  await prisma.product.deleteMany({ where: { id: { in: createdProductIds } } });
  await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
  await prisma.service.deleteMany({ where: { id: { in: createdServiceIds } } });
  await prisma.category.deleteMany({ where: { id: { in: createdCategoryIds } } });
  await prisma.technician.deleteMany({ where: { userId: { in: createdUserIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

describe('beautyPosts.create', () => {
  it('rejects tags that reference unknown products', async () => {
    await expect(
      (await caller(customer)).beautyPosts.create({
        imageUrl: 'https://example.com/a.jpg',
        productIds: [999999999],
        serviceIds: [],
      }),
    ).rejects.toThrow();
  });

  it('creates a post with validated tags stored in tagsJson', async () => {
    const post = await (
      await caller(customer)
    ).beautyPosts.create({
      imageUrl: 'https://example.com/look.jpg',
      caption: 'إطلالتي اليوم ✨',
      productIds: [productId],
      serviceIds: [serviceId],
    });
    createdPostIds.push(post.id);
    postId = post.id;
    expect(post.tagsJson).toMatchObject({ products: [productId], services: [serviceId] });
    expect(post.featured).toBe(false);
    expect(post.isApproved).toBe(true);
  });
});

describe('beautyPosts feed + like', () => {
  it('enriches feed with author kycStatus, tag summaries and likedByMe', async () => {
    const feed = await (await caller(customer)).beautyPosts.feed({ limit: 50 });
    const mine = feed.find((p: { id: number }) => p.id === postId);
    expect(mine).toBeDefined();
    expect(mine!.author.name).toBeTruthy();
    // Tag summaries resolve to readable objects.
    expect(mine!.tags.products.length).toBe(1);
    expect(mine!.tags.products[0]).toHaveProperty('nameJson');
    expect(mine!.tags.services.length).toBe(1);
    // This author is a customer → no verified badge payload.
    expect(mine!.author.kycStatus).toBeNull();
  });

  it('carries kycStatus VERIFIED for technician authors', async () => {
    const techPost = await (
      await caller(verifiedTech)
    ).beautyPosts.create({
      imageUrl: 'https://example.com/tech.jpg',
      productIds: [],
      serviceIds: [serviceId],
    });
    createdPostIds.push(techPost.id);
    const feed = await (await caller(null)).beautyPosts.feed({ limit: 50 });
    const found = feed.find((p: { id: number }) => p.id === techPost.id);
    expect(found!.author.kycStatus).toBe('VERIFIED');
  });

  it('toggles likes with a consistent denormalized counter', async () => {
    const liked = await (await caller(customer)).beautyPosts.like({ postId });
    expect(liked).toEqual({ liked: true, likes: 1 });
    const unliked = await (await caller(customer)).beautyPosts.like({ postId });
    expect(unliked).toEqual({ liked: false, likes: 0 });
  });
});

describe('beautyPosts comments', () => {
  it('adds and lists comments with author names', async () => {
    await (await caller(customer)).beautyPosts.addComment({ postId, content: 'رائع جداً 😍' });
    const comments = await (await caller(null)).beautyPosts.comments({ postId });
    expect(comments.length).toBe(1);
    expect(comments[0].content).toBe('رائع جداً 😍');
    expect(comments[0].author.name).toBeTruthy();
  });
});

describe('beautyPosts engagement + curation', () => {
  it('records tag clicks as engagement rows', async () => {
    await (
      await caller(customer)
    ).beautyPosts.tagClick({
      postId,
      kind: 'product_click',
      targetId: productId,
    });
    const rows = await prisma.beautyPostEngagement.findMany({
      where: { postId, kind: 'product_click' },
    });
    expect(rows.length).toBe(1);
    expect(rows[0]!.targetId).toBe(productId);
  });

  it('viewed increments the counter', async () => {
    await (await caller(null)).beautyPosts.viewed({ postId });
    const post = await prisma.beautyPost.findUnique({ where: { id: postId } });
    expect(post!.views).toBeGreaterThanOrEqual(1);
  });

  it('setFeatured is admin-only and drives the featured list', async () => {
    await expect(
      (await caller(customer)).beautyPosts.setFeatured({ postId, featured: true }),
    ).rejects.toThrow();
    await (await caller(admin)).beautyPosts.setFeatured({ postId, featured: true });
    const featured = await (await caller(null)).beautyPosts.featured();
    expect(featured.some((p: { id: number }) => p.id === postId)).toBe(true);
  });
});
