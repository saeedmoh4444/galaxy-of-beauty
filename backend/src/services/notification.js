import prisma from '../config/database.js';
import { emailQueue, notificationQueue } from '../jobs/queue.js';
import { emitToUser } from '../socket/index.js';
import logger from '../config/logger.js';

/**
 * Create and send a notification.
 * Stores in-app notification + queues email/SMS + emits Socket.IO event.
 *
 * @param {object} params
 * @param {number} params.userId
 * @param {string} params.type - e.g., 'booking_created', 'payment_success'
 * @param {object} params.titleJson - { ar, en }
 * @param {object} params.bodyJson - { ar, en }
 * @param {string} [params.link] - Deep link in the app
 * @param {string[]} [params.channels] - ['in_app', 'email', 'sms', 'push']
 * @param {object} [params.emailData] - Extra data for email template
 */
export async function sendNotification({
  userId,
  type,
  titleJson,
  bodyJson,
  link = null,
  channels = ['in_app', 'email'],
  emailData = {},
}) {
  // 1. Store in-app notification
  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      titleJson,
      bodyJson,
      link,
      sentVia: channels,
    },
  });

  // 2. Emit real-time via Socket.IO
  emitToUser(userId, 'new_notification', {
    id: notification.id,
    type,
    title: titleJson,
    body: bodyJson,
    link,
    isRead: false,
  });

  // 3. Queue email if requested
  if (channels.includes('email') && emailData.to) {
    await emailQueue.add('send', {
      to: emailData.to,
      subject: titleJson?.ar || titleJson?.en || 'Galaxy of Beauty',
      template: type,
      data: {
        title: titleJson,
        body: bodyJson,
        link,
        ...emailData,
      },
    });
  }

  // 4. Queue SMS if requested
  if (channels.includes('sms') && emailData.phone) {
    await notificationQueue.add('sms', {
      phone: emailData.phone,
      message: bodyJson?.ar || bodyJson?.en || '',
    });
  }

  return notification;
}

/**
 * Booking lifecycle notifications.
 */

export async function notifyBookingCreated(booking) {
  const customer = await prisma.user.findUnique({ where: { id: booking.customerId } });
  const technician = await prisma.user.findUnique({ where: { id: booking.technicianId } });
  const service = await prisma.service.findUnique({ where: { id: booking.serviceId } });

  // Notify technician
  await sendNotification({
    userId: booking.technicianId,
    type: 'booking_request',
    titleJson: { ar: 'طلب حجز جديد', en: 'New Booking Request' },
    bodyJson: {
      ar: `لديك طلب حجز جديد من ${customer?.name} - ${service?.titleJson?.ar}`,
      en: `New booking request from ${customer?.name} - ${service?.titleJson?.en}`,
    },
    link: `/tech/dashboard`,
    channels: ['in_app', 'email'],
    emailData: { to: technician?.email },
  });

  // Notify customer: booking received
  await sendNotification({
    userId: booking.customerId,
    type: 'booking_created',
    titleJson: { ar: 'تم استلام طلب الحجز', en: 'Booking Request Received' },
    bodyJson: {
      ar: `طلب حجزك لـ ${service?.titleJson?.ar} قيد المراجعة من قبل المتخصصة`,
      en: `Your booking for ${service?.titleJson?.en} is being reviewed`,
    },
    link: `/bookings`,
    channels: ['in_app', 'email'],
    emailData: { to: customer?.email },
  });
}

export async function notifyBookingAccepted(booking) {
  const customer = await prisma.user.findUnique({ where: { id: booking.customerId } });
  const service = await prisma.service.findUnique({ where: { id: booking.serviceId } });

  await sendNotification({
    userId: booking.customerId,
    type: 'booking_accepted',
    titleJson: { ar: 'تم قبول حجزك! ✨', en: 'Booking Accepted! ✨' },
    bodyJson: {
      ar: `تم قبول حجزك لـ ${service?.titleJson?.ar}. يمكنك الآن إتمام الدفع.`,
      en: `Your booking for ${service?.titleJson?.en} has been accepted. Proceed to payment.`,
    },
    link: `/bookings`,
    channels: ['in_app', 'email'],
    emailData: { to: customer?.email },
  });
}

