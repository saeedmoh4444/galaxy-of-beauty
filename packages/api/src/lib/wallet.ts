import { prisma } from '@galaxy/db';

/**
 * Return the user's wallet, creating one if it does not yet exist.
 *
 * Shared by the wallet router and the money workers: registration creates a
 * wallet for every real user (auth.ts), but factory-made or legacy rows may
 * not have one — a cashback job for such a user must self-heal, not burn its
 * attempts into the failed set (the "Wallet not found for user N" incident).
 *
 * W1 (audit 2026-11-11): a concurrent first-ever call may create the wallet
 * between the find and the create — refetch on P2002 instead of 500.
 */
export async function ensureWallet(userId: number) {
  let wallet = await prisma.wallet.findUnique({
    where: { userId },
  });
  if (!wallet) {
    try {
      wallet = await prisma.wallet.create({
        data: { userId },
      });
    } catch (err) {
      if ((err as { code?: string }).code !== 'P2002') throw err;
      wallet = await prisma.wallet.findUniqueOrThrow({ where: { userId } });
    }
  }
  return wallet;
}
