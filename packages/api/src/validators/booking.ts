import { z } from 'zod';

export const createSlotSchema = z.object({
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
});

export const bulkCreateSlotsSchema = z.object({
  slots: z.array(createSlotSchema).min(1).max(100),
});

export const slotQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  days: z.coerce.number().int().min(1).max(30).default(7),
});

export const createBookingSchema = z.object({
  technicianId: z.number().int().positive(),
  serviceId: z.number().int().positive(),
  variantId: z.number().int().positive().optional(),
  addressId: z.number().int().positive(),
  slotId: z.number().int().positive().optional(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  notes: z.string().max(500).optional(),
  idempotencyKey: z.string().uuid(),
});

export const bookingStatusSchema = z.object({
  action: z.enum(['accept', 'reject', 'cancel', 'start', 'complete', 'no_show']),
  reason: z.string().max(500).optional(),
});

export const rescheduleSchema = z.object({
  newSlotId: z.number().int().positive(),
  newStartAt: z.string().datetime(),
  newEndAt: z.string().datetime(),
});

export const bookingQuerySchema = z.object({
  status: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type BookingStatusInput = z.infer<typeof bookingStatusSchema>;
