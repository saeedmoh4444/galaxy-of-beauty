import { z } from 'zod';
import { customerProcedure, publicProcedure, router } from '../trpc';

export interface BnATransformation { id: number; userId: number; userName: string; beforeUrl: string; afterUrl: string; serviceType: string; technicianName: string; description: string; likes: number; createdAt: string; }
type Transformation = BnATransformation;
const gallery: Transformation[] = [];
let galId = 1;

const SAMPLE = [
  { id: galId++, userId: 1, userName: 'سارة', beforeUrl: '', afterUrl: '', serviceType: 'makeup', technicianName: 'نورة العمري', description: 'مكياج سهرة — الفرق واضح!', likes: 245, createdAt: '2026-07-15T10:00:00Z' },
  { id: galId++, userId: 2, userName: 'مريم', beforeUrl: '', afterUrl: '', serviceType: 'skincare', technicianName: 'د. ليلى القحطاني', description: 'روتين عناية ٣ أشهر — بشرتي تحسنت كثيراً', likes: 189, createdAt: '2026-07-10T08:00:00Z' },
  { id: galId++, userId: 3, userName: 'هند', beforeUrl: '', afterUrl: '', serviceType: 'hair', technicianName: 'سارة الحربي', description: 'صبغة وتصفيف — شعر صحي ولامع', likes: 312, createdAt: '2026-07-08T14:00:00Z' },
  { id: galId++, userId: 4, userName: 'نورة', beforeUrl: '', afterUrl: '', serviceType: 'nails', technicianName: 'هند المطيري', description: 'مانيكير جل — يدي أجمل بكثير', likes: 156, createdAt: '2026-07-05T12:00:00Z' },
];
SAMPLE.forEach((s) => gallery.push(s));

export const beforeAfterRouter = router({
  feed: publicProcedure.input(z.object({ page: z.number().default(1), limit: z.number().default(12) })).query(async ({ input }) => {
    const start = (input.page - 1) * input.limit;
    return { items: gallery.slice(start, start + input.limit), total: gallery.length };
  }),
  submit: customerProcedure
    .input(z.object({ beforeUrl: z.string().url(), afterUrl: z.string().url(), serviceType: z.string(), technicianName: z.string(), description: z.string().max(300) }))
    .mutation(async ({ ctx, input }) => {
      const t: Transformation = { id: galId++, userId: ctx.user.id, userName: ctx.user.email, ...input, likes: 0, createdAt: new Date().toISOString() };
      gallery.unshift(t);
      return t;
    }),
});
