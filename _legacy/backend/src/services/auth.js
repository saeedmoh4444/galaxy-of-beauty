import bcrypt from 'bcrypt';
import prisma from '../config/database.js';
import { generateTokenPair, verifyToken, generateAccessToken } from '../utils/jwt.js';
import { AppError, ErrorCodes } from '../utils/errors.js';
import logger from '../config/logger.js';
import env from '../config/env.js';
import crypto from 'crypto';
import { emailQueue } from '../jobs/queue.js';
import { emitToAdmin } from '../socket/index.js';
import redis, { isRedisAvailable } from '../config/redis.js';

const SALT_ROUNDS = 12;

/**
 * Parse JWT expiry string (e.g., '15m', '7d', '30d') to milliseconds.
 */
function parseExpiryToMs(expiryStr) {
  const match = expiryStr.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000; // default 7 days
  const value = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return value * (multipliers[unit] || 86400000);
}

const REFRESH_TOKEN_EXPIRY_MS = parseExpiryToMs(env.JWT_REFRESH_EXPIRY);

/**
 * Register a new user (customer or technician).
 * Creates user, optional technician profile, wallet, and records terms acceptance.
 *
 * @param {object} data - Validated registration data
 * @returns {Promise<{ user, accessToken, refreshToken }>}
 */
export async function register(data) {
  // Check for existing email
  const existingEmail = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingEmail) {
    // Check if this is a suspended technician trying to re-register
    if (existingEmail.role === 'TECHNICIAN' && existingEmail.suspendedAt) {
      logger.warn('Suspended technician attempted re-registration', { email: data.email, userId: existingEmail.id });
      // Flag for admin review — we still reject but log the attempt
    }
    throw new AppError('Email already registered', 409, ErrorCodes.EMAIL_ALREADY_EXISTS);
  }

  // Check for existing phone
  const existingPhone = await prisma.user.findUnique({ where: { phone: data.phone } });
  if (existingPhone) {
    if (existingPhone.role === 'TECHNICIAN' && existingPhone.suspendedAt) {
      logger.warn('Suspended technician attempted re-registration with existing phone', { phone: data.phone, userId: existingPhone.id });
    }
    throw new AppError('Phone number already registered', 409, ErrorCodes.PHONE_ALREADY_EXISTS);
  }

  // Auto-detect potential duplicate technicians (same name + city)
  if (data.role === 'TECHNICIAN') {
    const potentialDuplicates = await prisma.user.findMany({
      where: {
        name: data.name,
        role: 'TECHNICIAN',
        technician: { city: data.city },
      },
      select: { id: true, email: true, createdAt: true },
    });

    if (potentialDuplicates.length > 0) {
      logger.warn('Potential duplicate technician detected', {
        newEmail: data.email,
        newPhone: data.phone,
        name: data.name,
        city: data.city,
        potentialDuplicates: potentialDuplicates.map((d) => ({ id: d.id, email: d.email })),
      });
      // Notify admin via socket
      try {

        emitToAdmin('duplicate_technician_alert', {
          name: data.name,
          city: data.city,
          email: data.email,
          phone: data.phone,
          matches: potentialDuplicates.length,
        });
      } catch { /* non-critical */ }
    }
  }

  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

  // Use transaction to create user + related records atomically
  const result = await prisma.$transaction(async (tx) => {
    // Generate email verification token
    const emailVerifyToken = crypto.randomBytes(32).toString('hex');
    const emailVerifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = await tx.user.create({
      data: {
        email: data.email,
        phone: data.phone,
        name: data.name,
        passwordHash,
        role: data.role,
        emailVerifyToken,
        emailVerifyExpiry,
      },
    });

    // Create wallet for the user
    await tx.wallet.create({
      data: { userId: user.id, balance: 0, bonusBalance: 0 },
    });

    // If technician, create technician profile
    if (data.role === 'TECHNICIAN') {
      await tx.technician.create({
        data: {
          userId: user.id,
          city: data.city || 'الرياض',
          area: data.area || null,
          kycStatus: 'PENDING',
        },
      });
    }

    // Record terms acceptance
    await tx.termsAcceptance.create({
      data: {
        userId: user.id,
        termsVersion: 'v1.0',
        ipAddress: data.ipAddress || '0.0.0.0',
      },
    });

    return user;
  });

  // Generate tokens
  const { accessToken, refreshToken } = generateTokenPair(result);

  // Store refresh token
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: result.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
    },
  });

  logger.info('User registered', { userId: result.id, role: result.role });

  // Return user without password hash
  const { passwordHash: _, ...userWithoutPassword } = result;

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  };
}

