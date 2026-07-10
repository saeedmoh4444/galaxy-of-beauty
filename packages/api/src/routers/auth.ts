import { TRPCError } from '@trpc/server';
import crypto from 'crypto';
import { publicProcedure, protectedProcedure, router } from '../trpc';
import { prisma } from '@galaxy/db';
import type { Prisma } from '@galaxy/db';
import {
  hashPassword,
  verifyPassword,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  getEnv,
} from '../lib';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  twoFactorVerifySchema,
  updateProfileSchema,
} from '../validators/auth';

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

function generateToken(length = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

function parseExpiryToMs(expiry: string): number {
  const match = expiry.match(/^(\d+)([dhms])$/);
  if (!match) return 7 * 86400000;
  const num = parseInt(match[1]!, 10);
  const unit = match[2]!;
  const multipliers: Record<string, number> = {
    d: 86400000,
    h: 3600000,
    m: 60000,
    s: 1000,
  };
  return num * (multipliers[unit] ?? 86400000);
}

async function storeRefreshToken(userId: number, jwtToken: string): Promise<void> {
  const env = getEnv();
  await prisma.refreshToken.create({
    data: {
      token: jwtToken,
      userId,
      expiresAt: new Date(Date.now() + parseExpiryToMs(env.JWT_REFRESH_EXPIRY)),
    },
  });
}

// ── Router ──────────────────────────────────────────────

export const authRouter = router({
  // ──────────────────────────────────────────────────────
  // Register a new user account
  // ──────────────────────────────────────────────────────
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ input }) => {
      try {
        // Check for duplicate email
        const existingEmail = await prisma.user.findUnique({
          where: { email: input.email },
        });
        if (existingEmail) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Email already registered',
          });
        }

        // Check for duplicate phone
        const existingPhone = await prisma.user.findUnique({
          where: { phone: input.phone },
        });
        if (existingPhone) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Phone number already registered',
          });
        }

        // City is required for technician registration
        if (input.role === 'TECHNICIAN' && !input.city) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'City is required for technician registration',
          });
        }

        const passwordHash = await hashPassword(input.password);
        const emailVerifyToken = generateToken();
        const emailVerifyExpiry = new Date(Date.now() + 24 * 3600 * 1000); // 24 hours

        // Create user
        const user = await prisma.user.create({
          data: {
            email: input.email,
            phone: input.phone,
            passwordHash,
            name: input.name,
            role: input.role,
            emailVerifyToken,
            emailVerifyExpiry,
          },
          select: userSelect,
        });

        // Create wallet (every user gets one)
        await prisma.wallet.create({
          data: { userId: user.id },
        });

        // Create technician profile if applicable
        if (input.role === 'TECHNICIAN') {
          await prisma.technician.create({
            data: {
              userId: user.id,
              city: input.city!,
            },
          });
        }

        // Sign tokens
        const payload = { id: user.id, role: user.role, email: user.email };
        const accessToken = signAccessToken(payload);
        const refreshTokenJwt = signRefreshToken(payload);
        await storeRefreshToken(user.id, refreshTokenJwt);

        return { user, accessToken, refreshToken: refreshTokenJwt };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Registration failed',
        });
      }
    }),

  // ──────────────────────────────────────────────────────
  // Login with email and password
  // ──────────────────────────────────────────────────────
  login: publicProcedure
    .input(loginSchema)
    .mutation(async ({ input }) => {
      try {
        const user = await prisma.user.findUnique({
          where: { email: input.email },
        });
        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Invalid email or password',
          });
        }

        const valid = await verifyPassword(input.password, user.passwordHash);
        if (!valid) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Invalid email or password',
          });
        }

        if (!user.isActive) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Account is deactivated',
          });
        }

        // 2FA check
        if (user.twoFactorEnabled && !input.totpToken) {
          throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message: '2FA_REQUIRED',
          });
        }

        // Update last login timestamp
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        // Sign tokens
        const payload = { id: user.id, role: user.role, email: user.email };
        const accessToken = signAccessToken(payload);
        const refreshTokenJwt = signRefreshToken(payload);
        await storeRefreshToken(user.id, refreshTokenJwt);

        // Strip password hash from response
        const { passwordHash: _, ...safeUser } = user;

        return { user: safeUser, accessToken, refreshToken: refreshTokenJwt };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Login failed',
        });
      }
    }),

  // ──────────────────────────────────────────────────────
  // Refresh access token using a valid refresh token
  // ──────────────────────────────────────────────────────
  refresh: publicProcedure
    .input(refreshTokenSchema)
    .mutation(async ({ input }) => {
      try {
        // Verify the JWT signature
        let payload: { id: number; role: 'CUSTOMER' | 'TECHNICIAN' | 'ADMIN'; email: string };
        try {
          payload = verifyRefreshToken(input.refreshToken) as unknown as { id: number; role: 'CUSTOMER' | 'TECHNICIAN' | 'ADMIN'; email: string };
        } catch {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Invalid or expired refresh token',
          });
        }

        // Look up the stored token and check revocation
        const stored = await prisma.refreshToken.findUnique({
          where: { token: input.refreshToken },
        });

        if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Refresh token has been revoked or expired',
          });
        }

        // Rotate: revoke old token
        await prisma.refreshToken.update({
          where: { id: stored.id },
          data: { revokedAt: new Date() },
        });

        // Issue new tokens
        const newPayload = { id: payload.id, role: payload.role, email: payload.email };
        const accessToken = signAccessToken(newPayload);
        const refreshTokenJwt = signRefreshToken(newPayload);
        await storeRefreshToken(payload.id, refreshTokenJwt);

        return { accessToken, refreshToken: refreshTokenJwt };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Token refresh failed',
        });
      }
    }),

  // ──────────────────────────────────────────────────────
  // Logout — revoke all active refresh tokens
  // ──────────────────────────────────────────────────────
  logout: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        await prisma.refreshToken.updateMany({
          where: {
            userId: ctx.user.id,
            revokedAt: null,
          },
          data: { revokedAt: new Date() },
        });

        return { message: 'Logged out successfully' };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Logout failed',
        });
      }
    }),

  // ──────────────────────────────────────────────────────
  // Get current authenticated user profile
  // ──────────────────────────────────────────────────────
  me: protectedProcedure
    .query(async ({ ctx }) => {
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
  // Update profile fields
  // ──────────────────────────────────────────────────────
  updateProfile: protectedProcedure
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
  // Change password
  // ──────────────────────────────────────────────────────
  changePassword: protectedProcedure
    .input(changePasswordSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: ctx.user.id },
        });

        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          });
        }

        const valid = await verifyPassword(input.currentPassword, user.passwordHash);
        if (!valid) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Current password is incorrect',
          });
        }

        const newHash = await hashPassword(input.newPassword);
        await prisma.user.update({
          where: { id: ctx.user.id },
          data: { passwordHash: newHash },
        });

        return { message: 'Password changed successfully' };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to change password',
        });
      }
    }),

  // ──────────────────────────────────────────────────────
  // Request password reset (stub)
  // ──────────────────────────────────────────────────────
  forgotPassword: publicProcedure
    .input(forgotPasswordSchema)
    .mutation(async ({ input }) => {
      try {
        // Do not reveal whether the email exists (user enumeration prevention)
        const user = await prisma.user.findUnique({
          where: { email: input.email },
        });

        if (user) {
          // Stub: In production, generate a reset token, store it
          // (requires a ResetToken model or additional fields on User),
          // then send an email with the reset link.
          const token = generateToken();
          // TODO: Persist token and send email
          // eslint-disable-next-line no-console
          console.log(`[STUB] Password reset token for ${input.email}: ${token}`);
        }

        return {
          message: 'If the email is registered, you will receive a password reset link.',
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to process request',
        });
      }
    }),

  // ──────────────────────────────────────────────────────
  // Reset password with token (stub)
  // ──────────────────────────────────────────────────────
  resetPassword: publicProcedure
    .input(resetPasswordSchema)
    .mutation(async () => {
      try {
        // Stub: In production, verify the reset token from the database
        // before updating the password. This requires a ResetToken model
        // or reset token fields on the User model.
        throw new TRPCError({
          code: 'NOT_IMPLEMENTED',
          message:
            'Password reset requires a reset token store. Please implement the ResetToken model first.',
        });
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to reset password',
        });
      }
    }),

  // ──────────────────────────────────────────────────────
  // Verify email address
  // ──────────────────────────────────────────────────────
  verifyEmail: publicProcedure
    .input(verifyEmailSchema)
    .mutation(async ({ input }) => {
      try {
        const user = await prisma.user.findFirst({
          where: {
            emailVerifyToken: input.token,
            emailVerifyExpiry: { gte: new Date() },
          },
        });

        if (!user) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid or expired verification token',
          });
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            emailVerified: true,
            emailVerifyToken: null,
            emailVerifyExpiry: null,
          },
        });

        return { message: 'Email verified successfully' };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Email verification failed',
        });
      }
    }),

  // ──────────────────────────────────────────────────────
  // Resend email verification token
  // ──────────────────────────────────────────────────────
  resendVerification: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        const token = generateToken();
        const expiry = new Date(Date.now() + 24 * 3600 * 1000); // 24 hours

        await prisma.user.update({
          where: { id: ctx.user.id },
          data: {
            emailVerifyToken: token,
            emailVerifyExpiry: expiry,
          },
        });

        // In production: send email with the token
        return { message: 'Verification email sent', token };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to resend verification',
        });
      }
    }),

  // ──────────────────────────────────────────────────────
  // Generate 2FA secret and return otpauth URI
  // ──────────────────────────────────────────────────────
  setup2FA: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        const secret = crypto.randomBytes(32).toString('base64');

        const user = await prisma.user.findUnique({
          where: { id: ctx.user.id },
        });
        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          });
        }

        await prisma.user.update({
          where: { id: ctx.user.id },
          data: { twoFactorSecret: secret },
        });

        const otpauthUrl = `otpauth://totp/GalaxyOfBeauty:${encodeURIComponent(user.email)}?secret=${secret}&issuer=GalaxyOfBeauty`;

        return { secret, otpauthUrl };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to setup 2FA',
        });
      }
    }),

  // ──────────────────────────────────────────────────────
  // Verify and enable 2FA
  // ──────────────────────────────────────────────────────
  verify2FA: protectedProcedure
    .input(twoFactorVerifySchema)
    .mutation(async ({ ctx }) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: ctx.user.id },
        });

        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          });
        }

        if (!user.twoFactorSecret) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: '2FA not set up. Run setup2FA first.',
          });
        }

        // TODO: Verify the TOTP token using a library such as otplib or speakeasy.
        // Example: otplib.authenticator.check(input.token, user.twoFactorSecret)
        // For now the 6-digit token is accepted as valid (stub).

        await prisma.user.update({
          where: { id: ctx.user.id },
          data: { twoFactorEnabled: true },
        });

        return { message: '2FA enabled successfully' };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '2FA verification failed',
        });
      }
    }),

  // ──────────────────────────────────────────────────────
  // Disable 2FA
  // ──────────────────────────────────────────────────────
  disable2FA: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        await prisma.user.update({
          where: { id: ctx.user.id },
          data: {
            twoFactorEnabled: false,
            twoFactorSecret: null,
          },
        });

        return { message: '2FA disabled successfully' };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to disable 2FA',
        });
      }
    }),
});
