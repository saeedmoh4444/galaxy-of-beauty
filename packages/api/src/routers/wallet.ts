import { TRPCError } from '@trpc/server';
import type { Prisma } from '@galaxy/db';
import { prisma } from '@galaxy/db';
import { MIN_WITHDRAWAL_BALANCE, WITHDRAWAL_FEE_RATE } from '@galaxy/shared';
import { z } from 'zod';
import { router, protectedProcedure, customerProcedure, technicianProcedure } from '../trpc';
import { walletWithdrawSchema, walletTransactionQuerySchema } from '../validators/payment';

/**
 * Return the user's wallet, creating one if it does not yet exist.
 */
async function ensureWallet(userId: number) {
  let wallet = await prisma.wallet.findUnique({
    where: { userId },
  });
  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: { userId },
    });
  }
  return wallet;
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export const walletRouter = router({
  // -----------------------------------------------------------------------
  // getBalance — Current user's wallet summary
  // -----------------------------------------------------------------------
  getBalance: protectedProcedure.query(async ({ ctx }) => {
    try {
      const wallet = await ensureWallet(ctx.user.id);

      return {
        id: wallet.id,
        balance: wallet.balance,
        bonusBalance: wallet.bonusBalance,
        totalBalance: Number(wallet.balance) + Number(wallet.bonusBalance),
      };
    } catch (err) {
      if (err instanceof TRPCError) throw err;
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve wallet balance',
        cause: err,
      });
    }
  }),

  // -----------------------------------------------------------------------
  // getTransactions — Paginated wallet transaction history
  // -----------------------------------------------------------------------
  getTransactions: protectedProcedure
    .input(walletTransactionQuerySchema)
    .query(async ({ ctx, input }) => {
      try {
        const wallet = await ensureWallet(ctx.user.id);

        const where: Prisma.WalletTransactionWhereInput = {
          walletId: wallet.id,
        };
        if (input.type) (where as Record<string, unknown>).type = input.type;
        if (input.source) (where as Record<string, unknown>).source = input.source;

        const [transactions, total] = await Promise.all([
          prisma.walletTransaction.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (input.page - 1) * input.limit,
            take: input.limit,
          }),
          prisma.walletTransaction.count({ where }),
        ]);

        return {
          transactions,
          pagination: {
            page: input.page,
            limit: input.limit,
            total,
            totalPages: Math.ceil(total / input.limit),
          },
        };
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve wallet transactions',
          cause: err,
        });
      }
    }),

  // -----------------------------------------------------------------------
  // withdraw — Technician requests a payout from their wallet
  // -----------------------------------------------------------------------
  withdraw: technicianProcedure.input(walletWithdrawSchema).mutation(async ({ ctx, input }) => {
    try {
      // 1. Ensure wallet exists and check minimum balance
      const wallet = await ensureWallet(ctx.user.id);

      if (Number(wallet.balance) < MIN_WITHDRAWAL_BALANCE) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: `Minimum wallet balance of ${MIN_WITHDRAWAL_BALANCE} SAR required to withdraw. Current balance: ${Number(wallet.balance).toFixed(2)} SAR`,
        });
      }

      // 2. Check minimum withdrawal amount (100 SAR — validated by zod,
      //    but double-check in case the schema rules change)
      if (input.amount < 100) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Minimum withdrawal amount is 100 SAR',
        });
      }

      // 3. Check sufficient balance
      if (Number(wallet.balance) < input.amount) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: `Insufficient balance. Available: ${Number(wallet.balance).toFixed(2)} SAR, Requested: ${input.amount} SAR`,
        });
      }

      // 4. Calculate fee and net amount
      const fee = Math.round(input.amount * WITHDRAWAL_FEE_RATE * 100) / 100;
      const netAmount = input.amount - fee;

      // 5. Deduct from wallet balance
      await prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: input.amount } },
      });

      // 6. Create wallet transaction (DEBIT, WITHDRAWAL)
      const transaction = await prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'DEBIT',
          source: 'WITHDRAWAL',
          amount: input.amount,
          description: `Withdrawal of ${input.amount} SAR (fee: ${fee} SAR, net: ${netAmount} SAR)`,
          idempotencyKey: input.idempotencyKey,
        },
      });

      // 7. Create Payout record (PENDING)
      await prisma.payout.create({
        data: {
          technicianId: ctx.user.id,
          periodStart: new Date(),
          periodEnd: new Date(),
          amount: netAmount,
          fee,
          status: 'PENDING',
          reference: null,
        },
      });

      return transaction;
    } catch (err) {
      if (err instanceof TRPCError) throw err;
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to process withdrawal',
        cause: err,
      });
    }
  }),

  // -----------------------------------------------------------------------
  // topUp — Customer adds funds to their wallet
  // -----------------------------------------------------------------------
  topUp: customerProcedure
    .input(
      z.object({
        amount: z.number().min(10).max(5000),
        idempotencyKey: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check idempotency
      const existing = await prisma.walletTransaction.findFirst({
        where: { idempotencyKey: input.idempotencyKey },
      });
      if (existing) {
        const wallet = await prisma.wallet.findUnique({ where: { userId: ctx.user.id } });
        return { balance: wallet?.balance ?? 0, message: 'Already processed' };
      }

      const wallet = await prisma.wallet.upsert({
        where: { userId: ctx.user.id },
        create: { userId: ctx.user.id, balance: input.amount },
        update: { balance: { increment: input.amount } },
      });

      await prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'CREDIT',
          source: 'PLATFORM_FEE_SHARE',
          amount: input.amount,
          description: 'شحن رصيد',
          idempotencyKey: input.idempotencyKey,
        },
      });

      return { balance: Number(wallet.balance), message: 'تم شحن الرصيد بنجاح' };
    }),
});
