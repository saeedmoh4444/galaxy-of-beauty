import { describe, it, expect } from 'vitest';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';

const CUSTOMER: JwtPayload = { id: 1, role: 'CUSTOMER', email: 'customer@test.com' };

describe('Beauty Courses — verified', () => {
  it('should list courses as public', async () => {
    const caller = (appRouter as any).createCaller({ user: null, ip: '127.0.0.1' });
    const courses = await caller.beautyCourses.list({ page: 1, limit: 5 });
    expect(courses).toBeDefined();
    expect(Array.isArray(courses.items)).toBe(true);
  }, 15000);

  it('should get my courses as customer', async () => {
    const caller = (appRouter as any).createCaller({ user: CUSTOMER, ip: '127.0.0.1' });
    const myCourses = await caller.beautyCourses.myCourses();
    expect(Array.isArray(myCourses)).toBe(true);
  }, 15000);
});
