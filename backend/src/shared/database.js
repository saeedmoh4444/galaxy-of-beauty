/**
 * Shared Prisma database client (singleton).
 * Re-exported from shared/ as the canonical import path.
 * Original location: src/config/database.js (now re-exports from here).
 */
export { default } from '../config/database.js';
export { checkDatabaseConnection, disconnectDatabase } from '../config/database.js';
