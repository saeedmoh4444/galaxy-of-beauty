import { describe, it, expect } from 'vitest';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';

const CUSTOMER: JwtPayload = { id: 1, role: 'CUSTOMER', email: 'customer@test.com' };
const ADMIN: JwtPayload = { id: 3, role: 'ADMIN', email: 'admin@galaxyofbeauty.sa' };

async function authCaller(user: JwtPayload) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

describe('Marketplace', () => {
  describe('Success cases', () => {
    it('should list products as public', async () => {
      const caller = (appRouter as any).createCaller({ user: null, ip: '127.0.0.1' });
      const result = await caller.marketplace.products({ page: 1, limit: 5 });
      expect(result).toBeDefined();
      expect(result).toHaveProperty('items');
      expect(Array.isArray(result.items)).toBe(true);
    }, 15000);

    it('should list product categories as public', async () => {
      const caller = (appRouter as any).createCaller({ user: null, ip: '127.0.0.1' });
      const cats = await caller.marketplace.productCategories();
      expect(Array.isArray(cats)).toBe(true);
    }, 15000);

    it('should get cart as customer', async () => {
      const caller = await authCaller(CUSTOMER);
      const cart = await caller.marketplace.cart();
      expect(cart).toBeDefined();
      expect(Array.isArray(cart)).toBe(true);
    }, 15000);
  });

  describe('Error cases', () => {
    it('should reject cart access for anonymous users', async () => {
      const caller = (appRouter as any).createCaller({ user: null, ip: '127.0.0.1' });
      await expect(caller.marketplace.cart()).rejects.toThrow();
    });
  });
});
