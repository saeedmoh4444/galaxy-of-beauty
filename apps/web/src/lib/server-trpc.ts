/* eslint-disable @typescript-eslint/no-explicit-any */
import { appRouter, createTRPCContext } from '@galaxy/api';

/** Prisma Decimal duck-type check — avoids depending on @prisma/client directly. */
function isDecimal(v: unknown): v is { toNumber(): number } {
  return (
    typeof v === 'object' &&
    v !== null &&
    'toNumber' in v &&
    typeof (v as Record<string, unknown>).toNumber === 'function' &&
    's' in v && // Decimal internal field
    'e' in v
  );
}

/**
 * Recursively convert Prisma Decimal and Date values to plain JSON-safe types
 * so data can safely cross the Server Component → Client Component boundary.
 */
export function serializeForClient<T>(value: T): T {
  if (value === null || value === undefined) return value;

  if (isDecimal(value)) return Number((value as { toNumber(): number }).toNumber()) as unknown as T;

  if (value instanceof Date) return value.toISOString() as unknown as T;

  if (Array.isArray(value)) {
    return value.map(serializeForClient) as unknown as T;
  }

  if (typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>)) {
      result[key] = serializeForClient((value as Record<string, unknown>)[key]);
    }
    return result as unknown as T;
  }

  return value;
}

/**
 * Creates a server-side tRPC caller for use in Server Components.
 * Pre-fetches data without client-side hydration waterfalls.
 *
 * Usage in a Server Component:
 *   const caller = await getServerCaller();
 *   const cats = serializeForClient(await caller.categories.list());
 */
export async function getServerCaller() {
  const ctx = await createTRPCContext();
  return (appRouter as any).createCaller(ctx) as any;
}
