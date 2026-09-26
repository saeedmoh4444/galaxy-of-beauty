/**
 * Router-inventory snapshot gate (the contract test, 7.2).
 *
 * Walks appRouter._def.procedures (tRPC v11: routers carry
 * `_def.router === true`, leaves carry `_def.type`) and snapshots the full
 * API surface: procedure path, type (query/mutation), and auth tier. Any
 * unintended rename/removal/addition of API surface fails CI here.
 *
 * Bump ritual (intentional API change):
 *   pnpm --filter @galaxy/api exec vitest run src/__tests__/router-inventory.test.ts -u
 * then review the .snap diff — renames appear as delete+add pairs.
 *
 * Tiers are stamped at the factory level in src/trpc.ts via
 * .meta({ tier: ... }); meta propagates through .use() chains (asserted below).
 */
import { describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import type { AnyRouter } from '@trpc/server';

import { appRouter } from '../routers/index';
import { customerProcedure } from '../trpc';

type LeafDef = {
  type?: 'query' | 'mutation' | 'subscription';
  meta?: { tier?: string };
};

const hasRouterFlag = (def: unknown): boolean =>
  typeof def === 'object' && def !== null && (def as { router?: boolean }).router === true;

/** Recursive walk → sorted `path\ttype\ttier` lines, dot-joined like client calls. */
function inventory(router: AnyRouter, prefix = '', lines: string[] = []): string[] {
  const def = (router as unknown as { _def: { procedures: Record<string, unknown> } })._def;
  for (const [name, entry] of Object.entries(def.procedures).sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    const entryDef = (entry as { _def: unknown })._def;
    const path = prefix ? `${prefix}.${name}` : name;
    if (hasRouterFlag(entryDef)) {
      inventory(entry as unknown as AnyRouter, path, lines);
    } else {
      const leaf = entryDef as LeafDef;
      lines.push(`${path}\t${leaf.type ?? 'unknown'}\t${leaf.meta?.tier ?? 'unknown'}`);
    }
  }
  return lines;
}

describe('router inventory', () => {
  it('tier meta propagates through .use() chains', () => {
    // customerProcedure is stamped `customer` in trpc.ts; chaining more
    // middlewares (exactly what customerMutation does) must keep the tier.
    const chained = customerProcedure.use(async ({ ctx, next }) => next({ ctx }));
    const meta = (chained as unknown as { _def: { meta?: { tier?: string } } })._def.meta;
    expect(meta?.tier).toBe('customer');
  });

  it('every procedure carries a known auth tier', () => {
    const lines = inventory(appRouter);
    const unknown = lines.filter((l) => l.endsWith('\tunknown'));
    expect(unknown, `procedures missing a tier meta:\n${unknown.join('\n')}`).toEqual([]);
  });

  it('matches the canonical counts summary', () => {
    const lines = inventory(appRouter);
    const counts = {
      procedures: lines.length,
      queries: lines.filter((l) => l.includes('\tquery\t')).length,
      mutations: lines.filter((l) => l.includes('\tmutation\t')).length,
      subscriptions: lines.filter((l) => l.includes('\tsubscription\t')).length,
      byTier: Object.fromEntries(
        ['public', 'protected', 'customer', 'technician', 'admin', 'staff'].map((tier) => [
          tier,
          lines.filter((l) => l.endsWith(`\t${tier}`)).length,
        ]),
      ),
    };
    expect(counts).toMatchInlineSnapshot(`
      {
        "byTier": {
          "admin": 185,
          "customer": 481,
          "protected": 102,
          "public": 236,
          "staff": 0,
          "technician": 45,
        },
        "mutations": 440,
        "procedures": 1049,
        "queries": 609,
        "subscriptions": 0,
      }
    `);
  });

  it('matches the canonical procedure list (detail snapshot)', () => {
    expect(inventory(appRouter).join('\n')).toMatchSnapshot();
  });

  it('matches the canonical procedure list hash', () => {
    const hash = createHash('sha256').update(inventory(appRouter).join('\n')).digest('hex');
    expect(hash).toMatchInlineSnapshot(
      `"75aea3ede45b0deb43fd5f9eb3863f35264ba0b43368cb5d0ddae0d6ae9d595c"`,
    );
  });
});
