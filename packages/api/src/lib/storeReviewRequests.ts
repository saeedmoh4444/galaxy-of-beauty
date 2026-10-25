/**
 * F5 — post-fulfillment review requests (Wave 6). After an order is
 * fulfilled, the customer is asked (once) to review each purchased
 * product. The ReviewRequest unique key (customerId, productId) is the
 * cooldown; an existing ProductReview suppresses the request entirely.
 * Call post-commit and swallow every failure — fulfillment must never
 * fail on a review request.
 */
import { prisma } from '@galaxy/db';
import { notifyUser } from './notify';

export async function requestProductReviews(order: {
  customerId: number;
  vendorId: number;
  items: Array<{ productId: number }>;
}): Promise<void> {
  if (order.items.length === 0) return;

  const productIds = [...new Set(order.items.map((i) => i.productId))];
  const [vendor, reviewed, requested] = await Promise.all([
    prisma.vendor.findUnique({
      where: { id: order.vendorId },
      select: { storeSlug: true },
    }),
    prisma.productReview.findMany({
      where: { userId: order.customerId, productId: { in: productIds } },
      select: { productId: true },
    }),
    prisma.reviewRequest.findMany({
      where: { customerId: order.customerId, productId: { in: productIds } },
      select: { productId: true },
    }),
  ]);

  const done = new Set([...reviewed.map((r) => r.productId), ...requested.map((r) => r.productId)]);
  const pending = productIds.filter((id) => !done.has(id));
  if (pending.length === 0) return;

  const products = await prisma.product.findMany({
    where: { id: { in: pending } },
    select: { id: true, nameJson: true },
  });

  for (const p of products) {
    try {
      await prisma.reviewRequest.create({
        data: { customerId: order.customerId, productId: p.id },
      });
      await notifyUser({
        userId: order.customerId,
        templateKey: 'store_review_request',
        vars: { productName: (p.nameJson as { ar?: string }).ar ?? `#${p.id}` },
        link: vendor ? `/stores/${vendor.storeSlug}` : undefined,
        channels: ['in_app'],
      });
    } catch {
      // Unique-race (another fulfill won) or notify failure — never fail
      // the fulfillment itself.
    }
  }
}
