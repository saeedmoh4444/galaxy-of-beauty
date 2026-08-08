import { describe, it, expect } from 'vitest';
import { appRouter } from '../routers/index';

describe('Beauty Bundles — verified', () => {
  it('should list beauty bundles as public', async () => {
    const caller = (appRouter as any).createCaller({ user: null, ip: '127.0.0.1' });
    const bundles = await caller.beautyBundles.list({ limit: 5 });
    expect(bundles).toBeDefined();
    expect(Array.isArray(bundles)).toBe(true);
  }, 15000);
});
