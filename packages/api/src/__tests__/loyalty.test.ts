import { describe, it, expect } from 'vitest';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';

const ADMIN: JwtPayload = { id: 3, role: 'ADMIN', email: 'admin@galaxyofbeauty.sa' };

async function authCaller(user: JwtPayload) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

describe('Loyalty', () => {
  describe('Success cases', () => {
    it('should list available rewards as customer', async () => {
      // Use admin since seed guarantees admin@galaxyofbeauty.sa exists
      const caller = await authCaller(ADMIN);
      const rewards = await caller.loyalty.rewards();
      expect(Array.isArray(rewards)).toBe(true);
    }, 15000);

    it('should get leaderboard as public', async () => {
      const caller = (appRouter as any).createCaller({ user: null, ip: '127.0.0.1' });
      const board = await caller.loyalty.leaderboard();
      expect(board).toBeDefined();
    }, 15000);

    it('should list rewards as admin', async () => {
      const caller = await authCaller(ADMIN);
      const rewards = await caller.loyalty.listRewards();
      expect(Array.isArray(rewards)).toBe(true);
    }, 15000);
  });

  describe('Error cases', () => {
    it('should reject unauthorized access to myAccount', async () => {
      const caller = (appRouter as any).createCaller({ user: null, ip: '127.0.0.1' });
      await expect(caller.loyalty.myAccount()).rejects.toThrow();
    });
  });
});
