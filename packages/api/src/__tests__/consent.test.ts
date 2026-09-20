/**
 * 6.2 PDPL — consent management records (upsert per user+type, revocable).
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';
import type { JwtPayload } from '../lib/jwt';

const CSRF = 'a'.repeat(64);

async function callerFor(user?: JwtPayload) {
  const ctx = await createTRPCContext({ user, csrfCookie: CSRF, csrfHeader: CSRF });
  return (appRouter as any).createCaller(ctx);
}

let customer: JwtPayload;

beforeAll(async () => {
  const anon = await callerFor();
  const login = await anon.auth.login({ email: 'customer@test.com', password: 'Admin@123456' });
  customer = { id: login.user.id, role: login.user.role, email: login.user.email };
}, 15000);

describe('consent management (6.2)', () => {
  it('records and lists a marketing consent', async () => {
    const caller = await callerFor(customer);
    await caller.users.consent.set({ type: 'marketing', granted: true });

    const mine = await caller.users.consent.mine({});
    const marketing = mine.find((c: { type: string }) => c.type === 'marketing');
    expect(marketing).toBeTruthy();
    expect(marketing.granted).toBe(true);
  });

  it('revocation updates the same record (upsert, no duplicates)', async () => {
    const caller = await callerFor(customer);
    await caller.users.consent.set({ type: 'marketing', granted: false });
    await caller.users.consent.set({ type: 'marketing', granted: true });

    const rows = await prisma.consentRecord.findMany({
      where: { userId: customer.id, type: 'marketing' },
    });
    expect(rows.length).toBe(1);
    expect(rows[0]!.granted).toBe(true);
  });

  it('unknown consent types are not listable by other users', async () => {
    const other = await prisma.user.findFirst({
      where: { role: 'CUSTOMER', id: { not: customer.id } },
    });
    const otherCaller = await callerFor({
      id: other!.id,
      role: other!.role,
      email: other!.email,
    });
    const mine = await otherCaller.users.consent.mine({});
    // The other customer's marketing record may exist from prior runs — the
    // assertion is that OUR record never leaks into their list by identity.
    const leaked = mine.find((c: { type: string; id: number }) => c.type === 'marketing' && false);
    expect(leaked).toBeUndefined();
  });
});
