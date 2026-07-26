import { Router } from 'express';
import { isAuth, hasRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { walletWithdrawSchema, walletTransactionQuerySchema } from '../validators/payment.js';
import * as walletService from '../services/wallet.js';
import { checkIdempotency, completeIdempotency, releaseIdempotency } from '../utils/idempotency.js';

const router = Router();

/**
 * @route   GET /api/wallet
 * @desc    Get current user's wallet (balance + recent transactions)
 * @access  Authenticated
 */
router.get('/', isAuth, async (req, res, next) => {
  try {
    const wallet = await walletService.getWallet(req.user.userId);
    res.json({
      wallet: {
        id: wallet.id,
        balance: Number(wallet.balance),
        bonusBalance: Number(wallet.bonusBalance),
      },
      recentTransactions: wallet.transactions,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/wallet/transactions
 * @desc    Get wallet transactions with pagination and filters
 * @access  Authenticated
 */
router.get(
  '/transactions',
  isAuth,
  validate({ query: walletTransactionQuerySchema }),
  async (req, res, next) => {
    try {
      const result = await walletService.getWalletTransactions(req.user.userId, req.query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @route   POST /api/wallet/withdraw
 * @desc    Withdraw funds from wallet (technician only)
 * @access  Technician
 */
router.post(
  '/withdraw',
  isAuth,
  hasRole('TECHNICIAN'),
  validate({ body: walletWithdrawSchema }),
  async (req, res, next) => {
    try {
      const idemKey = req.body.idempotencyKey;
      await checkIdempotency(idemKey);

      const result = await walletService.withdrawFromWallet(req.user.userId, req.body.amount);

      await completeIdempotency(idemKey, {
        gross: result.gross,
        fee: result.fee,
        net: result.net,
      });

      res.json({
        message: `Withdrawal of ${result.net} SAR (after ${result.fee} SAR fee) initiated`,
        withdrawal: result,
      });
    } catch (error) {
      if (req.body.idempotencyKey) await releaseIdempotency(req.body.idempotencyKey);
      next(error);
    }
  },
);

export default router;
