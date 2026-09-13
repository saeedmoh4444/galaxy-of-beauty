import { describe, it, expect } from 'vitest';
import { appRouter } from '../routers/index';

describe('Subscriptions', () => {
  describe('Success cases', () => {
    it('should list subscription plans as public', async () => {
      const caller = (appRouter as any).createCaller({ user: null, ip: '127.0.0.1' });
      const plans = await caller.subscriptions.getPlans();
      expect(Array.isArray(plans)).toBe(true);
      expect(plans.length).toBeGreaterThan(0);
      expect(plans[0]).toHaveProperty('nameJson');
      expect(plans[0]).toHaveProperty('priceMonthly');
    }, 15000);
  });

  describe('Error cases', () => {
    it('should reject mySubscription for anonymous users', async () => {
      const caller = (appRouter as any).createCaller({ user: null, ip: '127.0.0.1' });
      await expect(caller.subscriptions.getMySubscription()).rejects.toThrow();
    });
  });
});
