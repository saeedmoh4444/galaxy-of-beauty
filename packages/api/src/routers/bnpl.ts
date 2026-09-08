import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import type { Prisma } from '@galaxy/db';
import {
  BNPL_MIN_AMOUNT,
  BNPL_MAX_AMOUNT,
  BNPL_MIN_INSTALLMENTS,
  BNPL_MAX_INSTALLMENTS,
  MS_PER_30_DAYS,
} from '@galaxy/shared';
import { customerProcedure, router } from '../trpc';

const db = prisma;

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
    .mutation(async ({ ctx, input }) => {
      const monthlyPayment = Math.round((input.amount / input.installments) * 100) / 100;
      const schedule = Array.from({ length: input.installments }, (_, i) => ({
        month: i + 1,
        amount: monthlyPayment,
        dueDate: new Date(Date.now() + (i + 1) * MS_PER_30_DAYS).toISOString().slice(0, 10),
        paid: false,
      }));

      // E4b — persist the plan (previously computed and discarded).
      const plan = await db.bnplPlan.create({
        data: {
          userId: ctx.user.id,
          provider: input.provider,
          totalAmount: input.amount,
          installments: input.installments,
          monthlyPayment,
          schedule,
        },
      });

      return {
        planId: plan.id,
        approved: true,
        provider: input.provider,
        totalAmount: input.amount,
        installments: input.installments,
        monthlyPayment,
        firstPayment: monthlyPayment,
        remainingPayments: input.installments - 1,
        schedule,
      };
    }),

  // E4b — the user's installment plans (active first, newest first).
  myPlans: customerProcedure.query(({ ctx }) =>
    db.bnplPlan.findMany({
      where: { userId: ctx.user.id },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    }),
  ),

  // E4b — advance one installment; completes the plan on the last payment.
  markPaid: customerProcedure
    .input(z.object({ planId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const plan = await db.bnplPlan.findFirst({
        where: { id: input.planId, userId: ctx.user.id },
      });
      if (!plan) throw new TRPCError({ code: 'NOT_FOUND', message: 'plan not found' });
      if (plan.status !== 'ACTIVE') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'plan is not active' });
      }

      const schedule = (plan.schedule as Array<Record<string, unknown>>).map((entry, i) =>
        i === plan.paidCount ? { ...entry, paid: true } : entry,
      ) as unknown as Prisma.InputJsonValue;
      const paidCount = plan.paidCount + 1;
      const status = paidCount >= plan.installments ? 'COMPLETED' : 'ACTIVE';

      const updated = await db.bnplPlan.update({
        where: { id: plan.id },
        data: { schedule, paidCount, status },
      });
      return {
        planId: updated.id,
        status: updated.status,
        paidCount: updated.paidCount,
        remainingPayments: updated.installments - updated.paidCount,
        schedule: updated.schedule,
      };
    }),
});
