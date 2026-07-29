import { z } from 'zod';
import { customerProcedure, router } from '../trpc';

const OFFERS = [
  { id: 1, titleAr: 'خصم ٢٠٪ على المساج', salonName: 'سبا النخيل', lat: 24.7136, lng: 46.6753, city: 'الرياض', distance: '٠.٥ كم', expiresIn: '٣ ساعات', emoji: '💆‍♀️' },
  { id: 2, titleAr: 'مانيكير مجاني مع أي خدمة', salonName: 'مركز الجمال', lat: 24.7200, lng: 46.6800, city: 'الرياض', distance: '١.٢ كم', expiresIn: '٥ ساعات', emoji: '💅' },
  { id: 3, titleAr: 'خصم ٣٠٪ على المكياج', salonName: 'استوديو نورة', lat: 24.7100, lng: 46.6700, city: 'الرياض', distance: '٢ كم', expiresIn: 'ساعتين', emoji: '💄' },
];

export const geofenceOffersRouter = router({
  nearby: customerProcedure
    .input(z.object({ lat: z.number().optional(), lng: z.number().optional(), city: z.string().optional() }))
    .query(async ({ input }) => {
      let results = OFFERS;
      if (input.city) results = results.filter((o) => o.city === input.city);
      return results.map((o) => ({ ...o, distance: input.lat ? `${Math.floor(Math.random() * 3) + 0.5} كم` : o.distance }));
    }),
  optIn: customerProcedure.mutation(async () => ({ status: 'OPTED_IN', message: 'سيتم إشعاركِ عند وجود عروض بالقرب منكِ' })),
});
