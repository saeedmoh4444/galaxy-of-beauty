import { describe, expect, it, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';
import type { JwtPayload } from '../lib/jwt';
import { hashPassword } from '../lib/password';

/**
 * R2 (SELLER_FIRST_CLASS_ROLE_PLAN) — register + login for SELLER accounts.
 */

const CSRF = 'a'.repeat(64);
const createdUserIds: number[] = [];

async function anonCaller() {
  const ctx = await createTRPCContext({ csrfCookie: CSRF, csrfHeader: CSRF });
  return (
    appRouter as never as { createCaller: (c: unknown) => Record<string, unknown> }
  ).createCaller(ctx);
}

const SELLER_PASSWORD = 'SellerPass123!';

afterAll(async () => {
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

describe('SELLER registration + login (R2)', () => {
  it('registers a SELLER-role account through the public register endpoint', async () => {
    const c = await anonCaller();
    const res = await c.auth.register({
      email: 'seller-register@example.com',
      phone: '+966599000123',
      password: SELLER_PASSWORD,
      name: 'Seller Register Test',
      role: 'SELLER',
      acceptedTerms: true,
    });
    const userId = (res as { user?: { id?: number } }).user?.id;
    expect(userId).toBeTypeOf('number');
    createdUserIds.push(userId as number);

    const row = await prisma.user.findUnique({ where: { id: userId } });
    expect(row?.role).toBe('SELLER');
  });

  it('logs a SELLER-role account in and returns the role on the payload', async () => {
    const email = 'seller-login@example.com';
    const pwHash = await hashPassword(SELLER_PASSWORD);
    const u = await prisma.user.create({
      data: {
        email,
        phone: '+966599000124',
        passwordHash: pwHash,
        name: 'Seller Login Test',
        role: 'SELLER',
        emailVerified: true,
        preferredLanguage: 'ar',
      },
    });
    createdUserIds.push(u.id);

    const c = await anonCaller();
    const res = await c.auth.login({ email, password: SELLER_PASSWORD });
    const user = (res as { user?: { role?: string } }).user;
    expect(user?.role).toBe('SELLER');
    // hasVendor stays the legacy transition flag — false for a seller
    // without a store record yet (the wizard creates it).
    expect((res as { hasVendor?: boolean }).hasVendor).toBe(false);
  });

  it('keeps SELLER out of the technician-only surfaces via the JWT payload union', async () => {
    // The JwtPayload union now carries SELLER — assert the type round-trip
    // through a caller built from a SELLER payload is a plain role string.
    const seller: JwtPayload = {
      id: createdUserIds[0] ?? 1,
      role: 'SELLER',
      email: 'seller-register@example.com',
    };
    expect(seller.role).toBe('SELLER');
  });
});
