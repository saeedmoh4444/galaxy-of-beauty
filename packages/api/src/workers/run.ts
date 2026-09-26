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
import { startSubscriptionRenewal, stopSubscriptionRenewal } from './subscriptionRenewal';
import { startInsightsSweep, stopInsightsSweep } from './insightsSweep';
import { startLoyaltyExpirySweep, stopLoyaltyExpirySweep } from './loyaltyExpiry';
import { startWelcomeSeries, stopWelcomeSeries } from './welcomeSeries';
import { startReengagement, stopReengagement } from './reengagement';

// Graceful shutdown
async function shutdown() {
  console.log('[Worker Process] Shutting down...');
  stopTokenCleanup();
  stopSubscriptionRenewal();
  stopInsightsSweep();
  stopLoyaltyExpirySweep();
  stopWelcomeSeries();
  stopReengagement();
  await shutdownWorkers();
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start
console.log('[Worker Process] Starting background job workers + cleanup sweeps...');
startWorkers();
startTokenCleanup();
startSubscriptionRenewal();
startInsightsSweep();
startLoyaltyExpirySweep();
startWelcomeSeries();
startReengagement();
console.log(
  '[Worker Process] Ready — workers + hourly token purge + daily subscription renewal + 3.3 advisor sweep + 8.2 loyalty expiry + 8.3 welcome series + 8.3 re-engagement',
);