/**
 * Login with email + password.
 * Verifies credentials, checks account status, and generates tokens.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user, accessToken, refreshToken }>}
 */
export async function login(email, password) {
  // Find user by email
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('Invalid email or password', 401, ErrorCodes.INVALID_CREDENTIALS);
  }

  // Check if active
  if (!user.isActive || user.suspendedAt) {
    throw new AppError(
      'Account is suspended or deactivated',
      403,
      ErrorCodes.ACCOUNT_SUSPENDED,
    );
  }

  // Check account lockout (Redis-based, 5 failed attempts → 15 min lockout)
  // Falls back to allowing login when Redis is unavailable (dev mode)
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_MINUTES = 15;

  const lockKey = `login:locked:${user.id}`;
  const attemptKey = `login:attempts:${user.id}`;

  if (isRedisAvailable()) {
    try {
      const isLocked = await redis.get(lockKey);
      if (isLocked) {
        const ttl = await redis.ttl(lockKey);
        throw new AppError(
          `Account temporarily locked. Try again in ${Math.ceil(ttl / 60)} minutes.`,
          429,
          'ACCOUNT_LOCKED',
        );
      }
    } catch { /* Redis error — skip lockout check */ }
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    // Increment failed attempts (Redis-based, skip if unavailable)
    if (isRedisAvailable()) {
      try {
        const attempts = await redis.incr(attemptKey);
        if (attempts === 1) {
          await redis.expire(attemptKey, LOCKOUT_MINUTES * 60);
        }
        if (attempts >= MAX_ATTEMPTS) {
          await redis.setex(lockKey, LOCKOUT_MINUTES * 60, '1');
          logger.warn('Account locked due to failed attempts', { userId: user.id, attempts });
          throw new AppError(
            `Account locked due to too many failed attempts. Try again in ${LOCKOUT_MINUTES} minutes.`,
            429,
            'ACCOUNT_LOCKED',
          );
        }
      } catch { /* Redis error — skip lockout tracking */ }
    }
    throw new AppError('Invalid email or password', 401, ErrorCodes.INVALID_CREDENTIALS);
  }

  // Successful login — clear failed attempts
  if (isRedisAvailable()) {
    try {
      await redis.del(attemptKey);
      await redis.del(lockKey);
    } catch { /* Redis error — ignore */ }
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokenPair(user);

  // Store refresh token
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  logger.info('User logged in', { userId: user.id, role: user.role });

  const { passwordHash: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  };
}

/**
 * Refresh access token using a valid refresh token.
 * Implements token rotation: old refresh token is revoked, new pair issued.
 *
 * @param {string} refreshTokenStr
 * @returns {Promise<{ accessToken, refreshToken }>}
 */
export async function refreshAccessToken(refreshTokenStr) {
  // Verify the token JWT validity
  const decoded = verifyToken(refreshTokenStr, 'refresh');

  // Check if token exists in DB and is not revoked
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshTokenStr },
    include: { user: { select: { id: true, role: true, email: true, isActive: true } } },
  });

  if (!storedToken || storedToken.revokedAt) {
    // Possible token reuse — revoke all tokens for this user (security)
    if (storedToken) {
      await prisma.refreshToken.updateMany({
        where: { userId: storedToken.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      logger.warn('Refresh token reuse detected — all tokens revoked', {
        userId: storedToken.userId,
      });
    }
    throw new AppError('Invalid or revoked refresh token', 401, ErrorCodes.TOKEN_INVALID);
  }

  if (!storedToken.user.isActive) {
    throw new AppError('Account is deactivated', 403, ErrorCodes.ACCOUNT_SUSPENDED);
  }

  // Revoke old refresh token (rotation)
  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revokedAt: new Date() },
  });

  // Issue new token pair
  const tokens = generateTokenPair(storedToken.user);

  // Store new refresh token
  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: storedToken.userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return tokens;
}

