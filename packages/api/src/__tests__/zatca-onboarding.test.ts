/**
 * 6.1d — ZATCA onboarding (real portal integration foundations).
 *
 * requestComplianceCsid POSTs the CSR to the ZATCA compliance endpoint
 * (sandbox default) and stores the returned credential; status surfaces
 * are masked (no key material). fetch is mocked — no network.
 */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { buildUser } from './factories';
import type { JwtPayload } from '../lib/jwt';

const createdUserIds: number[] = [];

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

async function makeUser(role: 'CUSTOMER' | 'ADMIN' = 'ADMIN'): Promise<JwtPayload> {
  const user = await prisma.user.create({ data: buildUser({ role }) });
  createdUserIds.push(user.id);
  return { id: user.id, role: user.role as JwtPayload['role'], email: user.email };
}

let admin: JwtPayload;
let customer: JwtPayload;

beforeAll(async () => {
  admin = await makeUser('ADMIN');
  customer = await makeUser('CUSTOMER');
  await prisma.zatcaCredential.deleteMany({ where: { env: 'sandbox' } });
}, 15000);

afterAll(async () => {
  try {
    await prisma.zatcaCredential.deleteMany({ where: { env: 'sandbox' } });
  } catch {
    /* best-effort */
  }
  try {
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  } catch {
    /* best-effort */
  }
});

describe('zatca onboarding', () => {
  it('reports an empty status before onboarding', async () => {
    const status = await (await caller(admin)).zatca.onboardingStatus();
    expect(status.env).toBe('sandbox');
    expect(status.credential).toBeNull();
  });

  it('requests a compliance CSID and stores the credential', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        binarySecurityToken: 'b64-token',
        secret: 'secret-123',
        certificate: '-----BEGIN CERTIFICATE-----\nabc\n-----END CERTIFICATE-----',
        requestID: 'req-1',
      }),
    }));
    vi.stubGlobal('fetch', fetchMock);

    try {
      const res = await (await caller(admin)).zatca.requestComplianceCsid({ otp: '123345' });
      expect(res.status).toBe('ACTIVE');
      expect(res.requestId).toBe('req-1');

      const row = await prisma.zatcaCredential.findUniqueOrThrow({
        where: { env: 'sandbox' },
      });
      expect(row.status).toBe('ACTIVE');
      expect(row.binarySecurityToken).toBe('b64-token');
      expect(row.certificatePem).toContain('BEGIN CERTIFICATE');
      // The CSR was POSTed with the OTP as Basic auth.
      const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
      expect(url).toContain('compliance');
      // ZATCA compliance CSID request authenticates with the OTP header.
      const otp = String((init.headers as Record<string, string>)['OTP'] ?? '');
      expect(otp).toBe('123345');
      expect(String((init.headers as Record<string, string>)['Accept-Version'] ?? '')).toBe('V2');
      const body = JSON.parse(String(init.body)) as { csr: string };
      expect(body.csr).toContain('CERTIFICATE REQUEST');
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('stores a FAILED credential on API errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, text: async () => 'invalid OTP' })),
    );
    try {
      const res = await (await caller(admin)).zatca.requestComplianceCsid({ otp: 'bad0' });
      expect(res.status).toBe('FAILED');
      const row = await prisma.zatcaCredential.findUniqueOrThrow({
        where: { env: 'sandbox' },
      });
      expect(row.status).toBe('FAILED');
      expect(row.errorMessage).toContain('invalid OTP');
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('masks key material in the status surface', async () => {
    const status = await (await caller(admin)).zatca.onboardingStatus();
    expect(status.credential).not.toBeNull();
    expect(JSON.stringify(status)).not.toContain('b64-token');
    expect(JSON.stringify(status)).not.toContain('PRIVATE KEY');
  });

  it('rejects non-admin onboarding', async () => {
    const c = await caller(customer);
    await expect(c.zatca.onboardingStatus()).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(c.zatca.requestComplianceCsid({ otp: '123345' })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });
});
