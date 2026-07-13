import { TRPCError } from '@trpc/server';
import crypto from 'crypto';
import { publicProcedure, publicMutation, protectedProcedure, protectedMutation, router } from '../trpc';
import { prisma } from '@galaxy/db';
import type { Prisma } from '@galaxy/db';
import {
  hashPassword,
  verifyPassword,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  getEnv,
  generateTotpSecret,
  verifyTotpToken,
  sendPasswordResetEmail,
  incrementAttempts,
  resetAttempts,
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
  register: publicMutation
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
  login: publicMutation
    .input(loginSchema)
    .mutation(async ({ input }) => {
      try {
        // ── Rate limiting: 5 attempts per 15 minutes per email ──
        const lockoutKey = `login_attempts:${input.email}`;
        const attempts = await incrementAttempts(lockoutKey, 900); // 15 min window
        const MAX_ATTEMPTS = 5;

        if (attempts > MAX_ATTEMPTS) {
          throw new TRPCError({
            code: 'TOO_MANY_REQUESTS',
            message: 'Too many login attempts. Please try again in 15 minutes.',
          });
        }

        // ── Find user ──
        const user = await prisma.user.findUnique({
          where: { email: input.email },
        });
        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Invalid email or password',
          });
        }

        // ── Verify password ──
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

        // ── 2FA check ──
        if (user.twoFactorEnabled) {
          if (!input.totpToken) {
            throw new TRPCError({
              code: 'PRECONDITION_FAILED',
              message: '2FA_REQUIRED',
            });
          }

          // Verify the TOTP token against the stored secret
          if (!user.twoFactorSecret || !verifyTotpToken(input.totpToken, user.twoFactorSecret)) {
            throw new TRPCError({
              code: 'UNAUTHORIZED',
              message: 'Invalid 2FA code',
            });
          }
        }

        // ── Reset rate limit on successful login ──
        await resetAttempts(lockoutKey);

        // ── Update last login timestamp ──
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
  logout: protectedMutation
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
  updateProfile: protectedMutation
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
  changePassword: protectedMutation
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
  // Request password reset — generates a token and stores it
  // ──────────────────────────────────────────────────────
  forgotPassword: publicMutation
    .input(forgotPasswordSchema)
    .mutation(async ({ input }) => {
      try {
        // Do not reveal whether the email exists (user enumeration prevention)
        const user = await prisma.user.findUnique({
          where: { email: input.email },
        });

        if (user) {
          // Generate a random reset token valid for 1 hour
          const token = generateToken();
          const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour

          // Persist the reset token
          await prisma.resetToken.create({
            data: {
              token,
              userId: user.id,
              expiresAt,
            },
          });

          // Send the password reset email
          const locale = (user.preferredLanguage as 'ar' | 'en') || 'ar';
          sendPasswordResetEmail(user.email, user.name, token, locale).catch(
            // Log but don't fail the request if email sending fails
            // eslint-disable-next-line no-console
            (err) => console.error('[ResetToken] Failed to send email:', err),
          );
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
  // Reset password using a valid reset token
  // ──────────────────────────────────────────────────────
  resetPassword: publicMutation
    .input(resetPasswordSchema)
    .mutation(async ({ input }) => {
      try {
        // Find a valid (non-expired, unused) reset token
        const resetToken = await prisma.resetToken.findUnique({
          where: { token: input.token },
        });

        if (!resetToken) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid or expired reset token',
          });
        }

        if (resetToken.usedAt) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'This reset token has already been used',
          });
        }

        if (resetToken.expiresAt < new Date()) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Reset token has expired. Please request a new one.',
          });
        }

        // Update the user's password
        const newHash = await hashPassword(input.newPassword);
        await prisma.user.update({
          where: { id: resetToken.userId },
          data: { passwordHash: newHash },
        });

        // Mark token as used
        await prisma.resetToken.update({
          where: { id: resetToken.id },
          data: { usedAt: new Date() },
        });

        return { message: 'Password reset successfully. You can now log in.' };
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
  verifyEmail: publicMutation
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
  resendVerification: protectedMutation
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
  setup2FA: protectedMutation
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

        const { secret, otpauthUrl } = generateTotpSecret(user.email);

        await prisma.user.update({
          where: { id: ctx.user.id },
          data: { twoFactorSecret: secret },
        });

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
  verify2FA: protectedMutation
    .input(twoFactorVerifySchema)
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

        if (!user.twoFactorSecret) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: '2FA not set up. Run setup2FA first.',
          });
        }

        // Verify the TOTP token against the stored secret
        if (!verifyTotpToken(input.token, user.twoFactorSecret)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid 2FA code. Please try again.',
          });
        }

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
  disable2FA: protectedMutation
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
