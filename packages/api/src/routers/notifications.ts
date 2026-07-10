import { z } from 'zod';
import { prisma } from '@galaxy/db';
import {
  router,
  protectedProcedure,
  adminProcedure,
} from '../trpc';

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

  // ── Register push token (stub) ────────────────────────────────────────────
  registerPushToken: protectedProcedure
    .input(
      z.object({
        token: z.string().min(1),
        platform: z.enum(['ios', 'android', 'web']),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: Store push token in a push_tokens table and wire to FCM/APNs
      console.log(
        `[PushToken] user=${ctx.user.id} platform=${input.platform} token=${input.token.slice(0, 20)}...`,
      );

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

      // TODO: Send real push/email/SMS via Firebase / SendGrid / Twilio
      console.log(
        `[Notification] user=${userId} type=${type} title[ar]=${titleAr} title[en]=${titleEn}`,
      );

      return notification;
    }),
});
