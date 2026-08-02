import { z } from 'zod';
import { DEFAULT_APP_URL } from '@galaxy/shared';
import { customerProcedure, publicProcedure, router } from '../trpc';

const TECHNICIANS_WITH_MENUS = [
  { id: 1, name: 'نورة العمري', slug: 'noora', services: 'مكياج عرايس, مكياج سهرة, استشارة تجميل', phone: '0500000001' },
  { id: 2, name: 'سارة الحربي', slug: 'sara', services: 'تسريحة شعر, صبغة, بروتين', phone: '0500000002' },
];

export const serviceMenuQrRouter = router({
  list: publicProcedure.query(() => TECHNICIANS_WITH_MENUS),
  generate: customerProcedure
    .input(z.object({ technicianId: z.number() }))
    .mutation(async ({ input }) => {
      const tech = TECHNICIANS_WITH_MENUS.find((t) => t.id === input.technicianId);
      if (!tech) throw new Error('الفنية غير موجودة');
      const appUrl = process.env['NEXT_PUBLIC_APP_URL'] || DEFAULT_APP_URL;
      const menuUrl = `${appUrl}/technicians/${tech.slug}/menu`;
      return { technicianName: tech.name, menuUrl, qrData: menuUrl, services: tech.services, phone: tech.phone, shareText: `قائمة خدمات ${tech.name} — ${tech.services}` };
    }),
});
