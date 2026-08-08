import { describe, it, expect } from 'vitest';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';

const CUSTOMER: JwtPayload = { id: 1, role: 'CUSTOMER', email: 'customer@test.com' };
const ADMIN: JwtPayload = { id: 3, role: 'ADMIN', email: 'admin@galaxyofbeauty.sa' };

async function authCaller(user: JwtPayload) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

describe('Gift Cards', () => {
  describe('Success cases', () => {
    it('should check balance with invalid code gracefully', async () => {
      const caller = await authCaller(CUSTOMER);
      await expect(caller.giftCards.checkBalance({ code: 'NONEXISTENT' })).rejects.toThrow();
    }, 15000);

    it('should list my cards as customer', async () => {
      const caller = await authCaller(CUSTOMER);
      const cards = await caller.giftCards.myCards();
      expect(Array.isArray(cards)).toBe(true);
    }, 15000);

    it('should list all cards as admin', async () => {
      const caller = await authCaller(ADMIN);
      const result = await caller.giftCards.listAll({ limit: 10 });
      expect(result).toBeDefined();
    }, 15000);
  });
});
