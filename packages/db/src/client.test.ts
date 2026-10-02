import { describe, expect, it } from 'vitest';

import { prisma } from './client';
import * as barrel from './index';

describe('@galaxy/db client', () => {
  it('instantiates lazily without a live connection (no query issued at import)', () => {
    expect(prisma).toBeDefined();
    expect(typeof prisma.$connect).toBe('function');
    expect(typeof prisma.$disconnect).toBe('function');
  });

  it('exposes the Prisma model delegates expected by the api layer', () => {
    for (const model of ['user', 'booking', 'beautyEvent', 'vendor', 'wallet']) {
      expect(
        (prisma as unknown as Record<string, unknown>)[model],
        `missing model delegate: ${model}`,
      ).toBeDefined();
    }
  });

  it('re-exports prisma from the package barrel', () => {
    expect((barrel as Record<string, unknown>).prisma).toBeDefined();
  });
});
