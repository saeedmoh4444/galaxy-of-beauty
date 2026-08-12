import { z } from 'zod';
import {
  BNPL_MIN_AMOUNT,
  BNPL_MAX_AMOUNT,
  BNPL_MIN_INSTALLMENTS,
  BNPL_MAX_INSTALLMENTS,
  MS_PER_30_DAYS,
} from '@galaxy/shared';
import { customerProcedure, router } from '../trpc';

const BNPL_PROVIDERS = [
  {
    key: 'tabby',
    nameAr: 'تابي',
    nameEn: 'Tabby',
    emoji: '',
    description: 'قسمي فاتورتكِ على ٤ دفعات بدون فوائد',
    maxAmount: 5000,
    processingFee: 0,
  },
  {
    key: 'tamara',
    nameAr: 'تمارا',
    nameEn: 'Tamara',
    emoji: '',
    description: 'ادفعي بعد ٣٠ يوم أو قسطي على ٣ دفعات',
    maxAmount: BNPL_MAX_AMOUNT,
    processingFee: 0,
  },
];

const ELIGIBILITY = {
  eligible: true,
  maxAmount: 5000,
  minAmount: BNPL_MIN_AMOUNT,
  providers: BNPL_PROVIDERS,
};

export const bnplRouter = router({
  providers: customerProcedure.query(() => BNPL_PROVIDERS),
  eligibility: customerProcedure.query(() => ELIGIBILITY),
  createPlan: customerProcedure
    .input(
      z.object({
        amount: z.number().min(BNPL_MIN_AMOUNT).max(BNPL_MAX_AMOUNT),
        provider: z.enum(['tabby', 'tamara']),
        installments: z.number().min(BNPL_MIN_INSTALLMENTS).max(BNPL_MAX_INSTALLMENTS).default(4),
      }),
    )
    .mutation(async ({ input }) => {
      const monthlyPayment = Math.round((input.amount / input.installments) * 100) / 100;
      return {
        approved: true,
        provider: input.provider,
        totalAmount: input.amount,
        installments: input.installments,
        monthlyPayment,
        firstPayment: monthlyPayment,
        remainingPayments: input.installments - 1,
        schedule: Array.from({ length: input.installments }, (_, i) => ({
          month: i + 1,
          amount: monthlyPayment,
          dueDate: new Date(Date.now() + (i + 1) * MS_PER_30_DAYS).toISOString().slice(0, 10),
        })),
      };
    }),
});
