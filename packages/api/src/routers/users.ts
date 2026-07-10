import { TRPCError } from '@trpc/server';
import crypto from 'crypto';
import { z } from 'zod';
import { publicProcedure, protectedProcedure, router } from '../trpc';
import { prisma } from '@galaxy/db';
import type { Prisma } from '@galaxy/db';
import { updateProfileSchema } from '../validators/auth';

// ── Helpers ─────────────────────────────────────────────

const userSelect = {
  id: true,
  email: true,
  phone: true,
  phoneVerified: true,
  emailVerified: true,
  name: true,
  role: true,
  isActive: true,
  avatarUrl: true,
  preferredLanguage: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

const publicProfileSelect = {
  id: true,
  name: true,
  role: true,
  avatarUrl: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

// ── Router ──────────────────────────────────────────────

export const userRouter = router({
  // ──────────────────────────────────────────────────────
  // Get the authenticated user's profile (alias for auth.me)
  // ──────────────────────────────────────────────────────
  getMe: protectedProcedure.query(async ({ ctx }) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: ctx.user.id },
        select: {
          ...userSelect,
          technician: true,
          wallet: true,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      return user;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch user profile',
      });
    }
  }),

  // ──────────────────────────────────────────────────────
  // Update the authenticated user's profile (alias for auth.updateProfile)
  // ──────────────────────────────────────────────────────
  updateMe: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const user = await prisma.user.update({
          where: { id: ctx.user.id },
          data: input,
          select: userSelect,
        });

        return user;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update profile',
        });
      }
    }),

  // ──────────────────────────────────────────────────────
  // Delete account (GDPR right to erasure)
  // ──────────────────────────────────────────────────────
  deleteMe: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      // Revoke all active refresh tokens
      await prisma.refreshToken.updateMany({
        where: {
          userId: ctx.user.id,
          revokedAt: null,
        },
        data: { revokedAt: new Date() },
      });

      // Anonymize personal data while retaining referential integrity
      const anonymizedEmail = `deleted-${ctx.user.id}@anonymous.gob`;
      const anonymizedPhone = `+966500000${String(ctx.user.id).padStart(3, '0')}`;

      await prisma.user.update({
        where: { id: ctx.user.id },
        data: {
          name: 'Deleted User',
          email: anonymizedEmail,
          phone: anonymizedPhone,
          passwordHash: crypto.randomBytes(32).toString('hex'),
          isActive: false,
          avatarUrl: null,
          preferredLanguage: 'ar',
        },
      });

      return { message: 'Account deleted successfully' };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete account',
      });
    }
  }),

  // ──────────────────────────────────────────────────────
  // Export personal data (GDPR right of access)
  // ──────────────────────────────────────────────────────
  exportMyData: protectedProcedure.query(async ({ ctx }) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: ctx.user.id },
        include: {
          technician: true,
          wallet: {
            include: { transactions: true },
          },
          addresses: true,
          bookingsAsCustomer: true,
          bookingsAsTechnician: true,
          notifications: true,
          reviews: true,
          termsAcceptances: true,
          wishlistItems: true,
          refreshTokens: true,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      // Strip sensitive authentication fields
      const { passwordHash, twoFactorSecret, emailVerifyToken, ...safeData } = user;

      return {
        exportedAt: new Date().toISOString(),
        data: safeData,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to export data',
      });
    }
  }),

  // ──────────────────────────────────────────────────────
  // Get a public user profile by ID
  // ──────────────────────────────────────────────────────
  getById: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: input.id },
          select: {
            ...publicProfileSelect,
            technician: {
              select: {
                city: true,
                area: true,
                ratingAvg: true,
                totalReviews: true,
                completedBookings: true,
                isEcoFriendly: true,
              },
            },
          },
        });

        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          });
        }

        return user;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch user',
        });
      }
    }),
});
