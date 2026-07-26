import prisma from '../config/database.js';
import { AppError, ErrorCodes } from '../utils/errors.js';
import logger from '../config/logger.js';

/**
 * Create a review for a completed booking.
 * Updates technician's average rating.
 *
 * @param {number} bookingId
 * @param {number} customerId
 * @param {number} rating - 1 to 5
 * @param {string} [comment]
 */
export async function createReview(bookingId, customerId, rating, comment) {
  if (rating < 1 || rating > 5) {
    throw new AppError('Rating must be between 1 and 5', 400, ErrorCodes.INVALID_INPUT);
  }

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, customerId },
  });

  if (!booking) {
    throw new AppError('Booking not found', 404, ErrorCodes.BOOKING_NOT_FOUND);
  }

  if (booking.status !== 'COMPLETED') {
    throw new AppError(
      'Can only review completed bookings',
      400,
      ErrorCodes.BOOKING_INVALID_STATE,
    );
  }

  // Check duplicate
  const existing = await prisma.review.findUnique({ where: { bookingId } });
  if (existing) {
    throw new AppError('You have already reviewed this booking', 409, ErrorCodes.ALREADY_EXISTS);
  }

  const review = await prisma.$transaction(async (tx) => {
    const r = await tx.review.create({
      data: { bookingId, customerId, rating, comment },
    });

    // Update technician average rating
    const techReviews = await tx.review.findMany({
      where: { booking: { technicianId: booking.technicianId } },
      select: { rating: true },
    });

    const totalRatings = techReviews.length;
    const avgRating = techReviews.reduce((sum, rv) => sum + rv.rating, 0) / totalRatings;

    await tx.technician.update({
      where: { userId: booking.technicianId },
      data: {
        ratingAvg: Math.round(avgRating * 100) / 100,
        totalReviews: totalRatings,
      },
    });

    return r;
  });

  logger.info('Review created', { bookingId, rating, technicianId: booking.technicianId });
  return review;
}

/**
 * Get reviews for a technician.
 * @param {number} technicianUserId
 * @param {number} [page=1]
 * @param {number} [limit=20]
 */
export async function getTechnicianReviews(technicianUserId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { booking: { technicianId: technicianUserId }, isVisible: true },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true, avatarUrl: true } },
        booking: { select: { service: { select: { titleJson: true } } } },
      },
    }),
    prisma.review.count({
      where: { booking: { technicianId: technicianUserId }, isVisible: true },
    }),
  ]);

  return {
    reviews,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export default { createReview, getTechnicianReviews };
