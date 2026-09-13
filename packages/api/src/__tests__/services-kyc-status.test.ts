/**
 * services.getById — technician kycStatus exposure.
 *
 * Phase 3 sprint 2.1: the service-detail UI renders per-card verified badges,
 * so getById's technician mapping must expose kycStatus (raw value — the UI
 * decides when to show the badge, keeping cards honest on mixed sources).
 *
 * Finds its service via prisma (one query) and calls the API once — scanning
 * the list through getById trips the anonymous rate limiter (TOO_MANY_REQUESTS).
 *
 * Run: pnpm --filter @galaxy/api test -- services-kyc-status.test.ts
 */
import { describe, it, expect } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';

const KYC_VALUES = ['PENDING', 'SUBMITTED', 'VERIFIED', 'REJECTED'] as const;

async function anonCaller() {
  const ctx = await createTRPCContext();
  return (appRouter as any).createCaller(ctx);
}

describe('services.getById — technician kycStatus', () => {
  it('exposes kycStatus on every mapped technician', async () => {
    const mapping = await prisma.technicianService.findFirst({
      where: { isActive: true },
      select: { serviceId: true },
    });
    if (!mapping) {
      // No mapped technicians in this dataset — nothing to assert against.
      return;
    }

    const caller = await anonCaller();
    const detail = await caller.services.getById({ id: mapping.serviceId });

    expect((detail.technicianServices ?? []).length).toBeGreaterThan(0);
    for (const ts of detail.technicianServices) {
      expect(ts.technician).toBeDefined();
      expect(ts.technician).toHaveProperty('kycStatus');
      expect(KYC_VALUES).toContain(ts.technician.kycStatus);
    }
  });
});
