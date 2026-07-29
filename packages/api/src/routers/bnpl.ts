import { z } from 'zod';
import { customerProcedure, router } from '../trpc';

const BNPL_PROVIDERS = [
  { key: 'tabby', nameAr: 'تابي', nameEn: 'Tabby', emoji: '🐱', description: 'قسمي فاتورتكِ على ٤ دفعات بدون فوائد', maxAmount: 5000, processingFee: 0 },
  { key: 'tamara', nameAr: 'تمارا', nameEn: 'Tamara', emoji: '🌴', description: 'ادفعي بعد ٣٠ يوم أو قسطي على ٣ دفعات', maxAmount: 8000, processingFee: 0 },
];

const ELIGIBILITY = { eligible: true, maxAmount: 5000, minAmount: 100, providers: BNPL_PROVIDERS };

export const bnplRouter = router({
  providers: customerProcedure.query(() => BNPL_PROVIDERS),
  eligibility: customerProcedure.query(() => ELIGIBILITY),
  createPlan: customerProcedure
    .input(z.object({ amount: z.number().min(100).max(8000), provider: z.enum(['tabby', 'tamara']), installments: z.number().min(3).max(4).default(4) }))
    .mutation(async ({ input }) => {
      const monthlyPayment = Math.round((input.amount / input.installments) * 100) / 100;
      return { approved: true, provider: input.provider, totalAmount: input.amount, installments: input.installments, monthlyPayment, firstPayment: monthlyPayment, remainingPayments: input.installments - 1, schedule: Array.from({ length: input.installments }, (_, i) => ({ month: i + 1, amount: monthlyPayment, dueDate: new Date(Date.now() + (i + 1) * 30 * 86400000).toISOString().slice(0, 10) })) };
    }),
});
