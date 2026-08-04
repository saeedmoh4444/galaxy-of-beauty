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

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[Worker Process] SIGTERM received, shutting down...');
  await shutdownWorkers();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[Worker Process] SIGINT received, shutting down...');
  await shutdownWorkers();
  process.exit(0);
});

// Start
console.log('[Worker Process] Starting background job workers...');
startWorkers();
console.log('[Worker Process] Ready — processing jobs from Redis queues');
