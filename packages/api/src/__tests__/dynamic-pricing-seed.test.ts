/**
 * W2-8 (audit 2026-11-11) — the dynamic-pricing engine was dormant: no
 * seeded service had dynamicPricingEnabled, so the peak rules never fired.
 * Runs on the isolated seeded DB (SEED_CONTRACT_DB=1) like the catalog
 * contract — the shared test DB is polluted by parallel fixtures.
 */
import { describe, it, expect } from 'vitest';
import { prisma } from '@galaxy/db';

describe.runIf(process.env['SEED_CONTRACT_DB'] === '1')(
  'dynamic pricing opt-in contract (W2-8)',
  () => {
    it('flagship services are opted into dynamic pricing', async () => {
      const flagship = [
        'Evening Makeup',
        'Airbrush Makeup',
        'Bridal Trial Package',
        'Full Spa Day',
        'Relaxation Massage',
        'Postpartum Recovery Massage',
      ];
      for (const name of flagship) {
        const enabled = await prisma.service.count({
          where: {
            isActive: true,
            dynamicPricingEnabled: true,
            titleJson: { path: ['en'], equals: name },
          },
        });
        expect(enabled, `no opted-in row for ${name}`).toBeGreaterThan(0);
      }
    });

    it('the peak rules exist', async () => {
      const rules = await prisma.servicePricing.count({ where: { isActive: true } });
      expect(rules).toBeGreaterThan(0);
    });
  },
);
