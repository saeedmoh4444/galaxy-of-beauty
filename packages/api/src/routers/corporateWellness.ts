import { z } from 'zod';
import { customerProcedure, publicProcedure, router } from '../trpc';

const PLANS = [
  { id: 'starter', nameAr: 'الباقة الأساسية', nameEn: 'Starter', price: 5000, employees: 10, services: ['مانيكير', 'مساج سريع', 'استشارة عناية'], emoji: '🌱' },
  { id: 'growth', nameAr: 'باقة النمو', nameEn: 'Growth', price: 12000, employees: 50, services: ['مانيكير', 'باديكير', 'مساج', 'تنظيف بشرة', 'استشارة'], emoji: '🌿' },
  { id: 'enterprise', nameAr: 'الباقة الشاملة', nameEn: 'Enterprise', price: 25000, employees: 200, services: ['كل الخدمات', 'يوم سبا', 'ورش عناية', 'مدير حساب'], emoji: '🌳' },
];

const ENQUIRIES: Array<{ id: number; companyName: string; contactName: string; email: string; planId: string; createdAt: string }> = [];

export const corporateWellnessRouter = router({
  plans: publicProcedure.query(() => PLANS),
  enquire: publicProcedure
    .input(z.object({ companyName: z.string().min(1), contactName: z.string().min(1), email: z.string().email(), planId: z.string() }))
    .mutation(async ({ input }) => {
      const enq = { id: ENQUIRIES.length + 1, ...input, createdAt: new Date().toISOString() };
      ENQUIRIES.push(enq);
      return { success: true, message: 'تم استلام طلبكِ وسنتواصل معكِ خلال ٢٤ ساعة' };
    }),
  myEnquiries: customerProcedure.query(async () => ENQUIRIES),
});
