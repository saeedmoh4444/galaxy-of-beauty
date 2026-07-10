import { TRPCError } from '@trpc/server';
import { prisma, Prisma } from '@galaxy/db';
import {
  router,
  protectedProcedure,
  technicianProcedure,
} from '../trpc';
import {
  walletWithdrawSchema,
  walletTransactionQuerySchema,
} from '../validators/payment';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Minimum wallet balance required before any withdrawal can be made. */
const MIN_WITHDRAWAL_BALANCE = 200;
/** Fee percentage applied to each withdrawal (5 %). */
const WITHDRAWAL_FEE_RATE = 0.05;

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
  withdraw: technicianProcedure
    .input(walletWithdrawSchema)
    .mutation(async ({ ctx, input }) => {
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
});
