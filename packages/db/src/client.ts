import { PrismaClient } from '@prisma/client';

const SLOW_QUERY_THRESHOLD_MS = 500;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

// ── Slow query logging middleware ──
if (typeof process !== 'undefined') {
  (prisma as any).$use?.(async (params: any, next: any) => {
    const t0 = performance.now();
    const result = await next(params);
    const duration = performance.now() - t0;

    if (duration > SLOW_QUERY_THRESHOLD_MS) {
      console.warn(
        `[Prisma:SLO] ${params.model}.${params.action} took ${duration.toFixed(0)}ms`,
      );
    }
    return result;
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