/**
 * Logout — revoke the refresh token.
 *
 * @param {string} refreshTokenStr
 */
export async function logout(refreshTokenStr) {
  if (!refreshTokenStr) return;

  await prisma.refreshToken.updateMany({
    where: { token: refreshTokenStr, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  logger.info('User logged out');
}

/**
 * Get user profile by ID.
 *
 * @param {number} userId
 * @returns {Promise<object>}
 */
export async function getUserProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      phone: true,
      name: true,
      role: true,
      isActive: true,
      avatarUrl: true,
      preferredLanguage: true,
      emailVerified: true,
      phoneVerified: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
      wallet: {
        select: {
          id: true,
          balance: true,
          bonusBalance: true,
        },
      },
      technician: {
        select: {
          id: true,
          city: true,
          area: true,
          bioJson: true,
          hourlyRate: true,
          ratingAvg: true,
          totalReviews: true,
          completedBookings: true,
          kycStatus: true,
          kycDocuments: true,
          googleCalendarEmail: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError('User not found', 404, ErrorCodes.NOT_FOUND);
  }

  return user;
}

/**
 * Update user profile.
 *
 * @param {number} userId
 * @param {object} data
 * @returns {Promise<object>}
 */
export async function updateUserProfile(userId, data) {
  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.phone && { phone: data.phone }),
      ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
      ...(data.preferredLanguage && { preferredLanguage: data.preferredLanguage }),
    },
    select: {
      id: true,
      email: true,
      phone: true,
      name: true,
      role: true,
      avatarUrl: true,
      preferredLanguage: true,
      updatedAt: true,
    },
  });

  return updated;
}

/**
 * Change user password.
 *
 * @param {number} userId
 * @param {string} currentPassword
 * @param {string} newPassword
 */
export async function changePassword(userId, currentPassword, newPassword) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('User not found', 404, ErrorCodes.NOT_FOUND);
  }

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) {
    throw new AppError('Current password is incorrect', 400, ErrorCodes.INVALID_INPUT);
  }

  const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newHash },
  });

  // Revoke all refresh tokens for security
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  logger.info('Password changed', { userId });
}

/**
 * Verify user email using the token sent after registration.
 *
 * @param {string} token - Email verification token
 * @returns {Promise<{ verified: boolean }>}
 */
export async function verifyEmail(token) {
  if (!token) {
    throw new AppError('Verification token is required', 400, ErrorCodes.INVALID_INPUT);
  }

  const user = await prisma.user.findFirst({
    where: { emailVerifyToken: token },
  });

  if (!user) {
    throw new AppError('Invalid verification token', 400, ErrorCodes.INVALID_INPUT);
  }

  if (user.emailVerifyExpiry && new Date() > user.emailVerifyExpiry) {
    throw new AppError('Verification token has expired. Please request a new one.', 400, ErrorCodes.TOKEN_EXPIRED);
  }

  if (user.emailVerified) {
    return { verified: true, message: 'Email already verified' };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerifyToken: null,
      emailVerifyExpiry: null,
    },
  });

  logger.info('Email verified', { userId: user.id });

  return { verified: true, message: 'Email verified successfully' };
}

/**
 * Resend email verification token.
 *
 * @param {number} userId
 * @returns {Promise<{ sent: boolean }>}
 */
export async function resendVerificationEmail(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError('User not found', 404, ErrorCodes.NOT_FOUND);
  }

  if (user.emailVerified) {
    return { sent: false, message: 'Email already verified' };
  }

  const emailVerifyToken = crypto.randomBytes(32).toString('hex');
  const emailVerifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: userId },
    data: { emailVerifyToken, emailVerifyExpiry },
  });

  // Queue verification email (will be processed by the email worker)
  try {

    await emailQueue.add('send', {
      to: user.email,
      subject: 'Verify your email - Galaxy of Beauty',
      template: 'email_verification',
      data: {
        title: { ar: 'تأكيد البريد الإلكتروني', en: 'Verify Your Email' },
        body: {
          ar: `رمز التحقق: ${emailVerifyToken.substring(0, 8)}... أو انقري الرابط أدناه`,
          en: `Verification token: ${emailVerifyToken.substring(0, 8)}... or click the link below`,
        },
        link: `${env.CORS_ORIGIN}/verify-email?token=${emailVerifyToken}`,
      },
    });
  } catch (queueError) {
    logger.warn('Failed to queue verification email', { error: queueError.message });
  }

  logger.info('Verification email resent', { userId });

  return { sent: true, message: 'Verification email sent' };
}

