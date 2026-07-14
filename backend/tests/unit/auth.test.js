/**
 * Unit tests for auth service — JWT, bcrypt, token rotation.
 */
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateTokenPair, generateAccessToken, generateRefreshToken, verifyToken } from '../../src/utils/jwt.js';
import { AppError } from '../../src/utils/errors.js';

// Mock env vars (already set in tests/setup.js)

describe('Auth Utilities', () => {
  describe('generateAccessToken', () => {
    it('should generate a valid JWT access token', () => {
      const payload = { userId: 1, role: 'CUSTOMER', email: 'test@example.com' };
      const token = generateAccessToken(payload);

      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');

      const decoded = jwt.decode(token);
      expect(decoded.userId).toBe(1);
      expect(decoded.role).toBe('CUSTOMER');
      expect(decoded.email).toBe('test@example.com');
      expect(decoded.iss).toBe('galaxy-of-beauty');
    });

    it('should expire after specified time', () => {
      const payload = { userId: 1, role: 'CUSTOMER' };
      const token = generateAccessToken(payload); // 15m default

      const decoded = jwt.decode(token);
      expect(decoded.exp).toBeDefined();
      expect(decoded.exp - decoded.iat).toBe(900); // 15 minutes
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token with 7 day expiry', () => {
      const payload = { userId: 1, role: 'CUSTOMER' };
      const token = generateRefreshToken(payload);

      const decoded = jwt.decode(token);
      expect(decoded.userId).toBe(1);
      expect(decoded.iss).toBe('galaxy-of-beauty');
      expect(decoded.exp - decoded.iat).toBe(604800); // 7 days
    });
  });

  describe('generateTokenPair', () => {
    it('should return both access and refresh tokens', () => {
      const user = { id: 1, role: 'CUSTOMER', email: 'test@example.com' };
      const tokens = generateTokenPair(user);

      expect(tokens.accessToken).toBeTruthy();
      expect(tokens.refreshToken).toBeTruthy();
      expect(tokens.accessToken).not.toBe(tokens.refreshToken);
    });

    it('should include user info in access token but not refresh token', () => {
      const user = { id: 5, role: 'TECHNICIAN', email: 'tech@example.com' };
      const tokens = generateTokenPair(user);

      const accessDecoded = jwt.decode(tokens.accessToken);
      const refreshDecoded = jwt.decode(tokens.refreshToken);

      expect(accessDecoded.email).toBe('tech@example.com');
      expect(refreshDecoded.email).toBeUndefined();
    });
  });

  describe('verifyToken', () => {
    it('should verify and decode a valid token', () => {
      const payload = { userId: 1, role: 'CUSTOMER' };
      const token = generateAccessToken(payload);

      const decoded = verifyToken(token, 'access');
      expect(decoded.userId).toBe(1);
      expect(decoded.role).toBe('CUSTOMER');
    });

    it('should throw AppError for expired token', () => {
      const expiredToken = jwt.sign(
        { userId: 1 },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: '-1s', issuer: 'galaxy-of-beauty' },
      );

      expect(() => verifyToken(expiredToken, 'access')).toThrow(AppError);
    });

    it('should throw AppError for invalid token', () => {
      expect(() => verifyToken('invalid.token.here', 'access')).toThrow(AppError);
    });

    it('should throw AppError when using wrong secret type', () => {
      const token = generateRefreshToken({ userId: 1, role: 'CUSTOMER' });
      expect(() => verifyToken(token, 'access')).toThrow(AppError);
    });
  });
});

describe('Password Hashing (bcrypt)', () => {
  it('should hash password and verify correctly', async () => {
    const password = 'MySecurePass1';
    const hash = await bcrypt.hash(password, 12);

    expect(hash).toBeTruthy();
    expect(hash).not.toBe(password);
    expect(hash.startsWith('$2b$12$')).toBe(true);

    const isValid = await bcrypt.compare(password, hash);
    expect(isValid).toBe(true);

    const isInvalid = await bcrypt.compare('WrongPassword1', hash);
    expect(isInvalid).toBe(false);
  });

  it('should produce different hashes for the same password', async () => {
    const password = 'SamePass1';
    const hash1 = await bcrypt.hash(password, 12);
    const hash2 = await bcrypt.hash(password, 12);

    expect(hash1).not.toBe(hash2);
    expect(await bcrypt.compare(password, hash1)).toBe(true);
    expect(await bcrypt.compare(password, hash2)).toBe(true);
  });
});
