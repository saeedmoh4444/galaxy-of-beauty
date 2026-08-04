/**
 * Health Endpoint — Automated verification.
 * Tests that the health endpoint correctly reports DB + Redis status.
 */
import { describe, it, expect } from 'vitest';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';

const CSRF = 'a'.repeat(64);

async function anonCaller() {
  const ctx = await createTRPCContext({ csrfCookie: CSRF, csrfHeader: CSRF });
  return (appRouter as any).createCaller(ctx);
}

describe('Health Endpoint', () => {
  it('should return ok or degraded status', async () => {
    const caller = await anonCaller();
    const result = await caller.health();
    expect(['ok', 'degraded']).toContain(result.status);
  });

  it('should include database check result', async () => {
    const caller = await anonCaller();
    const result = await caller.health();
    expect(result.checks).toHaveProperty('database');
    expect(['ok', 'error']).toContain(result.checks.database);
  });

  it('should include redis check result', async () => {
    const caller = await anonCaller();
    const result = await caller.health();
    expect(result.checks).toHaveProperty('redis');
    expect(['ok', 'error', 'unavailable']).toContain(result.checks.redis);
  });

  it('should include version and uptime', async () => {
    const caller = await anonCaller();
    const result = await caller.health();
    expect(result).toHaveProperty('version');
    expect(result).toHaveProperty('uptime');
    expect(typeof result.uptime).toBe('number');
    expect(result.uptime).toBeGreaterThanOrEqual(0);
  });

  it('should include timestamp', async () => {
    const caller = await anonCaller();
    const result = await caller.health();
    expect(result).toHaveProperty('timestamp');
    expect(new Date(result.timestamp).getTime()).toBeGreaterThan(0);
  });

  // Security: health endpoint must be public (no auth required)
  it('should be accessible without authentication', async () => {
    const caller = await anonCaller();
    const result = await caller.health();
    expect(result.status).toBeDefined();
  });

  // Rate limiting: health must be under public rate limit (20/min)
  it('should be under rate limit for repeated calls', async () => {
    const caller = await anonCaller();
    for (let i = 0; i < 5; i++) {
      const result = await caller.health();
      expect(result.status).toBeDefined();
    }
  });
});
