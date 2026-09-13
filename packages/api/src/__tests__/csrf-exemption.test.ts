/**
 * CSRF exemption for non-browser clients (native apps, curl).
 *
 * Browsers always send an Origin header on POST; native HTTP clients
 * (React Native fetch, curl) do not. CSRF protects browser cookie
 * sessions — a request with no Origin has no ambient cookie jar the
 * attacker could ride, so the guard is skipped for those requests.
 *
 * Deliberately constructs contexts WITHOUT csrfCookie/csrfHeader to
 * prove the exemption, and asserts the browser path (Origin present)
 * remains protected.
 */
import { describe, it, expect } from 'vitest';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';
import type { JwtPayload } from '../lib/jwt';

const BROWSER_ORIGIN = 'http://localhost:3000';

async function caller(opts: { user?: JwtPayload | null; origin?: string | null }) {
  const ctx = await createTRPCContext({
    user: opts.user ?? null,
    origin: opts.origin ?? null,
  });
  return (appRouter as any).createCaller(ctx);
}

describe('CSRF exemption for non-browser clients', () => {
  it('allows public mutations without CSRF when no Origin header (native app login)', async () => {
    const c = await caller({});
    const result = await c.auth.login({ email: 'customer@test.com', password: 'Admin@123456' });
    expect(result.accessToken).toBeDefined();
  });

  it('still blocks public mutations without CSRF when Origin is present (browser)', async () => {
    const c = await caller({ origin: BROWSER_ORIGIN });
    await expect(
      c.auth.login({ email: 'customer@test.com', password: 'Admin@123456' }),
    ).rejects.toThrow();
  });

  it('allows protected mutations without CSRF when no Origin header (native app top-up)', async () => {
    // Login to resolve the seed customer's real id (seed assigns dynamic ids)
    const login = await (
      await caller({})
    ).auth.login({
      email: 'customer@test.com',
      password: 'Admin@123456',
    });
    const user: JwtPayload = { id: login.user.id, role: login.user.role, email: login.user.email };

    const c = await caller({ user });
    const result = await c.wallet.topUp({
      amount: 50,
      idempotencyKey: `exempt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    });
    expect(result).toHaveProperty('balance');
  });

  it('still blocks protected mutations without CSRF when Origin is present (browser)', async () => {
    // Login to resolve the seed customer's real id (seed assigns dynamic ids)
    const login = await (
      await caller({})
    ).auth.login({
      email: 'customer@test.com',
      password: 'Admin@123456',
    });
    const user: JwtPayload = { id: login.user.id, role: login.user.role, email: login.user.email };

    const c = await caller({ user, origin: BROWSER_ORIGIN });
    await expect(
      c.wallet.topUp({ amount: 50, idempotencyKey: `exempt_${Date.now()}_${Date.now()}` }),
    ).rejects.toThrow();
  });
});
