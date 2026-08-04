/**
 * In-memory request counters & performance tracker for the monitoring dashboard.
 * Used by the tRPC middleware and the monitoring router.
 *
 * Note: These are per-process counters (reset on restart).
 * For multi-process deployments, use Redis for aggregation.
 */
let totalRequests = 0;
let errorRequests = 0;

// Per-procedure timing: stores last 1000 response times (ms) per endpoint
const procedureTimings = new Map<string, number[]>();
const MAX_SAMPLES = 1000;

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
  procedureTimings.clear();
}

/**
 * Record a procedure's response time (in milliseconds).
 */
export function recordTiming(procedure: string, durationMs: number): void {
  if (!procedureTimings.has(procedure)) {
    procedureTimings.set(procedure, []);
  }
  const samples = procedureTimings.get(procedure)!;
  samples.push(durationMs);
  // Keep only the last N samples
  if (samples.length > MAX_SAMPLES) {
    samples.splice(0, samples.length - MAX_SAMPLES);
  }
}

/**
 * Calculate percentile from an array of numbers.
 */
function percentile(sorted: number[], pct: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.ceil((pct / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)] ?? 0;
}

export interface PerformanceStats {
  avgResponseTime: string;
  p95ResponseTime: string;
  p99ResponseTime: string;
  slowestEndpoints: Array<{ endpoint: string; avgMs: number }>;
}

/**
 * Get aggregated performance stats from collected timings.
 */
export function getPerformanceStats(): PerformanceStats {
  if (procedureTimings.size === 0) {
    return {
      avgResponseTime: 'N/A',
      p95ResponseTime: 'N/A',
      p99ResponseTime: 'N/A',
      slowestEndpoints: [],
    };
  }

  // Aggregate all timings for overall stats
  const allTimings: number[] = [];
  const endpointAvgs: Array<{ endpoint: string; avgMs: number }> = [];

  for (const [endpoint, times] of procedureTimings) {
    if (times.length === 0) continue;
    allTimings.push(...times);
    const sum = times.reduce((a, b) => a + b, 0);
    endpointAvgs.push({
      endpoint: endpoint.replace(/\./g, ' › '),
      avgMs: Math.round(sum / times.length),
    });
  }

  const sorted = [...allTimings].sort((a, b) => a - b);
  const avg = allTimings.length > 0
    ? Math.round(allTimings.reduce((a, b) => a + b, 0) / allTimings.length)
    : 0;

  // Top 3 slowest endpoints
  const slowest = endpointAvgs
    .sort((a, b) => b.avgMs - a.avgMs)
    .slice(0, 5);

  return {
    avgResponseTime: `${avg}ms`,
    p95ResponseTime: `${percentile(sorted, 95)}ms`,
    p99ResponseTime: `${percentile(sorted, 99)}ms`,
    slowestEndpoints: slowest,
  };
}