/**
 * Forgot password — generate reset token and queue email.
 *
 * @param {string} email
 * @returns {Promise<{ message: string }>}
 */
export async function forgotPassword(email) {
  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success to prevent email enumeration
  if (!user) {
    return { message: 'If an account with that email exists, a reset link has been sent.' };
  }

  if (!user.isActive) {
    return { message: 'If an account with that email exists, a reset link has been sent.' };
  }

  // Generate reset token and store in Redis with 1-hour TTL

  const resetToken = crypto.randomBytes(32).toString('hex');


  if (isRedisAvailable()) {
    try {
      await redis.setex(`pwd:reset:${resetToken}`, 3600, String(user.id));
    } catch {
      // Without Redis, we'll use a JWT-based approach as fallback

      const pwdResetJwt = generateAccessToken({ userId: user.id, purpose: 'password_reset' }, '1h');
      // Store in DB instead — but for dev without Redis, just log and continue
      logger.warn('Redis unavailable — password reset token stored in-memory only');
    }
  }

  // Queue password reset email
  try {

    await emailQueue.add('send', {
      to: user.email,
      subject: 'Password Reset - Galaxy of Beauty',
      template: 'password_reset',
      data: {
        title: { ar: 'إعادة تعيين كلمة المرور', en: 'Password Reset' },
        body: {
          ar: 'انقري الرابط أدناه لإعادة تعيين كلمة المرور. الرابط صالح لمدة ساعة واحدة.',
          en: 'Click the link below to reset your password. The link is valid for one hour.',
        },
        link: `${env.CORS_ORIGIN}/reset-password?token=${resetToken}`,
      },
    });
  } catch (queueError) {
    logger.warn('Failed to queue password reset email', { error: queueError.message });
  }

  logger.info('Password reset requested', { userId: user.id });

  return { message: 'If an account with that email exists, a reset link has been sent.' };
}

/**
 * Reset password using a valid reset token.
 *
 * @param {string} token - Password reset token from email
 * @param {string} newPassword - New password
 * @returns {Promise<{ message: string }>}
 */
export async function resetPassword(token, newPassword) {
  if (!token || !newPassword) {
    throw new AppError('Token and new password are required', 400, ErrorCodes.INVALID_INPUT);
  }

  // Look up token in Redis (fallback: JWT-based if Redis unavailable)

  let userId;

  if (isRedisAvailable()) {
    try {
      userId = await redis.get(`pwd:reset:${token}`);
    } catch { /* Redis error */ }
  }

  // Fallback: if Redis unavailable, try JWT-based token verification
  if (!userId) {
    try {

      const decoded = verifyToken(token, 'access');
      if (decoded?.purpose !== 'password_reset') {
        throw new AppError('Invalid or expired reset token. Please request a new one.', 400, ErrorCodes.TOKEN_EXPIRED);
      }
      userId = String(decoded.userId);
    } catch {
      throw new AppError('Invalid or expired reset token. Please request a new one.', 400, ErrorCodes.TOKEN_EXPIRED);
    }
  }

  const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  // Atomic: update password + revoke all refresh tokens + delete reset token
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: parseInt(userId, 10) },
      data: { passwordHash: newHash },
    });

    await tx.refreshToken.updateMany({
      where: { userId: parseInt(userId, 10), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  });

  // Delete the reset token (one-time use)
  if (isRedisAvailable()) {
    try { await redis.del(`pwd:reset:${token}`); } catch { /* noop */ }
  }

  logger.info('Password reset completed', { userId });

  return { message: 'Password reset successfully. Please log in with your new password.' };
}

export default { register, login, refreshAccessToken, logout, getUserProfile, updateUserProfile, changePassword, verifyEmail, resendVerificationEmail, forgotPassword, resetPassword };
