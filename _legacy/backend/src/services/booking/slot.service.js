/**
 * Availability Slot Service
 *
 * Manages technician availability slots: create, bulk create, query, delete.
 * Extracted from services/booking.js to reduce file size and improve cohesion.
 */
import prisma from '../../config/database.js';
import { AppError, ErrorCodes } from '../../utils/errors.js';
import { invalidateCache } from '../../config/redis.js';

/**
 * Create a single availability slot for a technician.
 */
export async function createSlot(technicianId, startAt, endAt) {
  const overlapping = await prisma.availabilitySlot.findFirst({
    where: {
      technicianId,
      isAvailable: true,
      AND: [
        { startAt: { lt: new Date(endAt) } },
        { endAt: { gt: new Date(startAt) } },
      ],
    },
  });

  if (overlapping) {
    throw new AppError('Time slot overlaps with an existing slot', 409, ErrorCodes.ALREADY_EXISTS);
  }

  const slot = await prisma.availabilitySlot.create({
    data: { technicianId, startAt: new Date(startAt), endAt: new Date(endAt) },
  });

  await invalidateCache(`slots:${technicianId}:*`);
  return slot;
}

/**
 * Bulk create availability slots.
 */
export async function bulkCreateSlots(technicianId, slots) {
  const sorted = [...slots].sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
  for (let i = 0; i < sorted.length - 1; i++) {
    if (new Date(sorted[i].endAt) > new Date(sorted[i + 1].startAt)) {
      throw new AppError('Bulk slots contain overlapping times', 400, ErrorCodes.ALREADY_EXISTS);
    }
  }

  const data = slots.map(({ startAt, endAt }) => ({
    technicianId,
    startAt: new Date(startAt),
    endAt: new Date(endAt),
  }));

  await prisma.availabilitySlot.createMany({ data, skipDuplicates: true });
  await invalidateCache(`slots:${technicianId}:*`);

  return prisma.availabilitySlot.findMany({
    where: { technicianId, isAvailable: true },
    orderBy: { startAt: 'asc' },
    take: data.length,
  });
}

/**
 * Get availability slots for a technician.
 */
export async function getSlots(technicianId, filters = {}) {
  const { date, startDate, endDate } = filters;
  const where = { technicianId, isAvailable: true };

  if (date) {
    const dayStart = new Date(`${date}T00:00:00.000+03:00`);
    const dayEnd = new Date(`${date}T23:59:59.999+03:00`);
    where.startAt = { gte: dayStart, lte: dayEnd };
  } else if (startDate || endDate) {
    where.startAt = {};
    if (startDate) where.startAt.gte = new Date(`${startDate}T00:00:00.000+03:00`);
    if (endDate) where.startAt.lte = new Date(`${endDate}T23:59:59.999+03:00`);
  } else {
    where.startAt = { gte: new Date() };
  }

  return prisma.availabilitySlot.findMany({
    where,
    orderBy: { startAt: 'asc' },
  });
}

/**
 * Delete an availability slot (soft-delete: marks unavailable).
 */
export async function deleteSlot(slotId, technicianId) {
  const slot = await prisma.availabilitySlot.findFirst({
    where: { id: slotId, technicianId },
  });

  if (!slot) {
    throw new AppError('Slot not found', 404, ErrorCodes.NOT_FOUND);
  }

  if (slot.isBooked) {
    throw new AppError('Cannot delete a booked slot', 400, ErrorCodes.BOOKING_INVALID_STATE);
  }

  await prisma.availabilitySlot.update({
    where: { id: slotId },
    data: { isAvailable: false },
  });

  await invalidateCache(`slots:${technicianId}:*`);
}
