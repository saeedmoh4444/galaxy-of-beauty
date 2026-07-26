import { z } from 'zod';

// =============================================================================
// Availability Slots
// =============================================================================

export const createSlotSchema = z.object({
  startAt: z.string().datetime('Invalid ISO datetime for startAt'),
  endAt: z.string().datetime('Invalid ISO datetime for endAt'),
}).refine((data) => new Date(data.endAt) > new Date(data.startAt), {
  message: 'endAt must be after startAt',
  path: ['endAt'],
});

export const bulkCreateSlotsSchema = z.object({
  slots: z.array(createSlotSchema).min(1).max(100, 'Max 100 slots per request'),
});

export const slotQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

// =============================================================================
// Booking
// =============================================================================

export const createBookingSchema = z.object({
  technicianId: z.number().int().positive('Technician is required'),
  serviceId: z.number().int().positive('Service is required'),
  variantId: z.number().int().positive().optional().nullable(),
  addressId: z.number().int().positive('Address is required'),
  slotId: z.number().int().positive('Time slot is required'),
  notes: z.string().max(500).optional().nullable(),
  idempotencyKey: z.string().uuid('Idempotency key must be a valid UUID'),
});

export const bookingStatusSchema = z.object({
  action: z.enum(['accept', 'reject', 'cancel', 'complete', 'no_show']),
  reason: z.string().max(500).optional(), // Required for reject/cancel
});

export const rescheduleSchema = z.object({
  newSlotId: z.number().int().positive('New time slot is required'),
  reason: z.string().max(500).optional(),
  idempotencyKey: z.string().uuid('Idempotency key must be a valid UUID'),
});

export const bookingQuerySchema = z.object({
  status: z.string().optional(), // Comma-separated statuses
  role: z.enum(['customer', 'technician']).optional(), // Filter by role
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export default {
  createSlot: createSlotSchema,
  bulkCreateSlots: bulkCreateSlotsSchema,
  slotQuery: slotQuerySchema,
  createBooking: createBookingSchema,
  bookingStatus: bookingStatusSchema,
  reschedule: rescheduleSchema,
  bookingQuery: bookingQuerySchema,
};
