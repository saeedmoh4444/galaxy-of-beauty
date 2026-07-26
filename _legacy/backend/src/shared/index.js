/**
 * Shared kernel barrel export.
 *
 * The shared/ layer has ZERO dependencies on services, routes, or jobs.
 * It provides the foundational types and instances everything else builds on.
 */
export { default as prisma, checkDatabaseConnection, disconnectDatabase } from './database.js';
export { AppError, ErrorCodes } from './errors.js';
export { default as events } from './events.js';
