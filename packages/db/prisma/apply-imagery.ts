/**
 * Apply imagery to an EXISTING database (the same pass the seed runs).
 * Run from packages/db:
 *   pnpm exec tsx prisma/apply-imagery.ts
 *
 * Fills category-matched, diversity-rotated photos (verified-live Unsplash
 * pools from @galaxy/shared/imagery) for every service, category, product
 * and venue that still has an empty image slot. Idempotent — rows that
 * already carry an image are left untouched.
 */
import 'dotenv/config';
import { prisma } from '../src/client';
import { imageFor, resolvePoolKey } from '@galaxy/shared/imagery';

async function main() {
  let svcImaged = 0;
  let catImaged = 0;
  let prodImaged = 0;
  let venueImaged = 0;

  const bareServices = await prisma.service.findMany({
    where: { imageUrl: null },
    include: { category: { select: { slug: true } } },
    orderBy: { id: 'asc' },
  });
  for (const [i, s] of bareServices.entries()) {
    const url = imageFor(resolvePoolKey(s.category.slug), i);
    if (!url) continue;
    await prisma.service.update({ where: { id: s.id }, data: { imageUrl: url } });
    svcImaged += 1;
  }

  const bareCategories = await prisma.category.findMany({
    where: { imageUrl: null },
    orderBy: { id: 'asc' },
  });
  for (const [i, c] of bareCategories.entries()) {
    const url = imageFor(resolvePoolKey(c.slug), i);
    if (!url) continue;
    await prisma.category.update({ where: { id: c.id }, data: { imageUrl: url } });
    catImaged += 1;
  }

  const bareProducts = await prisma.product.findMany({
    where: { images: { isEmpty: true } },
    include: { category: { select: { slug: true } } },
    orderBy: { id: 'asc' },
  });
  for (const [i, p] of bareProducts.entries()) {
    const url = imageFor(resolvePoolKey(p.category.slug), i);
    if (!url) continue;
    await prisma.product.update({ where: { id: p.id }, data: { images: [url] } });
    prodImaged += 1;
  }

  const bareVendors = await prisma.vendor.findMany({
    where: { bannerUrl: null },
    orderBy: { id: 'asc' },
  });
  for (const [i, v] of bareVendors.entries()) {
    const url = imageFor('venues', i);
    if (!url) continue;
    await prisma.vendor.update({ where: { id: v.id }, data: { bannerUrl: url } });
    venueImaged += 1;
  }

  console.log(
    JSON.stringify({
      servicesImaged: svcImaged,
      categoriesImaged: catImaged,
      productsImaged: prodImaged,
      venuesImaged: venueImaged,
    }),
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
