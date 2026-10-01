import { z } from 'zod';
import { customerProcedure, router } from '../trpc';

const EXPRESS_SERVICES = [
  { emoji: '💄', name: 'مكياج سريع', time: '30 دقيقة', price: 150 },
  { emoji: '💇', name: 'تسريحة سهرة', time: '20 دقيقة', price: 100 },
  { emoji: '💅', name: 'مانيكير سريع', time: '20 دقيقة', price: 80 },
];

export const nightOutRouter = router({
  services: customerProcedure.query(() => ({
    available: true,
    services: EXPRESS_SERVICES,
    message: 'خدمات سريعة لليلتكِ الخاصة',
  })),

  book: customerProcedure
    .input(z.object({ serviceIndex: z.number().int().min(0).max(2), time: z.string().optional() }))
    .mutation(async ({ input }) => {
      const service = EXPRESS_SERVICES[input.serviceIndex];
      if (!service) throw new Error('Invalid service');
      // Express appointments are not wired to a booking pipeline — never
      // confirm a booking that was not created.
      return {
        booked: false,
        status: 'NOT_CONFIGURED',
        reason: 'BOOKING_NOT_CREATED',
        service: service.name,
      };
    }),
});
