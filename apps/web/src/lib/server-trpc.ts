import { appRouter, createTRPCContext } from '@galaxy/api';

/**
 * Creates a server-side tRPC caller for use in Server Components.
 * Pre-fetches data without client-side hydration waterfalls.
 *
 * Usage in a Server Component:
 *   const caller = await getServerCaller();
 *   const categories = await caller.categories.list();
 */
export async function getServerCaller() {
  const ctx = await createTRPCContext();
  return (appRouter as any).createCaller(ctx) as any;
}
