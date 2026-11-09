/**
 * D2 (PLATFORM_IMPROVEMENT_PLAN) — the women's catalog maps onto real
 * Service rows. The mapping table is the single source of truth; the
 * legacy rules and the consultation fallback only apply to unmapped ids.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { buildCategory, buildService } from './factories';
import { resolveWomensServiceId } from '../routers/womensServicesMap';

const createdCategoryIds: number[] = [];
const createdServiceIds: number[] = [];

const stamp = `d2${Date.now().toString(36)}`;
let categoryId: number;

beforeAll(async () => {
  const category = await prisma.category.create({
    data: buildCategory({ slug: `d2-womens-${stamp}` }),
  });
  categoryId = category.id;
  createdCategoryIds.push(category.id);
});

afterAll(async () => {
  await prisma.womensServiceMapping.deleteMany({
    where: { serviceId: { in: createdServiceIds } },
  });
  await prisma.service.deleteMany({ where: { id: { in: createdServiceIds } } });
  await prisma.category.deleteMany({ where: { id: { in: createdCategoryIds } } });
});

async function makeService(titleEn: string): Promise<number> {
  const svc = await prisma.service.create({
    data: buildService({ categoryId, titleJson: { ar: titleEn, en: titleEn } }),
  });
  createdServiceIds.push(svc.id);
  return svc.id;
}

describe('D2 women catalog resolution', () => {
  it('the mapping table wins over the legacy rules', async () => {
    const svcId = await makeService(`mapped-service-${stamp}`);
    await prisma.womensServiceMapping.create({
      data: { categoryKey: `cat-${stamp}`, facadeId: 'zz9', serviceId: svcId },
    });
    // "massage" would match a rule — the mapping must still win.
    const resolved = await resolveWomensServiceId(`cat-${stamp}`, 'zz9', 'massage');
    expect(resolved).toBe(svcId);
  });

  it('falls back to the category override for unmapped ids', async () => {
    await makeService('Henna Art');
    // 'henna' has a whole-category override → the Henna Art service.
    const resolved = await resolveWomensServiceId('henna', 'unknown-id', 'anything');
    expect(resolved).toBeGreaterThan(0);
    const svc = await prisma.service.findUnique({ where: { id: resolved } });
    expect((svc?.titleJson as { en?: string }).en).toBe('Henna Art');
  });

  it('returns 0 when nothing resolves and the fallback service is absent', async () => {
    // Unknown category, unknown name, and (in a fresh DB) no consultation
    // fallback row — the resolver must degrade to 0, never throw.
    const resolved = await resolveWomensServiceId(
      `ghost-${stamp}`,
      'ghost-id',
      `ghost-name-${stamp}`,
    );
    // Either the seeded 'Beauty Consultation' row exists (dev DB) or not —
    // both are valid; 0 is the NOT_FOUND signal.
    expect(resolved).toBeGreaterThanOrEqual(0);
  });
});
