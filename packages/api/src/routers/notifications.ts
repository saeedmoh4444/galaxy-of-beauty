import { z } from 'zod';
import { prisma } from '@galaxy/db';
import {
  router,
  protectedProcedure,
  adminProcedure,
} from '../trpc';
import { emitToUser } from '../socket/index';
import { sendPushToUser } from '../lib/push';

export const notificationRouter = router({
  // ── List notifications (paginated, newest first) ──────────────────────────
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, limit } = input;
      const skip = (page - 1) * limit;

      const where = { userId: ctx.user.id };

      const [items, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.notification.count({ where }),
      ]);

      return {
        items,
        total,
        page,
        limit,
        hasMore: skip + items.length < total,
        totalPages: Math.ceil(total / limit),
      };
    }),

  // ── Unread count ──────────────────────────────────────────────────────────
  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    const count = await prisma.notification.count({
      where: {
        userId: ctx.user.id,
        isRead: false,
      },
    });

    return { count };
  }),

  // ── Mark single notification as read ──────────────────────────────────────
  markRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const notification = await prisma.notification.findUnique({
        where: { id: input.id },
        select: { id: true, userId: true },
      });

      if (!notification) {
        return { success: false };
      }

      if (notification.userId !== ctx.user.id) {
        return { success: false };
      }

      await prisma.notification.update({
        where: { id: input.id },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return { success: true };
    }),

  // ── Mark all as read ──────────────────────────────────────────────────────
  markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
    await prisma.notification.updateMany({
      where: {
        userId: ctx.user.id,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { success: true };
  }),

  // ── Register push token ────────────────────────────────────────────────────
  registerPushToken: protectedProcedure
    .input(
      z.object({
        token: z.string().min(1),
        platform: z.enum(['ios', 'android', 'web']),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Upsert: one unique token per user+platform combination
      const existing = await prisma.pushToken.findUnique({
        where: { token: input.token },
      });

      if (existing) {
        // Token already registered — update userId if it changed
        if (existing.userId !== ctx.user.id) {
          await prisma.pushToken.update({
            where: { id: existing.id },
            data: { userId: ctx.user.id, platform: input.platform },
          });
        }
      } else {
        await prisma.pushToken.create({
          data: {
            token: input.token,
            userId: ctx.user.id,
            platform: input.platform,
          },
        });
      }

      return { success: true };
    }),

  // ── Send notification (admin, multi-channel stub) ─────────────────────────
  send: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        type: z.string().min(1),
        titleAr: z.string().min(1),
        titleEn: z.string().min(1),
        bodyAr: z.string().min(1),
        bodyEn: z.string().min(1),
        link: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { userId, type, titleAr, titleEn, bodyAr, bodyEn, link } = input;

      const notification = await prisma.notification.create({
        data: {
          userId,
          type,
          titleJson: { ar: titleAr, en: titleEn },
          bodyJson: { ar: bodyAr, en: bodyEn },
          link,
          sentVia: ['in_app'],
        },
      });

      // Emit real-time notification to the user via WebSocket
      emitToUser(userId, 'new_notification', {
        id: notification.id,
        type,
        titleEn,
        titleAr,
        bodyEn,
        bodyAr,
        link: link ?? null,
        createdAt: notification.createdAt,
      });

      // Send push notification to the user's devices
      // Determine locale from user preference
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { preferredLanguage: true },
      });
      const locale = (user?.preferredLanguage as 'ar' | 'en') || 'ar';
      sendPushToUser(userId, {
        title: locale === 'ar' ? titleAr : titleEn,
        body: locale === 'ar' ? bodyAr : bodyEn,
        data: link ? { link } : undefined,
      }).catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[Push] Failed to send push notification:', err);
      });

      return notification;
    }),
});
