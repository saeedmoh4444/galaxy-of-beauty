import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const SLOW_QUERY_THRESHOLD_MS = 500;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Prisma 7: connections go through driver adapters (schema no longer carries url).
// Env may not be loaded yet at import time (dotenv loads in the api entry layer),
// so tolerate a missing value — real queries will fail loudly if it stays unset.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? 'postgresql://localhost:5432/placeholder',
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

// ── Slow query logging (Prisma 7: $use middleware is gone → query events) ──
if (typeof process !== 'undefined') {
  prisma.$on('query' as never, (e: { duration: number; query: string; params?: string }) => {
    if (e.duration > SLOW_QUERY_THRESHOLD_MS) {
      console.warn(`[Prisma:SLO] query took ${e.duration.toFixed(0)}ms: ${e.query.slice(0, 120)}`);
    }
  });
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}

if (typeof process !== 'undefined') {
  const shutdown = async () => {
    await disconnectPrisma();
    process.exit(0);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}
