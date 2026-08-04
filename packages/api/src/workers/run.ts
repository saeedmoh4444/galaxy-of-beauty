/**
 * Dedicated worker process entry point.
 *
 * Start via:
 *   pnpm --filter @galaxy/api worker
 *
 * This runs the 4 BullMQ workers (wallet, loyalty, notifications, integrations)
 * as a standalone process. In development, the socket server also starts workers.
 */

import { startWorkers, shutdownWorkers } from './index';
import { startTokenCleanup, stopTokenCleanup } from './tokenCleanup';

// Graceful shutdown
async function shutdown() {
  console.log('[Worker Process] Shutting down...');
  stopTokenCleanup();
  await shutdownWorkers();
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start
console.log('[Worker Process] Starting background job workers + token cleanup...');
startWorkers();
startTokenCleanup();
console.log('[Worker Process] Ready — processing jobs + hourly token purge');
