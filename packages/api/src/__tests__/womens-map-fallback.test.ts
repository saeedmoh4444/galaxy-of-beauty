/**
 * W2-11 (audit 2026-11-11) — womensServicesMap fallbacks resolved to
 * wrong/no services: 'Beauty Consultation' (the documented fallback) only
 * exists as a KIDS-catalog row, and 'Manicure' is ambiguous with the kids
 * facade. Women's bookings must never land on kids-catalog services.
 */
import { describe, it, expect } from 'vitest';
import { prisma } from '@galaxy/db';
import { resolveWomensServiceId } from '../routers/womensServicesMap';

const UNMAPPED = { categoryKey: 'zz-w2-11-no-such-category', facadeId: 'zz-w2-11-no-such-id' };

describe('womensServicesMap fallbacks (W2-11)', () => {
  it('an unmapped no-match item resolves to the MAIN-catalog consultation row, not the kids one', async () => {
    const id = await resolveWomensServiceId(
      UNMAPPED.categoryKey,
      UNMAPPED.facadeId,
      'ZZZ Nothing Matches At All',
    );
    expect(id).toBeGreaterThan(0);

    const service = await prisma.service.findUniqueOrThrow({
      where: { id },
      include: { category: { select: { slug: true } } },
    });
    expect(service.titleJson).toMatchObject({ en: 'Beauty Consultation' });
    expect(service.category.slug).not.toBe('kids-care');
  });

  it('a manicure-matching item never resolves to a kids-catalog service', async () => {
    const id = await resolveWomensServiceId(UNMAPPED.categoryKey, UNMAPPED.facadeId, 'Manicure');
    expect(id).toBeGreaterThan(0);

    const service = await prisma.service.findUniqueOrThrow({
      where: { id },
      include: { category: { select: { slug: true } } },
    });
    expect(service.category.slug).not.toBe('kids-care');
  });
});
