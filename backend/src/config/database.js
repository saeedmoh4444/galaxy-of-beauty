import { PrismaClient } from '@prisma/client';
import env from './env.js';
import logger from './logger.js';

/**
 * Singleton Prisma client instance.
 * In development, we attach it to globalThis to survive hot-reloads.
 */
const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma || new PrismaClient({
  log: env.NODE_ENV === 'development'
    ? ['warn', 'error']
    : ['error'],
  // Connection pool managed via DATABASE_URL query param:
  //   ?connection_limit=5  (dev) or ?connection_limit=20 (prod)
  // Set in your .env or connection string.
});

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Test database connection and log result.
 * @returns {Promise<boolean>}
 */
export async function checkDatabaseConnection() {
  try {
    await prisma.$connect();
    logger.info('PostgreSQL connection established successfully');
    return true;
  } catch (error) {
    logger.error('Failed to connect to PostgreSQL', { error: error.message });
    return false;
  }
}

/**
 * Gracefully disconnect Prisma on shutdown.
 */
export async function disconnectDatabase() {
  await prisma.$disconnect();
  logger.info('PostgreSQL connection closed');
}

export default prisma;
