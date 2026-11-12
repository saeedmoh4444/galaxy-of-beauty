import { TRPCError } from '@trpc/server';
import type { Prisma } from '@galaxy/db';
import { prisma } from '@galaxy/db';
import {
  MIN_WITHDRAWAL_BALANCE,
  WITHDRAWAL_FEE_RATE,
  TOP_UP_MIN_AMOUNT,
  TOP_UP_MAX_AMOUNT,
} from '@galaxy/shared';
import { z } from 'zod';
import { router, protectedProcedure, customerMutation, technicianMutation } from '../trpc';
import { walletWithdrawSchema, walletTransactionQuerySchema } from '../validators/payment';

/**
 * Return the user's wallet, creating one if it does not yet exist.
 */
async function ensureWallet(userId: number) {
  let wallet = await prisma.wallet.findUnique({
    where: { userId },
  });
  if (!wallet) {
    try {
      wallet = await prisma.wallet.create({
        data: { userId },
      });
    } catch (err) {
      // W1 (audit 2026-11-11): a concurrent first-ever call created the
      // wallet between the find and the create — refetch instead of 500.
      if ((err as { code?: string }).code !== 'P2002') throw err;
      wallet = await prisma.wallet.findUniqueOrThrow({ where: { userId } });
    }
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
  withdraw: technicianMutation.input(walletWithdrawSchema).mutation(async ({ ctx, input }) => {
    try {
      // 0. Idempotency replay (audit M7): a repeat call with the same key
      // must return the stored transaction — never debit twice. The key is
      // global, so a guessed key must NOT leak another user's transaction:
      // verify ownership before returning anything (W1, audit 2026-11-11).
      const existingTxn = await prisma.walletTransaction.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
      });
      if (existingTxn) {
        const ownerWallet = await prisma.wallet.findUnique({
          where: { id: existingTxn.walletId },
        });
        if (ownerWallet?.userId !== ctx.user.id) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Idempotency key already used',
          });
        }
        return existingTxn;
      }

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

      // 5-7. Debit + ledger + payout in ONE transaction (audit M7 — the
      // three writes were separate: a duplicate idempotency key failed on
      // the unique ledger insert AFTER the balance was already debited,
      // losing funds). The conditional debit also makes a concurrent
      // withdrawal race lose cleanly instead of overdrawing.
      return prisma.$transaction(async (tx) => {
        const debited = await tx.wallet.updateMany({
          where: { id: wallet.id, balance: { gte: input.amount } },
          data: { balance: { decrement: input.amount } },
        });
        if (debited.count === 0) {
          throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message: `Insufficient balance. Available: ${Number(wallet.balance).toFixed(2)} SAR, Requested: ${input.amount} SAR`,
          });
        }

        const transaction = await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: 'DEBIT',
            source: 'WITHDRAWAL',
            amount: input.amount,
            description: `Withdrawal of ${input.amount} SAR (fee: ${fee} SAR, net: ${netAmount} SAR)`,
            idempotencyKey: input.idempotencyKey,
          },
        });

        await tx.payout.create({
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
      });
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
  topUp: customerMutation
    .input(
      z.object({
        amount: z.number().min(TOP_UP_MIN_AMOUNT).max(TOP_UP_MAX_AMOUNT),
        // Opaque key (Stripe pattern): web sends UUIDs, mobile sends `mob_<ts>_<rand>`
        idempotencyKey: z.string().min(8).max(128),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check idempotency — scoped to the caller's own wallet (W1, audit
      // 2026-11-11): a guessed key must not confirm/leak another user's
      // top-up.
      const existing = await prisma.walletTransaction.findFirst({
        where: { idempotencyKey: input.idempotencyKey },
      });
      if (existing) {
        const ownerWallet = await prisma.wallet.findUnique({
          where: { id: existing.walletId },
        });
        if (ownerWallet?.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'CONFLICT', message: 'Idempotency key already used' });
        }
        const wallet = await prisma.wallet.findUnique({ where: { userId: ctx.user.id } });
        return {
          balance: Number(wallet?.balance ?? 0),
          status: existing.status,
          message:
            existing.status === 'COMPLETED' ? 'تم شحن الرصيد بنجاح' : 'طلب الشحن قيد المراجعة',
        };
      }

      // Money-integrity: a direct client mutation must NOT mint spendable
      // balance in production. Record a PENDING intent; the credit lands
      // only through a verified gateway callback. In simulate mode (dev/CI,
      // mirroring the store-checkout discipline) the callback is simulated
      // and the credit completes in the same transaction — the mobile UI's
      // success path is real and testable, production fails closed until a
      // live gateway callback exists.
      const simulate =
        process.env['FATOORAH_SIMULATE'] === 'true' && process.env['NODE_ENV'] !== 'production';
      const wallet = await ensureWallet(ctx.user.id);

      await prisma.$transaction(async (tx) => {
        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: 'CREDIT',
            source: 'TOP_UP',
            amount: input.amount,
            description: 'شحن رصيد',
            idempotencyKey: input.idempotencyKey,
            status: simulate ? 'COMPLETED' : 'PENDING',
            referenceId: simulate ? `SIM-TOPUP-${Date.now()}-${wallet.id}` : null,
          },
        });
        if (simulate) {
          await tx.wallet.update({
            where: { id: wallet.id },
            data: { balance: { increment: input.amount } },
          });
        }
      });

      const refreshed = await prisma.wallet.findUniqueOrThrow({ where: { id: wallet.id } });
      return {
        balance: Number(refreshed.balance),
        status: simulate ? ('COMPLETED' as const) : ('PENDING' as const),
        message: simulate ? 'تم شحن الرصيد بنجاح' : 'طلب الشحن قيد المراجعة',
      };
    }),
});
