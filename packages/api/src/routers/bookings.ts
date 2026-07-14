import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import crypto from 'crypto';
import {
  protectedProcedure,
  customerProcedure,
  technicianProcedure,
  router,
} from '../trpc';
import {
  createBookingSchema,
  bookingQuerySchema,
} from '../validators/booking';
import { emitToUser, emitToTechnician, emitToAdmin } from '../socket/index';

// ---------------------------------------------------------------------------
// Booking State Machine
// ---------------------------------------------------------------------------

const VALID_TRANSITIONS: Record<string, string[]> = {
  REQUESTED: ['ACCEPTED', 'REJECTED', 'CANCELLED'],
  ACCEPTED: ['IN_PROGRESS', 'CANCELLED', 'PAYMENT_AUTHORIZED'],
  IN_PROGRESS: ['COMPLETED', 'NO_SHOW'],
};

const ACTION_TO_STATUS: Record<string, string> = {
  accept: 'ACCEPTED',
  reject: 'REJECTED',
  cancel: 'CANCELLED',
  start: 'IN_PROGRESS',
  complete: 'COMPLETED',
  no_show: 'NO_SHOW',
};

// Which roles are allowed to perform each action
const ACTION_AUTHORIZATION: Record<string, Array<'customer' | 'technician' | 'admin'>> = {
  accept: ['technician', 'admin'],
  reject: ['technician', 'admin'],
  cancel: ['customer', 'admin'],
  start: ['technician', 'admin'],
  complete: ['technician', 'admin'],
  no_show: ['technician', 'admin'],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const bookingDetailInclude = {
  service: true,
  technician: { select: { id: true, name: true, avatarUrl: true } },
  customer: { select: { id: true, name: true, avatarUrl: true } },
  address: true,
  slot: true,
  payment: true,
} as const;

const bookingListInclude = {
  service: { select: { id: true, titleJson: true, basePrice: true } },
  technician: { select: { id: true, name: true, avatarUrl: true } },
  customer: { select: { id: true, name: true } },
  address: true,
  slot: true,
} as const;

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export const bookingRouter = router({
  /**
   * Create a new booking (customer only).
   *
   * Flow:
   *  1. Idempotency check — returns existing booking if idempotencyKey matches
   *  2. Verify technician exists and slot is available
   *  3. Atomically create booking + mark slot as booked
   *  4. Calculate totalAmount from service basePrice + variant priceDelta
   *  5. Generate human-readable bookingCode
   */
  create: customerProcedure
    .input(createBookingSchema)
    .mutation(async ({ ctx, input }) => {
      const customerId = ctx.user.id;

      // 1. Idempotency check
      const existing = await prisma.booking.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
        include: bookingDetailInclude,
      });
      if (existing) return existing;

      // 2a. Look up technician (User ID → Technician record)
      const technician = await prisma.technician.findUnique({
        where: { userId: input.technicianId },
      });
      if (!technician) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Technician not found',
        });
      }

      // 2b. Look up slot
      const slot = await prisma.availabilitySlot.findUnique({
        where: { id: input.slotId },
      });
      if (!slot) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Slot not found' });
      }
      if (slot.technicianId !== technician.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Slot does not belong to the specified technician',
        });
      }
      if (slot.isBooked) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Slot is already booked',
        });
      }

      // 3. Atomic create
      const booking = await prisma.$transaction(async (tx) => {
        // Re-check slot inside transaction to avoid races
        const currentSlot = await tx.availabilitySlot.findUnique({
          where: { id: input.slotId },
        });
        if (!currentSlot || currentSlot.isBooked) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Slot is no longer available',
          });
        }

        // 4. Calculate totalAmount
        const service = await tx.service.findUnique({
          where: { id: input.serviceId },
        });
        if (!service) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Service not found',
          });
        }

        let totalAmount = Number(service.basePrice);

        if (input.variantId) {
          const variant = await tx.serviceVariant.findUnique({
            where: { id: input.variantId },
          });
          if (!variant || variant.serviceId !== input.serviceId) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Service variant not found or does not belong to this service',
            });
          }
          totalAmount += Number(variant.priceDelta);
        }

        // 5. Generate booking code
        const bookingCode = `GOB-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

        // 6. Create booking
        const newBooking = await tx.booking.create({
          data: {
            bookingCode,
            customerId,
            technicianId: input.technicianId,
            serviceId: input.serviceId,
            variantId: input.variantId ?? null,
            addressId: input.addressId,
            startAt: new Date(input.startAt),
            endAt: new Date(input.endAt),
            status: 'REQUESTED',
            totalAmount,
            platformFee: 0,
            paymentFee: 0,
            cashHandlingFee: 0,
            notes: input.notes ?? null,
            idempotencyKey: input.idempotencyKey,
          },
        });

        // 7. Mark slot as booked and link to booking
        await tx.availabilitySlot.update({
          where: { id: input.slotId },
          data: {
            isBooked: true,
            bookingId: newBooking.id,
          },
        });

        return newBooking;
      });

      // 8. Return full booking with relations
      const result = await prisma.booking.findUnique({
        where: { id: booking.id },
        include: bookingDetailInclude,
      });

      // 9. Emit real-time events
      if (result) {
        // Notify the technician about the new booking request
        emitToTechnician(input.technicianId, 'new_booking_request', result);
        // Notify the customer with confirmation
        emitToUser(ctx.user.id, 'new_booking_request', result);
        // Notify admins
        emitToAdmin('admin_update', { type: 'new_booking', booking: result });
      }

      return result;
    }),

  /**
   * List bookings for the current user.
   * - Customers see their own bookings.
   * - Technicians see bookings for their services.
   * - Admins see all bookings.
   * Supports pagination and optional status filter.
   */
  list: protectedProcedure
    .input(bookingQuerySchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const role = ctx.user.role;

      const where: Record<string, unknown> = {};

      if (role === 'CUSTOMER') {
        where.customerId = userId;
      } else if (role === 'TECHNICIAN') {
        where.technicianId = userId;
      }
      // ADMIN sees all (no additional filter)

      if (input.status) {
        where.status = input.status;
      }

      const skip = (input.page - 1) * input.limit;

      const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
          where,
          skip,
          take: input.limit,
          orderBy: { createdAt: 'desc' },
          include: bookingListInclude,
        }),
        prisma.booking.count({ where }),
      ]);

      return {
        bookings,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          totalPages: Math.ceil(total / input.limit),
        },
      };
    }),

  /**
   * Get a single booking by ID.
   * Verifies the requesting user is a participant (customer or technician)
   * or an admin.
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const booking = await prisma.booking.findUnique({
        where: { id: input.id },
        include: bookingDetailInclude,
      });

      if (!booking) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Booking not found' });
      }

      const userId = ctx.user.id;
      if (
        booking.customerId !== userId &&
        booking.technicianId !== userId &&
        ctx.user.role !== 'ADMIN'
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this booking',
        });
      }

      return booking;
    }),

  /**
   * Transition a booking's status.
   *
   * Authorized actors per action:
   *   technician — accept, reject (REQUESTED), start (ACCEPTED),
   *                complete, no_show (IN_PROGRESS)
   *   customer   — cancel (REQUESTED or ACCEPTED)
   *   admin      — any action
   *
   * Side effects:
   *   cancel / reject → free the slot
   *   complete        → increment technician completedBookings
   */
  transition: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        action: z.enum(['accept', 'reject', 'cancel', 'start', 'complete', 'no_show']),
        reason: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const role = ctx.user.role;

      // Find booking
      const booking = await prisma.booking.findUnique({
        where: { id: input.id },
        include: { slot: true },
      });

      if (!booking) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Booking not found' });
      }

      // Determine new status (input.action is validated by zod enum, so this is safe)
      const newStatus = ACTION_TO_STATUS[input.action]!;

      // Authorization: who can perform this action?
      const allowedRoles = ACTION_AUTHORIZATION[input.action] ?? [];
      const isInvolvedTechnician = booking.technicianId === userId;
      const isInvolvedCustomer = booking.customerId === userId;

      let authorized = false;
      if (role === 'ADMIN') {
        authorized = true;
      } else if (role === 'TECHNICIAN' && isInvolvedTechnician && allowedRoles.includes('technician')) {
        authorized = true;
      } else if (role === 'CUSTOMER' && isInvolvedCustomer && allowedRoles.includes('customer')) {
        authorized = true;
      }

      if (!authorized) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You are not authorized to perform this action on this booking',
        });
      }

      // Validate state transition
      const validNextStates = VALID_TRANSITIONS[booking.status];
      if (!validNextStates || !validNextStates.includes(newStatus)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Cannot transition booking from ${booking.status} to ${newStatus}`,
        });
      }

      // Perform the transition
      const updatedBooking = await prisma.$transaction(async (tx) => {
        // Free the slot on cancel or reject
        if (input.action === 'cancel' || input.action === 'reject') {
          if (booking.slot) {
            await tx.availabilitySlot.update({
              where: { id: booking.slot.id },
              data: {
                isBooked: false,
                bookingId: null,
              },
            });
          }
        }

        // Increment technician stats on completion
        if (input.action === 'complete') {
          await tx.technician.update({
            where: { userId: booking.technicianId },
            data: { completedBookings: { increment: 1 } },
          });
        }

        // Build update payload
        const updateData: Record<string, unknown> = {
          status: newStatus,
        };

        if (input.action === 'cancel') {
          updateData.cancelledAt = new Date();
          updateData.cancelReason = input.reason ?? null;
        }

        return tx.booking.update({
          where: { id: input.id },
          data: updateData,
          include: bookingDetailInclude,
        });
      });

      // Emit real-time events based on the action
      const eventMap: Record<string, string> = {
        accept: 'booking_accepted',
        reject: 'booking_rejected',
        cancel: 'booking_cancelled',
        start: 'booking_started',
        complete: 'booking_completed',
        no_show: 'booking_no_show',
      };

      const event = eventMap[input.action] || 'booking_updated';

      // Notify the customer
      if (booking.customerId) {
        emitToUser(booking.customerId, event, updatedBooking);
      }

      // Notify the technician
      if (booking.technicianId) {
        emitToTechnician(booking.technicianId, event, updatedBooking);
      }

      // Notify admins
      emitToAdmin('admin_update', {
        type: 'booking_action',
        action: input.action,
        booking: updatedBooking,
      });

      return updatedBooking;
    }),

  /**
   * Get all pending (REQUESTED) bookings for the authenticated
   * technician, ordered by startAt ascending.
   */
  getTechnicianPending: technicianProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const bookings = await prisma.booking.findMany({
      where: {
        technicianId: userId,
        status: 'REQUESTED',
      },
      orderBy: { startAt: 'asc' },
      include: {
        customer: { select: { id: true, name: true, avatarUrl: true } },
        service: true,
        address: true,
      },
    });

    return bookings;
  }),

  /**
   * Reschedule a booking to a new slot (customer only).
   * - Frees the old slot
   * - Books the new slot (must belong to same technician)
   * - Updates booking startAt and endAt
   *
   * Only REQUESTED or ACCEPTED bookings can be rescheduled.
   */
  reschedule: customerProcedure
    .input(
      z.object({
        bookingId: z.number(),
        newSlotId: z.number(),
        newStartAt: z.string(),
        newEndAt: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      const booking = await prisma.booking.findUnique({
        where: { id: input.bookingId },
        include: { slot: true },
      });

      if (!booking) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Booking not found' });
      }

      if (booking.customerId !== userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not own this booking',
        });
      }

      if (!['REQUESTED', 'ACCEPTED'].includes(booking.status)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Cannot reschedule a booking with status ${booking.status}`,
        });
      }

      const updatedBooking = await prisma.$transaction(async (tx) => {
        // 1. Free old slot
        if (booking.slot) {
          await tx.availabilitySlot.update({
            where: { id: booking.slot.id },
            data: {
              isBooked: false,
              bookingId: null,
            },
          });
        }

        // 2. Verify new slot exists and belongs to the same technician
        const newSlot = await tx.availabilitySlot.findUnique({
          where: { id: input.newSlotId },
        });

        if (!newSlot) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'New slot not found',
          });
        }

        // Look up technician record to match slot.technicianId
        const technician = await tx.technician.findUnique({
          where: { userId: booking.technicianId },
        });
        if (!technician || newSlot.technicianId !== technician.id) {
          // Free the old slot won't matter since we rollback, but rollback does happen on throw
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'New slot does not belong to the booking technician',
          });
        }

        if (newSlot.isBooked) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'New slot is already booked',
          });
        }

        // 3. Book new slot
        await tx.availabilitySlot.update({
          where: { id: input.newSlotId },
          data: {
            isBooked: true,
            bookingId: booking.id,
          },
        });

        // 4. Update booking times
        return tx.booking.update({
          where: { id: input.bookingId },
          data: {
            startAt: new Date(input.newStartAt),
            endAt: new Date(input.newEndAt),
          },
          include: bookingDetailInclude,
        });
      });

      return updatedBooking;
    }),

  /**
   * Get the timeline (audit trail) of status changes for a booking.
   * Built from booking lifecycle + payment events + admin audit logs.
   */
  getTimeline: protectedProcedure
    .input(z.object({ bookingId: z.number() }))
    .query(async ({ ctx, input }) => {
      const booking = await prisma.booking.findUnique({
        where: { id: input.bookingId },
        include: {
          payment: { select: { id: true, status: true, amount: true, createdAt: true } },
        },
      });

      if (!booking) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Booking not found' });
      }

      const userId = ctx.user.id;
      if (
        booking.customerId !== userId &&
        booking.technicianId !== userId &&
        ctx.user.role !== 'ADMIN'
      ) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have access to this booking' });
      }

      const events: Array<Record<string, unknown>> = [];

      // Booking created
      events.push({
        type: 'BOOKING_CREATED',
        labelAr: 'تم إنشاء الحجز',
        labelEn: 'Booking created',
        timestamp: booking.createdAt.toISOString(),
        actor: 'customer',
      });

      // Payment timeline
      if (booking.payment) {
        events.push({
          type: 'PAYMENT_EVENT',
          labelAr: `الدفع: ${booking.payment.status === 'CAPTURED' ? 'تم التحصيل' : booking.payment.status === 'AUTHORIZED' ? 'تم التفويض' : booking.payment.status === 'REFUNDED' ? 'تم الاسترداد' : booking.payment.status}`,
          labelEn: `Payment: ${booking.payment.status}`,
          timestamp: booking.payment.createdAt.toISOString(),
          actor: 'system',
          amount: booking.payment.amount.toNumber(),
        });
      }

      // Status label for the booking's current state
      const statusLabels: Record<string, { ar: string; en: string }> = {
        REQUESTED: { ar: 'في انتظار القبول', en: 'Awaiting acceptance' },
        ACCEPTED: { ar: 'تم القبول', en: 'Accepted' },
        PAYMENT_AUTHORIZED: { ar: 'تم تفويض الدفع', en: 'Payment authorized' },
        CONFIRMED_OFFLINE: { ar: 'تم التأكيد (دفع خارجي)', en: 'Confirmed (offline payment)' },
        PAID: { ar: 'تم الدفع', en: 'Paid' },
        IN_PROGRESS: { ar: 'قيد التنفيذ', en: 'In progress' },
        COMPLETED: { ar: 'مكتمل', en: 'Completed' },
        REJECTED: { ar: 'مرفوض', en: 'Rejected' },
        CANCELLED: { ar: 'ملغي', en: 'Cancelled' },
        NO_SHOW: { ar: 'لم يحضر', en: 'No-show' },
      };

      const currentLabel = statusLabels[booking.status] || { ar: booking.status, en: booking.status };

      // Cancelled event
      if (booking.cancelledAt) {
        events.push({
          type: 'BOOKING_CANCELLED',
          labelAr: 'تم إلغاء الحجز',
          labelEn: 'Booking cancelled',
          timestamp: booking.cancelledAt.toISOString(),
          actor: 'customer',
          reason: booking.cancelReason || undefined,
        });
      }

      // Last update
      events.push({
        type: 'STATUS_UPDATE',
        labelAr: `الحالة الحالية: ${currentLabel.ar}`,
        labelEn: `Current status: ${currentLabel.en}`,
        timestamp: booking.updatedAt.toISOString(),
        actor: 'system',
      });

      // Admin audit log entries for this booking
      if (ctx.user.role === 'ADMIN') {
        const auditLogs = await prisma.auditLog.findMany({
          where: { targetType: 'Booking', targetId: String(input.bookingId) },
          include: { admin: { select: { name: true } } },
          orderBy: { createdAt: 'asc' },
        });

        for (const log of auditLogs) {
          events.push({
            type: 'ADMIN_ACTION',
            labelAr: `إجراء إداري: ${log.action}`,
            labelEn: `Admin action: ${log.action}`,
            timestamp: log.createdAt.toISOString(),
            actor: 'admin',
            adminName: log.admin.name,
            action: log.action,
            changes: log.newValue,
          });
        }
      }

      // Sort chronologically
      events.sort((a, b) => new Date(a.timestamp as string).getTime() - new Date(b.timestamp as string).getTime());

      return {
        bookingId: input.bookingId,
        status: booking.status,
        events,
      };
    }),
});