export async function notifyPaymentSuccess(booking) {
  const customer = await prisma.user.findUnique({ where: { id: booking.customerId } });

  await sendNotification({
    userId: booking.customerId,
    type: 'payment_success',
    titleJson: { ar: 'تم الدفع بنجاح 💳', en: 'Payment Successful 💳' },
    bodyJson: {
      ar: `تم تأكيد الدفع للحجز #${booking.bookingCode}. سنراكِ قريباً!`,
      en: `Payment confirmed for booking #${booking.bookingCode}. See you soon!`,
    },
    link: `/bookings`,
    channels: ['in_app', 'email'],
    emailData: { to: customer?.email },
  });
}

export async function notifyBookingReminder(booking) {
  const customer = await prisma.user.findUnique({ where: { id: booking.customerId } });
  const technician = await prisma.user.findUnique({ where: { id: booking.technicianId } });

  // Notify customer 1 hour before
  await sendNotification({
    userId: booking.customerId,
    type: 'booking_reminder',
    titleJson: { ar: 'تذكير بموعدك ⏰', en: 'Appointment Reminder ⏰' },
    bodyJson: {
      ar: `موعدك بعد ساعة واحدة. ${new Date(booking.startAt).toLocaleTimeString('ar-SA')}`,
      en: `Your appointment is in 1 hour at ${new Date(booking.startAt).toLocaleTimeString()}`,
    },
    link: `/bookings`,
    channels: ['in_app', 'email'],
    emailData: { to: customer?.email },
  });

  // Notify technician
  await sendNotification({
    userId: booking.technicianId,
    type: 'booking_reminder',
    titleJson: { ar: 'تذكير بموعد ⏰', en: 'Appointment Reminder ⏰' },
    bodyJson: {
      ar: `لديك موعد مع ${customer?.name} بعد ساعة واحدة`,
      en: `You have an appointment with ${customer?.name} in 1 hour`,
    },
    link: `/tech/dashboard`,
    channels: ['in_app'],
    emailData: {},
  });
}

export async function notifyReviewRequest(booking) {
  const customer = await prisma.user.findUnique({ where: { id: booking.customerId } });
  const service = await prisma.service.findUnique({ where: { id: booking.serviceId } });

  await sendNotification({
    userId: booking.customerId,
    type: 'review_request',
    titleJson: { ar: 'قيمي تجربتك ⭐', en: 'Rate Your Experience ⭐' },
    bodyJson: {
      ar: `كيف كانت تجربتك مع ${service?.titleJson?.ar}؟ قيمي الخدمة لتساعدي غيرك.`,
      en: `How was your experience with ${service?.titleJson?.en}? Leave a review!`,
    },
    link: `/bookings?highlight=${booking.id}`,
    channels: ['in_app', 'email'],
    emailData: { to: customer?.email },
  });
}

/**
 * Get notifications for a user.
 */
export async function getUserNotifications(userId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.count({ where: { userId } }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return {
    notifications,
    unreadCount,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

/**
 * Mark notification as read.
 */
export async function markNotificationRead(notificationId, userId) {
  await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true, readAt: new Date() },
  });
}

/**
 * Mark all notifications as read.
 */
export async function markAllNotificationsRead(userId) {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
}

// =============================================================================
// EventBus Listeners — auto-wired on module load
// Services can emit events instead of directly importing notification functions.
// =============================================================================

import events from '../shared/events.js';

events.on('booking:created', (data) => {
  notifyBookingCreated(data.booking).catch((err) =>
    logger.error('EventBus: booking:created handler failed', { error: err.message }),
  );
});

events.on('booking:accepted', (data) => {
  notifyBookingAccepted(data.booking).catch((err) =>
    logger.error('EventBus: booking:accepted handler failed', { error: err.message }),
  );
});

events.on('payment:success', (data) => {
  notifyPaymentSuccess(data.booking).catch((err) =>
    logger.error('EventBus: payment:success handler failed', { error: err.message }),
  );
});

events.on('booking:reminder', (data) => {
  notifyBookingReminder(data.booking).catch((err) =>
    logger.error('EventBus: booking:reminder handler failed', { error: err.message }),
  );
});

events.on('booking:review-request', (data) => {
  notifyReviewRequest(data.booking).catch((err) =>
    logger.error('EventBus: booking:review-request handler failed', { error: err.message }),
  );
});

export default {
  sendNotification,
  notifyBookingCreated,
  notifyBookingAccepted,
  notifyPaymentSuccess,
  notifyBookingReminder,
  notifyReviewRequest,
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
