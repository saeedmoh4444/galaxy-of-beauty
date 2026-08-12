/**
 * Test schemas for Tier 1 test coverage.
 * Mirrors the validation logic in validators/* without importing from the API package.
 */
import { z } from 'zod';

export const idempotencyKeySchema = z.string().min(1).max(128);

export const paymentSchema = z.object({
  amount: z.number().positive(),
  method: z.enum(['CARD', 'WALLET', 'CASH', 'APPLE_PAY', 'MADA']),
  bookingId: z.number().int().positive(),
  idempotencyKey: idempotencyKeySchema.optional(),
});

export const walletTransactionSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['DEPOSIT', 'WITHDRAWAL', 'PAYMENT', 'REFUND', 'CASHBACK', 'BONUS']),
  referenceId: z.string().optional(),
  description: z.string().max(500).optional(),
});

export const bookingSchema = z.object({
  serviceId: z.number().int().positive(),
  technicianId: z.number().int().positive().optional(),
  addressId: z.number().int().positive().optional(),
  startAt: z.string().datetime(),
  notes: z.string().max(1000).optional(),
  promoCode: z.string().max(50).optional(),
});

export const reviewSchema = z.object({
  bookingId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export const disputeSchema = z.object({
  bookingId: z.number().int().positive(),
  reason: z.enum(['SERVICE_NOT_RENDERED', 'QUALITY_UNSATISFACTORY', 'WRONG_SERVICE', 'OVERCHARGED', 'OTHER']),
  description: z.string().min(10).max(2000),
});
