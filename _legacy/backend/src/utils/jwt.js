import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import logger from '../config/logger.js';
import { AppError, ErrorCodes } from './errors.js';

/**
 * Generate JWT access token.
 * @param {object} payload - { userId, role, email }
 * @returns {string}
 */
export function generateAccessToken(payload) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY,
    issuer: 'galaxy-of-beauty',
  });
}

/**
 * Generate JWT refresh token.
 * @param {object} payload - { userId, role }
 * @returns {string}
 */
export function generateRefreshToken(payload) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY,
    issuer: 'galaxy-of-beauty',
  });
}

/**
 * Verify and decode a JWT token.
 * @param {string} token
 * @param {'access'|'refresh'} type
 * @returns {object} Decoded payload
 * @throws {AppError} if token is invalid or expired
 */
export function verifyToken(token, type = 'access') {
  const secret = type === 'access' ? env.JWT_ACCESS_SECRET : env.JWT_REFRESH_SECRET;
  try {
    return jwt.verify(token, secret, { issuer: 'galaxy-of-beauty' });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Token has expired', 401, ErrorCodes.TOKEN_EXPIRED);
    }
    if (error.name === 'JsonWebTokenError') {
      throw new AppError('Invalid token', 401, ErrorCodes.TOKEN_INVALID);
    }
    throw error;
  }
}

/**
 * Generate token pair for a user.
 * @param {object} user - { id, role, email }
 * @returns {{ accessToken: string, refreshToken: string }}
 */
export function generateTokenPair(user) {
  const payload = { userId: user.id, role: user.role, email: user.email };
  const refreshPayload = { userId: user.id, role: user.role };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(refreshPayload);

  return { accessToken, refreshToken };
}

export default { generateAccessToken, generateRefreshToken, verifyToken, generateTokenPair };
