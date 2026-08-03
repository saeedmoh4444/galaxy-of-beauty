/* eslint-disable @typescript-eslint/no-explicit-any */
import { appRouter, createTRPCContext } from '@galaxy/api';
import superjson from 'superjson';

/**
 * Creates a server-side tRPC caller for use in Server Components.
 * Pre-fetches data without client-side hydration waterfalls.
 *
 * Results are passed through superjson to ensure Decimal, Date, and other
 * Prisma types are serialized to plain objects before reaching Client Components.
 *
 * Usage in a Server Component:
 *   const caller = await getServerCaller();
 *   const categories = await caller.categories.list();
 */
export async function getServerCaller() {
  const ctx = await createTRPCContext();
  const caller = (appRouter as any).createCaller(ctx) as any;

  // Wrap every method to serialize results through superjson.
  // This converts Decimal → Number, Date → ISO string, etc. so that
  // Next.js can safely pass the data to Client Components.
  return new Proxy(caller, {
    get(target, prop) {
      const original = target[prop];
      if (typeof original !== 'object' || original === null) return original;

      return new Proxy(original, {
        get(methodTarget, methodName) {
          const fn = methodTarget[methodName];
          if (typeof fn !== 'function') return fn;

          return async (...args: any[]) => {
            const result = await fn.apply(methodTarget, args);
            // Serialize + deserialize strips non-plain types
            return superjson.parse(superjson.stringify(result));
          };
        },
      });
    },
  });
}
