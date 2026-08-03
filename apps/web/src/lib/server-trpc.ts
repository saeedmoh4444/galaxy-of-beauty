/* eslint-disable @typescript-eslint/no-explicit-any */
import { appRouter, createTRPCContext } from '@galaxy/api';
import superjson from 'superjson';

/**
 * Strip non-plain types (Decimal, Date, etc.) from any value so it can safely
 * cross the Server Component → Client Component boundary.
 */
export function serializeForClient<T>(value: T): T {
  return superjson.parse(superjson.stringify(value)) as T;
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
