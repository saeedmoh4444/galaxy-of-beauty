/**
 * In-memory request counters for the monitoring dashboard.
 * Used by the tRPC middleware and the monitoring router.
 */
let totalRequests = 0;
let errorRequests = 0;

export function incrementRequestCount(): void {
  totalRequests++;
}

export function incrementErrorCount(): void {
  errorRequests++;
}

export function getRequestCount(): number {
  return totalRequests;
}

export function getErrorCount(): number {
  return errorRequests;
}

export function resetCounters(): void {
  totalRequests = 0;
  errorRequests = 0;
}
