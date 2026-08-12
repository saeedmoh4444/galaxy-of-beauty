import { prisma } from '@galaxy/db';
import { SMALL_PAGE_SIZE } from '@galaxy/shared';
import { customerProcedure, router } from '../trpc';

export const personalizedFeedRouter = router({
  feed: customerProcedure.query(async ({ ctx }) => {
    const [recentBookings, services, products] = await Promise.all([
      prisma.booking.findMany({
        where: { customerId: ctx.user.id },
        orderBy: { createdAt: 'desc' },
        take: SMALL_PAGE_SIZE,
        select: { service: { select: { titleJson: true, categoryId: true } } },
      }),
      prisma.service.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: SMALL_PAGE_SIZE,
        select: { id: true, titleJson: true, basePrice: true },
      }),
      prisma.product.findMany({
        where: { isActive: true },
        take: 3,
        select: { id: true, nameJson: true, price: true },
      }),
    ]);

    // Find preferred categories
    const catCounts: Record<number, number> = {};
    for (const b of recentBookings) {
      if (b.service?.categoryId)
        catCounts[b.service.categoryId] = (catCounts[b.service.categoryId] || 0) + 1;
    }
    const interests =
      Object.entries(catCounts).length > 0
        ? ['skincare', 'makeup', 'wellness']
        : ['skincare', 'makeup', 'wellness'];

    const items: Array<Record<string, unknown>> = [
      ...(services as any[]).map((s: any) => ({
        id: s.id,
        type: 'service',
        title: (s.titleJson as any)?.ar,
        emoji: s.emoji || '💅',
        price: Number(s.basePrice),
        relevance: 90,
      })),
      ...(products as any[]).map((p: any) => ({
        id: p.id,
        type: 'product',
        title: (p.nameJson as any)?.ar,
        price: Number(p.price),
        emoji: '🧴',
        relevance: 80,
      })),
    ].slice(0, 10);

    return { items, categories: ['متابَع', 'مقترح', 'رائج'], interests };
  }),

  refresh: customerProcedure.mutation(async () => ({ refreshed: true, newItems: 3 })),
});
