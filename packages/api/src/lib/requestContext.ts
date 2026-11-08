import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * B2 (PLATFORM_IMPROVEMENT_PLAN) — ambient request context.
 *
 * Every tRPC procedure runs inside requestContext.run (wired in trpc.ts),
 * and every BullMQ worker handler re-establishes the store from the job's
 * `correlationId`. Code that enqueues jobs or logs deep in a call chain
 * (notify, webhooks, analytics) reads the current id here instead of
 * threading it through signatures.
 */
export const requestContext = new AsyncLocalStorage<{ correlationId: string | null }>();

/** The correlation id of the ambient request/job, or null outside one. */
export function getCorrelationId(): string | null {
  return requestContext.getStore()?.correlationId ?? null;
}
