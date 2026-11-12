/**
 * W2-1 (audit 2026-11-11) — the seeded catalog must be BOOKABLE: every
 * service has at least one technician, and every visible category has at
 * least one bookable service.
 *
 * This contract can only be asserted against a PURE seeded database: the
 * main CI unit-test run shares one DB across parallel vitest workers whose
 * fixtures create unmapped services, so it must run in its own CI step on
 * an isolated, freshly seeded DB (SEED_CONTRACT_DB=1 + DATABASE_URL
 * override in ci.yml). Locally, the throwaway-DB recipe sets the same env.
 */
import { describe, it, expect } from 'vitest';
import { prisma } from '@galaxy/db';

describe.runIf(process.env['SEED_CONTRACT_DB'] === '1')(
  'W2 catalog bookability contract (seed)',
  () => {
    it('every seeded service has at least one technician', async () => {
      const orphaned = await prisma.service.count({
        where: { technicianServices: { none: {} } },
      });
      expect(orphaned).toBe(0);
    });

    it('every visible seeded category that owns services has a bookable one', async () => {
      const categories = await prisma.category.findMany({
        select: { id: true, slug: true },
      });
      const hidden = new Set(['mens-grooming']);
      for (const c of categories) {
        if (hidden.has(c.slug)) continue;
        const total = await prisma.service.count({ where: { categoryId: c.id } });
        // Subcategory chips intentionally resolve to their root parents
        // (seed design) and may own zero services — bookability only
        // applies to categories that actually own services.
        if (total === 0) continue;
        const bookable = await prisma.service.count({
          where: { categoryId: c.id, technicianServices: { some: {} } },
        });
        expect(bookable, `category ${c.slug} has no bookable service`).toBeGreaterThan(0);
      }
    });

    it('the D2 womens-services rows are covered too', async () => {
      const mapping = await prisma.womensServiceMapping.count();
      if (mapping === 0) return; // older seed without the D2 mapping — nothing to check
      const uncovered = await prisma.service.count({
        where: { womensMappings: { some: {} }, technicianServices: { none: {} } },
      });
      expect(uncovered).toBe(0);
    });
  },
);
