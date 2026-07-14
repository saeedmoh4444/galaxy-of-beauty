import { describe, it, expect } from 'vitest';
import {
  generateCsrfToken,
  verifyCsrfToken,
  isCsrfRequired,
  buildCsrfCookie,
  getCsrfCookieName,
  getCsrfHeaderName,
} from '../lib/csrf';

describe('CSRF Token', () => {
  describe('generateCsrfToken', () => {
    it('should generate a 64-character hex string', () => {
      const token = generateCsrfToken();
      expect(token).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should generate unique tokens on each call', () => {
      const token1 = generateCsrfToken();
      const token2 = generateCsrfToken();
      expect(token1).not.toBe(token2);
    });

    it('should generate tokens of consistent length', () => {
      const tokens = Array.from({ length: 10 }, () => generateCsrfToken());
      tokens.forEach((t) => expect(t.length).toBe(64));
    });
  });

  describe('verifyCsrfToken', () => {
    it('should verify matching tokens', () => {
      const token = generateCsrfToken();
      expect(verifyCsrfToken(token, token)).toBe(true);
    });

    it('should reject mismatched tokens', () => {
      const token1 = generateCsrfToken();
      const token2 = generateCsrfToken();
      expect(verifyCsrfToken(token1, token2)).toBe(false);
    });

    it('should reject null cookie', () => {
      expect(verifyCsrfToken(null, generateCsrfToken())).toBe(false);
    });

    it('should reject null header', () => {
      expect(verifyCsrfToken(generateCsrfToken(), null)).toBe(false);
    });

    it('should reject undefined values', () => {
      expect(verifyCsrfToken(undefined, undefined)).toBe(false);
    });

    it('should reject non-hex strings', () => {
      expect(verifyCsrfToken('not-a-valid-hex-token-with-64-chars-length-here!!', 'a'.repeat(64))).toBe(false);
    });

    it('should reject tokens of wrong length', () => {
      expect(verifyCsrfToken('abc123', 'abc123')).toBe(false);
    });

    it('should handle empty strings', () => {
      expect(verifyCsrfToken('', '')).toBe(false);
    });
  });

  describe('isCsrfRequired', () => {
    it('should require CSRF for POST', () => {
      expect(isCsrfRequired('POST')).toBe(true);
    });

    it('should require CSRF for PUT', () => {
      expect(isCsrfRequired('PUT')).toBe(true);
    });

    it('should require CSRF for DELETE', () => {
      expect(isCsrfRequired('DELETE')).toBe(true);
    });

    it('should require CSRF for PATCH', () => {
      expect(isCsrfRequired('PATCH')).toBe(true);
    });

    it('should NOT require CSRF for GET', () => {
      expect(isCsrfRequired('GET')).toBe(false);
    });

    it('should NOT require CSRF for HEAD', () => {
      expect(isCsrfRequired('HEAD')).toBe(false);
    });

    it('should NOT require CSRF for OPTIONS', () => {
      expect(isCsrfRequired('OPTIONS')).toBe(false);
    });

    it('should be case-insensitive', () => {
      expect(isCsrfRequired('post')).toBe(true);
      expect(isCsrfRequired('get')).toBe(false);
    });
  });

  describe('buildCsrfCookie', () => {
    it('should build a valid Set-Cookie string', () => {
      const token = generateCsrfToken();
      const cookie = buildCsrfCookie(token);
      expect(cookie).toContain('csrf-token=');
      expect(cookie).toContain(token);
      expect(cookie).toContain('Path=/');
      expect(cookie).toContain('SameSite=Strict');
    });
  });

  describe('getCsrfCookieName', () => {
    it('should return csrf-token', () => {
      expect(getCsrfCookieName()).toBe('csrf-token');
    });
  });

  describe('getCsrfHeaderName', () => {
    it('should return x-csrf-token', () => {
      expect(getCsrfHeaderName()).toBe('x-csrf-token');
    });
  });
});
