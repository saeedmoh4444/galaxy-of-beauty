import { z } from 'zod';

export const paymentAuthorizeSchema = z.object({
  method: z.enum(['online', 'cash']).default('online'),
  idempotencyKey: z.string().uuid(),
});

export const paymentCaptureSchema = z.object({
  // PayFort capture — no additional fields needed from client
});

export const walletWithdrawSchema = z.object({
  amount: z.number().positive().min(100, 'Minimum withdrawal is 100 SAR'),
  idempotencyKey: z.string().uuid(),
});

export const walletTransactionQuerySchema = z.object({
  type: z.enum(['CREDIT', 'DEBIT']).optional(),
  source: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const createPayoutSchema = z.object({
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
});

export const processPayoutSchema = z.object({
  payoutId: z.number().int().positive(),
});

export const createAddressSchema = z.object({
  label: z.string().min(1).max(50),
  city: z.string().min(1),
  area: z.string().min(1),
  street: z.string().min(1),
  building: z.string().optional(),
  floor: z.string().optional(),
  apartment: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  isDefault: z.boolean().default(false),
});

export const updateAddressSchema = createAddressSchema.partial();

export type WalletWithdrawInput = z.infer<typeof walletWithdrawSchema>;
export type CreateAddressInput = z.infer<typeof createAddressSchema>;
