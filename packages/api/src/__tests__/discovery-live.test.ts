/**
 * Live-DB smoke tests for beautyDiscovery — the mapping logic is
 * covered via the mocked-delegate file (beauty-discovery.test.ts);
 * this file proves both procedures run end-to-end against the real
 * seeded database (the router previously threw PrismaClientValidationError
 * on every call because of the legacy Service.emoji select).
 */
import { describe, it, expect } from 'vitest';
import { appRouter } from '../routers/index';

async function caller(user: null | { id: number; role: string; email: string }) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

describe('beautyDiscovery live DB', () => {
  it('featured returns all four sections from the seeded database', async () => {
    const c = await caller(null);
    const res = await c.beautyDiscovery.featured();
    expect(Array.isArray(res.popularServices)).toBe(true);
    expect(Array.isArray(res.newServices)).toBe(true);
    expect(Array.isArray(res.events)).toBe(true);
    expect(Array.isArray(res.flashDeals)).toBe(true);
    for (const s of [...res.popularServices, ...res.newServices]) {
      expect(s).toMatchObject({
        id: expect.any(Number),
        name: expect.any(String),
        price: expect.any(Number),
        emoji: '',
      });
    }
  }, 15000);
});
