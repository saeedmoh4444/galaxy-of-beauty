import { z } from 'zod';

// =============================================================================
// Payment Schemas
// =============================================================================

export const paymentAuthorizeSchema = z.object({
  paymentMethod: z.enum(['online', 'cash']),
  idempotencyKey: z.string().uuid('Idempotency key must be a valid UUID'),
  // For online payment: card details handled by PayFort SDK on client side
  returnUrl: z.string().url().optional(), // PayFort redirect after 3DS
});

export const paymentCaptureSchema = z.object({
  bookingId: z.number().int().positive(),
});

// =============================================================================
// Wallet Schemas
// =============================================================================

export const walletWithdrawSchema = z.object({
  amount: z.number().positive('Amount must be positive').max(100000),
  idempotencyKey: z.string().uuid(),
});

export const walletTransactionQuerySchema = z.object({
  type: z.enum(['CREDIT', 'DEBIT']).optional(),
  source: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

// =============================================================================
// Payout Schemas
// =============================================================================

export const createPayoutSchema = z.object({
  technicianId: z.number().int().positive(),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
});

export const processPayoutSchema = z.object({
  payoutId: z.number().int().positive(),
});

export default {
  paymentAuthorize: paymentAuthorizeSchema,
  paymentCapture: paymentCaptureSchema,
  walletWithdraw: walletWithdrawSchema,
  walletTransactionQuery: walletTransactionQuerySchema,
  createPayout: createPayoutSchema,
  processPayout: processPayoutSchema,
};
