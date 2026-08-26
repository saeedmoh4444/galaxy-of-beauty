/**
 * Feature flag tests — the requireFeatureFlag middleware end to end.
 *
 * Verifies the seeded default state (all experimental flags enabled,
 * matching pre-gating behavior), the disabled path (NOT_FOUND), and the
 * admin upsert/list round-trip.
 */
import { describe, it, expect, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';
import { EXPERIMENTAL_FEATURES } from '@galaxy/shared';

const CSRF = 'a'.repeat(64);

async function anonCaller() {
  const ctx = await createTRPCContext({ csrfCookie: CSRF, csrfHeader: CSRF });
  return (appRouter as any).createCaller(ctx);
}

async function adminCaller() {
  const ctx = await createTRPCContext({
    user: { id: 1, role: 'ADMIN', email: 'admin@test.local' },
    csrfCookie: CSRF,
    csrfHeader: CSRF,
  });
  return (appRouter as any).createCaller(ctx);
}

const ALL_FLAGS = Object.values(EXPERIMENTAL_FEATURES) as string[];

describe('Feature flags — seeded state', () => {
  it('seeds every experimental flag as enabled', async () => {
    const flags = await prisma.featureFlag.findMany();
    expect(flags).toHaveLength(ALL_FLAGS.length);
    for (const f of flags) {
      expect(f.enabled).toBe(true);
      expect(f.rolloutPercent).toBe(100);
    }
    expect(flags.map((f) => f.key).sort()).toEqual([...ALL_FLAGS].sort());
  });
});

describe('Feature flags — gated routers', () => {
  afterAll(async () => {
    // Restore in case the disabled-path test leaves the flag off.
    await prisma.featureFlag.update({
      where: { key: EXPERIMENTAL_FEATURES.PRODUCT_SCANNER },
      data: { enabled: true, rolloutPercent: 100 },
    });
  });

  it('serves a gated procedure when its flag is enabled', async () => {
    const caller = await anonCaller();
    const palettes = await caller.virtualTryOn.palettes();
    expect(palettes).toHaveProperty('lips');
    expect(palettes).toHaveProperty('nails');
  });

  it('returns NOT_FOUND when the flag is disabled', async () => {
    // Flip BEFORE the first call in this worker: the middleware caches
    // per flag key for 30s, so a prior call would mask the toggle.
    await prisma.featureFlag.update({
      where: { key: EXPERIMENTAL_FEATURES.PRODUCT_SCANNER },
      data: { enabled: false },
    });

    const caller = await anonCaller();
    await expect(caller.productScanner.lookup({ barcode: '6281234567890' })).rejects.toThrow(
      /Feature not available/,
    );
  });
});

describe('Feature flags — admin management', () => {
  it('lists all flags', async () => {
    const caller = await adminCaller();
    const list = await caller.featureFlags.list();
    expect(list.length).toBeGreaterThanOrEqual(ALL_FLAGS.length);
    expect(list[0]).toHaveProperty('key');
    expect(list[0]).toHaveProperty('enabled');
  });

  it('upserts a flag and reflects it in isEnabled', async () => {
    const key = 'TEST_FLAG_ROUNDTRIP';
    const caller = await adminCaller();
    await caller.featureFlags.upsert({
      key,
      name: 'Test Roundtrip Flag',
      enabled: true,
      rolloutPercent: 100,
    });

    const check = await anonCaller();
    const result = await check.featureFlags.isEnabled({ key });
    expect(result.enabled).toBe(true);

    await prisma.featureFlag.delete({ where: { key } });
  });

  it('reports false for unknown flags', async () => {
    const caller = await anonCaller();
    const result = await caller.featureFlags.isEnabled({ key: 'DOES_NOT_EXIST' });
    expect(result.enabled).toBe(false);
  });
});
