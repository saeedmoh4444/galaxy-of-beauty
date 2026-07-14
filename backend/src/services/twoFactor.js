/**
 * Two-Factor Authentication (TOTP) Service
 *
 * Implements TOTP (RFC 6238) using Node.js crypto — no external dependencies.
 * Time-based one-time passwords with 30-second windows.
 *
 * Flow:
 *   1. POST /api/auth/2fa/setup → returns secret + QR code URL
 *   2. User scans QR with Google Authenticator / Authy
 *   3. POST /api/auth/2fa/verify → verifies first token, enables 2FA
 *   4. POST /api/auth/2fa/login → verifies token during login (if 2FA enabled)
 */

import crypto from 'crypto';
import prisma from '../config/database.js';
import { AppError, ErrorCodes } from '../utils/errors.js';
import logger from '../config/logger.js';

const TOTP_PERIOD = 30; // seconds
const TOTP_DIGITS = 6;
const TOTP_WINDOW = 1; // Allow ±1 period for clock drift

/**
 * Generate a TOTP secret for a user.
 * Returns the secret (base32) and an otpauth URL for QR codes.
 */
export async function setup2FA(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, twoFactorEnabled: true },
  });

  if (!user) throw new AppError('User not found', 404, ErrorCodes.NOT_FOUND);
  if (user.twoFactorEnabled) throw new AppError('2FA already enabled', 400, ErrorCodes.ALREADY_EXISTS);

  // Generate random secret (20 bytes = 160 bits for SHA-1)
  const secret = crypto.randomBytes(20).toString('hex');

  // Store temporarily as unverified
  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorSecret: secret, twoFactorEnabled: false },
  });

  // Generate otpauth URL for QR code
  const label = encodeURIComponent(`Galaxy of Beauty:${user.email}`);
  const otpauthUrl = `otpauth://totp/${label}?secret=${base32Encode(secret)}&issuer=Galaxy%20of%20Beauty&algorithm=SHA1&digits=6&period=30`;

  logger.info('2FA setup initiated', { userId });

  return { secret, otpauthUrl, message: 'Scan the QR code with Google Authenticator or Authy' };
}

/**
 * Verify and enable 2FA after setup.
 */
export async function verifyAndEnable2FA(userId, token) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, twoFactorSecret: true, twoFactorEnabled: true },
  });

  if (!user || !user.twoFactorSecret) {
    throw new AppError('2FA setup not initiated', 400, ErrorCodes.INVALID_INPUT);
  }

  if (user.twoFactorEnabled) {
    throw new AppError('2FA already enabled', 400, ErrorCodes.ALREADY_EXISTS);
  }

  const isValid = verifyTOTP(user.twoFactorSecret, token);
  if (!isValid) {
    throw new AppError('Invalid verification code. Please try again.', 400, ErrorCodes.INVALID_INPUT);
  }

  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorEnabled: true },
  });

  // Audit
  await prisma.auditLog.create({
    data: { adminId: userId, action: 'ENABLE_2FA', targetType: 'User', targetId: String(userId) },
  });

  logger.info('2FA enabled', { userId });

  return { enabled: true, message: '2FA enabled successfully. Use your authenticator app for login codes.' };
}

/**
 * Verify a TOTP token during login (if 2FA is enabled).
 */
export async function verifyLogin2FA(userId, token) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, twoFactorSecret: true, twoFactorEnabled: true },
  });

  if (!user?.twoFactorEnabled) return true; // 2FA not required
  if (!user.twoFactorSecret) return false;

  return verifyTOTP(user.twoFactorSecret, token);
}

/**
 * Disable 2FA for a user.
 */
export async function disable2FA(userId, token) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, twoFactorSecret: true, twoFactorEnabled: true },
  });

  if (!user?.twoFactorEnabled) {
    throw new AppError('2FA is not enabled', 400, ErrorCodes.INVALID_INPUT);
  }

  if (!verifyTOTP(user.twoFactorSecret, token)) {
    throw new AppError('Invalid verification code', 400, ErrorCodes.INVALID_INPUT);
  }

  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorSecret: null, twoFactorEnabled: false },
  });

  await prisma.auditLog.create({
    data: { adminId: userId, action: 'DISABLE_2FA', targetType: 'User', targetId: String(userId) },
  });

  logger.info('2FA disabled', { userId });

  return { enabled: false, message: '2FA has been disabled' };
}

// =============================================================================
// TOTP Implementation (RFC 6238)
// =============================================================================

function verifyTOTP(secretHex, token) {
  const now = Math.floor(Date.now() / 1000);
  const counter = Math.floor(now / TOTP_PERIOD);

  // Check current window and ±1 for clock drift
  for (let offset = -TOTP_WINDOW; offset <= TOTP_WINDOW; offset++) {
    const expected = generateTOTP(secretHex, counter + offset);
    if (expected === token) return true;
  }

  return false;
}

function generateTOTP(secretHex, counter) {
  const hmac = crypto.createHmac('sha1', Buffer.from(secretHex, 'hex'));
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigInt64BE(BigInt(counter), 0);
  hmac.update(counterBuffer);
  const hash = hmac.digest();

  const offset = hash[hash.length - 1] & 0x0f;
  const binary = (hash[offset] & 0x7f) << 24
    | (hash[offset + 1] & 0xff) << 16
    | (hash[offset + 2] & 0xff) << 8
    | (hash[offset + 3] & 0xff);

  const otp = binary % Math.pow(10, TOTP_DIGITS);
  return String(otp).padStart(TOTP_DIGITS, '0');
}

function base32Encode(hex) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const bytes = Buffer.from(hex, 'hex');
  let bits = 0;
  let value = 0;
  let output = '';

  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += alphabet[(value << (5 - bits)) & 31];

  // Pad to multiple of 8
  while (output.length % 8 !== 0) output += '=';

  return output;
}

export default { setup2FA, verifyAndEnable2FA, verifyLogin2FA, disable2FA };
