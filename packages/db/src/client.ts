import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    // Connection pool — sized for typical production workload
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Pool configuration via connection string is preferred,
    // but these defaults ensure safe operation:
    // ?connection_limit=10&pool_timeout=10&connect_timeout=10
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Gracefully disconnect Prisma on process shutdown.
 */
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}

// Register shutdown handlers
if (typeof process !== 'undefined') {
  const shutdown = async () => {
    await disconnectPrisma();
    process.exit(0);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}
