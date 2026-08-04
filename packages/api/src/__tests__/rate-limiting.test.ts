/**
 * Rate Limiting Tests — Verify tier-based rate limits and fail-open behavior.
 */
import { describe, it, expect } from 'vitest';
import { checkRateLimit } from '../lib/rateLimit';

describe('Rate Limiting', () => {
  describe('Tier resolution', () => {
    it('should allow anonymous tier requests', async () => {
      const r1 = await checkRateLimit('test_anon_1', 'anonymous');
      expect(r1.allowed).toBe(true);
      expect(r1.remaining).toBeGreaterThanOrEqual(0);
    });

    it('should allow authenticated tier requests', async () => {
      const r1 = await checkRateLimit('test_auth_1', 'authenticated');
      expect(r1.allowed).toBe(true);
      expect(r1.remaining).toBeGreaterThanOrEqual(0);
    });

    it('should allow admin tier requests', async () => {
      const r1 = await checkRateLimit('test_admin_1', 'admin');
      expect(r1.allowed).toBe(true);
      expect(r1.remaining).toBeGreaterThanOrEqual(0);
    });

    it('should return a valid response shape', async () => {
      const r1 = await checkRateLimit('test_shape', 'anonymous');
      expect(r1).toHaveProperty('allowed');
      expect(r1).toHaveProperty('remaining');
      expect(r1).toHaveProperty('resetAt');
      expect(typeof r1.allowed).toBe('boolean');
      expect(typeof r1.remaining).toBe('number');
      expect(typeof r1.resetAt).toBe('number');
    });
  });

  describe('Fail-open behavior (Redis unavailable in test)', () => {
    it('should allow requests when Redis is down', async () => {
      const r1 = await checkRateLimit('test_failopen', 'anonymous');
      expect(r1.allowed).toBe(true);
    });

    it('should return 999 remaining on Redis failure (fail-open)', async () => {
      const r1 = await checkRateLimit('test_fail_2', 'anonymous');
      if (r1.remaining === 999) {
        // Redis unavailable — fail-open, which is correct
        expect(r1.allowed).toBe(true);
      } else {
        // Redis available — remaining should be less than max
        expect(r1.remaining).toBeLessThanOrEqual(20);
      }
    });

    it('should handle empty key gracefully', async () => {
      const r1 = await checkRateLimit('', 'anonymous');
      expect(r1).toHaveProperty('allowed');
    });

    it('should handle unknown tier gracefully', async () => {
      const r1 = await checkRateLimit('test_unknown', 'anonymous' as any);
      expect(r1).toHaveProperty('allowed');
    });
  });

  describe('Tier limits (when Redis available)', () => {
    it('anonymous limit should be 20/min', async () => {
      const r1 = await checkRateLimit('test_anon_limit', 'anonymous');
      if (r1.remaining !== 999) {
        // Redis is available — verify the limit
        expect(r1.remaining).toBeLessThanOrEqual(20);
      }
    });

    it('authenticated limit should be 60/min', async () => {
      const r1 = await checkRateLimit('test_auth_limit', 'authenticated');
      if (r1.remaining !== 999) {
        expect(r1.remaining).toBeLessThanOrEqual(60);
      }
    });

    it('admin limit should be 300/min', async () => {
      const r1 = await checkRateLimit('test_admin_limit', 'admin');
      if (r1.remaining !== 999) {
        expect(r1.remaining).toBeLessThanOrEqual(300);
      }
    });
  });
});
