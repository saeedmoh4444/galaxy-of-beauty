import { prisma } from '@galaxy/db';
import { SMALL_PAGE_SIZE } from '@galaxy/shared';
import { publicProcedure, router } from '../trpc';

export const featuredTechRouter = router({
  current: publicProcedure.query(async () => {
    const top = await prisma.technician.findFirst({
      orderBy: { ratingAvg: 'desc' },
      include: { user: { select: { name: true } } },
    });
    if (!top)
      return {
        id: 0,
        name: '',
        titleAr: '',
        emoji: '',
        bio: '',
        highlights: [],
        services: [],
        interview: { q: '', a: '' },
        weekOf: '',
      };
    const completedBookings = await prisma.booking.count({
      where: { technicianId: top.userId, status: 'COMPLETED' },
    });
    return {
      id: top.id,
      name: top.user.name,
      titleAr: 'خبيرة تجميل',
      emoji: '',
      bio: `${top.user.name} خبيرة تجميل سعودية معتمدة بتقييم ${Number(top.ratingAvg).toFixed(1)} `,
      highlights: [
        `تقييم ${Number(top.ratingAvg).toFixed(1)} `,
        `+${completedBookings} حجز مكتمل`,
        top.city || '',
      ],
      services: [],
      interview: { q: 'ما سر جمالكِ؟', a: 'العناية اليومية والاهتمام بالتفاصيل' },
      weekOf: new Date().toISOString().slice(0, 10),
    };
  }),

  past: publicProcedure.query(async () => {
    const techs = await prisma.technician.findMany({
      take: SMALL_PAGE_SIZE,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } } },
    });
    return techs.slice(1).map((t) => ({
      id: t.id,
      name: t.user.name,
      titleAr: 'خبيرة تجميل',
      emoji: '',
      weekOf: t.createdAt.toISOString().slice(0, 10),
    }));
  }),
});
